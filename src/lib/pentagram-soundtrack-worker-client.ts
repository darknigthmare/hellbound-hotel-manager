import {
  renderPentagramScore,
  type RenderedPentagramScore,
} from './pentagram-soundtrack';
import type { PentagramSoundtrackScore } from './pentagram-stages';

export interface PentagramSoundtrackWorkerRequest {
  type: 'render';
  requestId: number;
  score: PentagramSoundtrackScore;
  sampleRate: number;
}

export type PentagramSoundtrackWorkerResponse =
  | {
      type: 'rendered';
      requestId: number;
      sampleRate: number;
      durationSeconds: number;
      leftBuffer: ArrayBuffer;
      rightBuffer: ArrayBuffer;
    }
  | {
      type: 'error';
      requestId: number;
      message: string;
    };

export interface PentagramSoundtrackWorkerLike {
  onmessage: ((event: MessageEvent<PentagramSoundtrackWorkerResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  onmessageerror: ((event: MessageEvent) => void) | null;
  postMessage(message: PentagramSoundtrackWorkerRequest): void;
  terminate(): void;
}

export interface PentagramSoundtrackRenderClientOptions {
  workerFactory?: () => PentagramSoundtrackWorkerLike | null;
  fallbackRenderer?: (
    score: PentagramSoundtrackScore,
    sampleRate: number,
  ) => RenderedPentagramScore;
}

interface PendingRender {
  resolve: (rendered: RenderedPentagramScore) => void;
  reject: (error: Error) => void;
  removeAbortListener: () => void;
}

function createAbortError(message: string): DOMException {
  return new DOMException(message, 'AbortError');
}

function createDefaultWorker(): PentagramSoundtrackWorkerLike | null {
  if (typeof Worker === 'undefined') return null;
  try {
    return new Worker(
      new URL('../workers/pentagram-soundtrack.worker.ts', import.meta.url),
      { type: 'module', name: 'pentagram-soundtrack-renderer' },
    );
  } catch {
    return null;
  }
}

function scheduleFallback(callback: () => void): () => void {
  const timeoutId = globalThis.setTimeout(callback, 0);
  return () => globalThis.clearTimeout(timeoutId);
}

/**
 * Owns one short-lived PCM worker at a time. Successful workers are terminated
 * after transferring their buffers, so no renderer thread or PCM copy remains
 * resident between stage renders.
 */
export class PentagramSoundtrackRenderClient {
  private readonly workerFactory: () => PentagramSoundtrackWorkerLike | null;
  private readonly fallbackRenderer: (
    score: PentagramSoundtrackScore,
    sampleRate: number,
  ) => RenderedPentagramScore;
  private worker: PentagramSoundtrackWorkerLike | null = null;
  private nextRequestId = 1;
  private disposed = false;
  private readonly pending = new Map<number, PendingRender>();
  private readonly fallbackCancels = new Set<() => void>();

  constructor(options: PentagramSoundtrackRenderClientOptions = {}) {
    this.workerFactory = options.workerFactory ?? createDefaultWorker;
    this.fallbackRenderer = options.fallbackRenderer ?? renderPentagramScore;
  }

  render(
    score: PentagramSoundtrackScore,
    sampleRate: number,
    signal?: AbortSignal,
  ): Promise<RenderedPentagramScore> {
    if (this.disposed) {
      return Promise.reject(createAbortError('Pentagram soundtrack renderer was disposed.'));
    }
    if (signal?.aborted) {
      return Promise.reject(createAbortError('Pentagram soundtrack render was cancelled.'));
    }

    const worker = this.ensureWorker();
    if (!worker) return this.renderFallback(score, sampleRate, signal);

    const requestId = this.nextRequestId;
    this.nextRequestId += 1;

    return new Promise<RenderedPentagramScore>((resolve, reject) => {
      const handleAbort = () => {
        if (!this.pending.has(requestId)) return;
        this.failWorker(createAbortError('Pentagram soundtrack render was cancelled.'));
      };
      signal?.addEventListener('abort', handleAbort, { once: true });
      this.pending.set(requestId, {
        resolve,
        reject,
        removeAbortListener: () => signal?.removeEventListener('abort', handleAbort),
      });

      try {
        worker.postMessage({
          type: 'render',
          requestId,
          score,
          sampleRate,
        });
      } catch (error) {
        this.failWorker(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.failWorker(createAbortError('Pentagram soundtrack renderer was disposed.'));
    for (const cancel of [...this.fallbackCancels]) cancel();
    this.fallbackCancels.clear();
  }

  private ensureWorker(): PentagramSoundtrackWorkerLike | null {
    if (this.worker) return this.worker;
    let worker: PentagramSoundtrackWorkerLike | null;
    try {
      worker = this.workerFactory();
    } catch {
      worker = null;
    }
    if (!worker) return null;

    worker.onmessage = (event) => this.handleWorkerMessage(worker, event.data);
    worker.onerror = (event) => {
      event.preventDefault();
      this.failWorker(new Error(event.message || 'Pentagram soundtrack worker failed.'));
    };
    worker.onmessageerror = () => {
      this.failWorker(new Error('Pentagram soundtrack worker returned unreadable data.'));
    };
    this.worker = worker;
    return worker;
  }

  private handleWorkerMessage(
    worker: PentagramSoundtrackWorkerLike,
    response: PentagramSoundtrackWorkerResponse,
  ): void {
    if (worker !== this.worker) return;
    const pending = this.pending.get(response.requestId);
    if (!pending) return;

    this.pending.delete(response.requestId);
    pending.removeAbortListener();
    if (response.type === 'error') {
      pending.reject(new Error(response.message));
      this.retireWorkerIfIdle();
      return;
    }

    try {
      const left = new Float32Array(response.leftBuffer);
      const right = new Float32Array(response.rightBuffer);
      if (left.length === 0 || left.length !== right.length) {
        throw new Error('Pentagram soundtrack worker returned invalid channel lengths.');
      }
      pending.resolve({
        left,
        right,
        sampleRate: response.sampleRate,
        durationSeconds: response.durationSeconds,
      });
    } catch (error) {
      pending.reject(error instanceof Error ? error : new Error(String(error)));
    }
    this.retireWorkerIfIdle();
  }

  private renderFallback(
    score: PentagramSoundtrackScore,
    sampleRate: number,
    signal?: AbortSignal,
  ): Promise<RenderedPentagramScore> {
    return new Promise<RenderedPentagramScore>((resolve, reject) => {
      let settled = false;
      let cancelSchedule: () => void = () => undefined;
      const finish = (
        callback: () => void,
      ) => {
        if (settled) return;
        settled = true;
        cancelSchedule();
        this.fallbackCancels.delete(handleAbort);
        signal?.removeEventListener('abort', handleAbort);
        callback();
      };
      const handleAbort = () => {
        finish(() => reject(createAbortError('Pentagram soundtrack render was cancelled.')));
      };
      signal?.addEventListener('abort', handleAbort, { once: true });
      this.fallbackCancels.add(handleAbort);
      cancelSchedule = scheduleFallback(() => {
        if (signal?.aborted || this.disposed) {
          handleAbort();
          return;
        }
        try {
          const rendered = this.fallbackRenderer(score, sampleRate);
          if (signal?.aborted || this.disposed) {
            handleAbort();
            return;
          }
          finish(() => resolve(rendered));
        } catch (error) {
          finish(() => reject(error instanceof Error ? error : new Error(String(error))));
        }
      });
    });
  }

  private failWorker(error: Error): void {
    const worker = this.worker;
    this.worker = null;
    if (worker) {
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();
    }
    for (const pending of this.pending.values()) {
      pending.removeAbortListener();
      pending.reject(error);
    }
    this.pending.clear();
  }

  private retireWorkerIfIdle(): void {
    if (this.pending.size > 0 || !this.worker) return;
    const worker = this.worker;
    this.worker = null;
    worker.onmessage = null;
    worker.onerror = null;
    worker.onmessageerror = null;
    worker.terminate();
  }
}
