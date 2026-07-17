import { renderPentagramScore } from '../lib/pentagram-soundtrack';
import type {
  PentagramSoundtrackWorkerRequest,
  PentagramSoundtrackWorkerResponse,
} from '../lib/pentagram-soundtrack-worker-client';

interface PentagramWorkerScope {
  onmessage: ((event: MessageEvent<PentagramSoundtrackWorkerRequest>) => void) | null;
  postMessage(message: PentagramSoundtrackWorkerResponse, transfer: Transferable[]): void;
}

const workerScope = globalThis as unknown as PentagramWorkerScope;

workerScope.onmessage = (event) => {
  const request = event.data;
  if (request.type !== 'render') return;

  try {
    const rendered = renderPentagramScore(request.score, request.sampleRate);
    const leftBuffer = rendered.left.buffer as ArrayBuffer;
    const rightBuffer = rendered.right.buffer as ArrayBuffer;
    workerScope.postMessage({
      type: 'rendered',
      requestId: request.requestId,
      sampleRate: rendered.sampleRate,
      durationSeconds: rendered.durationSeconds,
      leftBuffer,
      rightBuffer,
    }, [leftBuffer, rightBuffer]);
  } catch (error) {
    workerScope.postMessage({
      type: 'error',
      requestId: request.requestId,
      message: error instanceof Error ? error.message : String(error),
    }, []);
  }
};
