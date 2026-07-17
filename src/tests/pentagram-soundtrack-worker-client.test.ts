import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PentagramSoundtrackRenderClient,
  type PentagramSoundtrackWorkerLike,
  type PentagramSoundtrackWorkerRequest,
  type PentagramSoundtrackWorkerResponse,
} from '../lib/pentagram-soundtrack-worker-client';
import { DEFAULT_PENTAGRAM_STAGE } from '../lib/pentagram-stages';

class ControlledWorker implements PentagramSoundtrackWorkerLike {
  onmessage: ((event: MessageEvent<PentagramSoundtrackWorkerResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  request: PentagramSoundtrackWorkerRequest | null = null;
  terminated = false;

  postMessage(message: PentagramSoundtrackWorkerRequest): void {
    this.request = message;
  }

  terminate(): void {
    this.terminated = true;
  }

  respond(left: Float32Array, right: Float32Array): void {
    const request = this.request;
    if (!request) throw new Error('No pending soundtrack request.');
    this.onmessage?.({
      data: {
        type: 'rendered',
        requestId: request.requestId,
        sampleRate: request.sampleRate,
        durationSeconds: left.length / request.sampleRate,
        leftBuffer: left.buffer as ArrayBuffer,
        rightBuffer: right.buffer as ArrayBuffer,
      },
    } as MessageEvent<PentagramSoundtrackWorkerResponse>);
  }

  respondWithError(message: string): void {
    const request = this.request;
    if (!request) throw new Error('No pending soundtrack request.');
    this.onmessage?.({
      data: {
        type: 'error',
        requestId: request.requestId,
        message,
      },
    } as MessageEvent<PentagramSoundtrackWorkerResponse>);
  }
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('Pentagram soundtrack worker client', () => {
  it('reconstructs transferred stereo buffers and retires the worker', async () => {
    const worker = new ControlledWorker();
    const client = new PentagramSoundtrackRenderClient({
      workerFactory: () => worker,
    });

    const renderedPromise = client.render(DEFAULT_PENTAGRAM_STAGE.soundtrack, 8_000);
    expect(worker.request).toMatchObject({
      type: 'render',
      score: DEFAULT_PENTAGRAM_STAGE.soundtrack,
      sampleRate: 8_000,
    });

    worker.respond(
      new Float32Array([0.1, 0.2, 0.3]),
      new Float32Array([-0.1, -0.2, -0.3]),
    );
    const rendered = await renderedPromise;

    expect([...rendered.left]).toEqual([
      expect.closeTo(0.1),
      expect.closeTo(0.2),
      expect.closeTo(0.3),
    ]);
    expect([...rendered.right]).toEqual([
      expect.closeTo(-0.1),
      expect.closeTo(-0.2),
      expect.closeTo(-0.3),
    ]);
    expect(worker.terminated).toBe(true);
  });

  it('terminates the active worker and rejects with AbortError on cancellation', async () => {
    const worker = new ControlledWorker();
    const client = new PentagramSoundtrackRenderClient({
      workerFactory: () => worker,
    });
    const abortController = new AbortController();

    const renderedPromise = client.render(
      DEFAULT_PENTAGRAM_STAGE.soundtrack,
      8_000,
      abortController.signal,
    );
    abortController.abort();

    await expect(renderedPromise).rejects.toMatchObject({ name: 'AbortError' });
    expect(worker.terminated).toBe(true);
  });

  it('surfaces a renderer error and retires the failed worker', async () => {
    const worker = new ControlledWorker();
    const client = new PentagramSoundtrackRenderClient({
      workerFactory: () => worker,
    });
    const renderedPromise = client.render(DEFAULT_PENTAGRAM_STAGE.soundtrack, 8_000);

    worker.respondWithError('synthetic renderer failure');

    await expect(renderedPromise).rejects.toThrow('synthetic renderer failure');
    expect(worker.terminated).toBe(true);
  });

  it('disposes a pending worker request without leaving its promise open', async () => {
    const worker = new ControlledWorker();
    const client = new PentagramSoundtrackRenderClient({
      workerFactory: () => worker,
    });
    const renderedPromise = client.render(DEFAULT_PENTAGRAM_STAGE.soundtrack, 8_000);

    client.dispose();

    await expect(renderedPromise).rejects.toMatchObject({ name: 'AbortError' });
    expect(worker.terminated).toBe(true);
  });

  it('yields before the safe fallback and cancels it before synthesis starts', async () => {
    vi.useFakeTimers();
    const fallbackRenderer = vi.fn(() => ({
      left: new Float32Array([0.25]),
      right: new Float32Array([-0.25]),
      sampleRate: 8_000,
      durationSeconds: 1 / 8_000,
    }));
    const client = new PentagramSoundtrackRenderClient({
      workerFactory: () => null,
      fallbackRenderer,
    });

    const renderedPromise = client.render(DEFAULT_PENTAGRAM_STAGE.soundtrack, 8_000);
    expect(fallbackRenderer).not.toHaveBeenCalled();
    await vi.runAllTimersAsync();
    await expect(renderedPromise).resolves.toMatchObject({ sampleRate: 8_000 });
    expect(fallbackRenderer).toHaveBeenCalledTimes(1);

    const abortController = new AbortController();
    const cancelledPromise = client.render(
      DEFAULT_PENTAGRAM_STAGE.soundtrack,
      8_000,
      abortController.signal,
    );
    abortController.abort();
    await expect(cancelledPromise).rejects.toMatchObject({ name: 'AbortError' });
    await vi.runAllTimersAsync();
    expect(fallbackRenderer).toHaveBeenCalledTimes(1);
  });
});
