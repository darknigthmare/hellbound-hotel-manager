// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePentagramCombatSoundtrack } from '../components/usePentagramCombatSoundtrack';
import type {
  PentagramSoundtrackWorkerRequest,
  PentagramSoundtrackWorkerResponse,
} from '../lib/pentagram-soundtrack-worker-client';
import { DEFAULT_PENTAGRAM_STAGE } from '../lib/pentagram-stages';

class DeferredSoundtrackWorker {
  static latest: DeferredSoundtrackWorker | null = null;

  onmessage: ((event: MessageEvent<PentagramSoundtrackWorkerResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  request: PentagramSoundtrackWorkerRequest | null = null;
  terminated = false;

  constructor() {
    DeferredSoundtrackWorker.latest = this;
  }

  postMessage(message: PentagramSoundtrackWorkerRequest) {
    this.request = message;
  }

  terminate() {
    this.terminated = true;
  }
}

class FakeAudioContext {
  static latest: FakeAudioContext | null = null;
  static instances: FakeAudioContext[] = [];
  static sources: AudioBufferSourceNode[] = [];

  state: AudioContextState = 'suspended';
  sampleRate = 4_000;
  currentTime = 0;
  destination = {} as AudioDestinationNode;
  suspendCalls = 0;
  resumeCalls = 0;
  private finishPendingSuspend: (() => void) | null = null;

  constructor() {
    FakeAudioContext.latest = this;
    FakeAudioContext.instances.push(this);
  }

  resume = vi.fn(async () => {
    this.resumeCalls += 1;
    this.state = 'running';
  });

  suspend = vi.fn(() => {
    this.suspendCalls += 1;
    return new Promise<void>((resolve) => {
      this.finishPendingSuspend = () => {
        this.state = 'suspended';
        this.finishPendingSuspend = null;
        resolve();
      };
    });
  });

  finishSuspend() {
    this.finishPendingSuspend?.();
  }

  createBuffer(_channels: number, length: number, sampleRate: number) {
    void sampleRate;
    const data = [new Float32Array(length), new Float32Array(length)];
    return {
      getChannelData: (channel: number) => data[channel],
    } as AudioBuffer;
  }

  createBufferSource() {
    const source = {
      buffer: null,
      loop: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    } as unknown as AudioBufferSourceNode;
    FakeAudioContext.sources.push(source);
    return source;
  }

  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as GainNode;
  }

  close = vi.fn(async () => {
    this.state = 'closed';
  });
}

function SoundtrackHarness() {
  const soundtrack = usePentagramCombatSoundtrack();

  return (
    <>
      <output aria-label="Soundtrack status">{soundtrack.status}</output>
      <button
        type="button"
        onClick={() => {
          void soundtrack.start(DEFAULT_PENTAGRAM_STAGE.soundtrack);
        }}
      >
        Start
      </button>
      <button
        type="button"
        onClick={() => {
          void soundtrack.start(DEFAULT_PENTAGRAM_STAGE.soundtrack, { paused: true });
        }}
      >
        Start paused
      </button>
      <button type="button" onClick={soundtrack.stop}>Stop</button>
      <button type="button" onClick={soundtrack.release}>Release</button>
      <button type="button" onClick={soundtrack.pause}>Pause</button>
      <button type="button" onClick={soundtrack.resume}>Resume</button>
    </>
  );
}

beforeEach(() => {
  DeferredSoundtrackWorker.latest = null;
  FakeAudioContext.latest = null;
  FakeAudioContext.instances = [];
  FakeAudioContext.sources = [];
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('Worker', undefined);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Pentagram procedural soundtrack lifecycle', () => {
  it('serializes a fast pause/resume instead of finishing in a suspended state', async () => {
    render(<SoundtrackHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await waitFor(() => {
      expect(screen.getByLabelText('Soundtrack status').textContent).toBe('playing');
    });

    const context = FakeAudioContext.latest;
    expect(context).toBeTruthy();
    if (!context) return;

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    await waitFor(() => expect(context.suspendCalls).toBe(1));
    expect(screen.getByLabelText('Soundtrack status').textContent).toBe('playing');

    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    await act(async () => {
      context.finishSuspend();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Soundtrack status').textContent).toBe('playing');
      expect(context.state).toBe('running');
    });
    expect(context.resumeCalls).toBeGreaterThanOrEqual(2);
  });

  it('starts a requested paused soundtrack without resuming the audio context', async () => {
    render(<SoundtrackHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Start paused' }));
    await waitFor(() => {
      expect(screen.getByLabelText('Soundtrack status').textContent).toBe('paused');
    });

    const context = FakeAudioContext.latest;
    expect(context).toBeTruthy();
    if (!context) return;
    expect(context.resumeCalls).toBe(0);
    expect(context.state).toBe('suspended');
    expect(FakeAudioContext.sources).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    await waitFor(() => {
      expect(screen.getByLabelText('Soundtrack status').textContent).toBe('playing');
      expect(context.state).toBe('running');
    });
    expect(context.resumeCalls).toBe(1);
  });

  it('finishes suspending an active context before starting a paused replacement source', async () => {
    render(<SoundtrackHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await waitFor(() => {
      expect(screen.getByLabelText('Soundtrack status').textContent).toBe('playing');
    });
    const context = FakeAudioContext.latest;
    expect(context).toBeTruthy();
    if (!context) return;

    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start paused' }));
    await waitFor(() => expect(context.suspendCalls).toBe(1));
    expect(FakeAudioContext.sources).toHaveLength(1);

    await act(async () => {
      context.finishSuspend();
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(screen.getByLabelText('Soundtrack status').textContent).toBe('paused');
      expect(FakeAudioContext.sources).toHaveLength(2);
    });
    expect(context.state).toBe('suspended');
  });

  it('closes and recreates the audio context after a fight release', async () => {
    render(<SoundtrackHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await waitFor(() => {
      expect(screen.getByLabelText('Soundtrack status').textContent).toBe('playing');
    });
    const firstContext = FakeAudioContext.latest;
    expect(firstContext).toBeTruthy();
    if (!firstContext) return;

    fireEvent.click(screen.getByRole('button', { name: 'Release' }));
    await waitFor(() => {
      expect(firstContext.close).toHaveBeenCalledTimes(1);
      expect(screen.getByLabelText('Soundtrack status').textContent).toBe('idle');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await waitFor(() => {
      expect(screen.getByLabelText('Soundtrack status').textContent).toBe('playing');
    });
    expect(FakeAudioContext.instances).toHaveLength(2);
    expect(FakeAudioContext.latest).not.toBe(firstContext);
  });

  it('terminates a pending render and ignores late work when the fight is released', async () => {
    vi.stubGlobal('Worker', DeferredSoundtrackWorker);
    render(<SoundtrackHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await waitFor(() => expect(DeferredSoundtrackWorker.latest).toBeTruthy());
    const worker = DeferredSoundtrackWorker.latest;
    const context = FakeAudioContext.latest;
    expect(worker).toBeTruthy();
    expect(context).toBeTruthy();
    if (!worker || !context) return;
    expect(FakeAudioContext.sources).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: 'Release' }));
    await waitFor(() => {
      expect(worker.terminated).toBe(true);
      expect(context.close).toHaveBeenCalledTimes(1);
      expect(screen.getByLabelText('Soundtrack status').textContent).toBe('idle');
    });
    expect(worker.onmessage).toBeNull();
    expect(FakeAudioContext.sources).toHaveLength(0);
  });
});
