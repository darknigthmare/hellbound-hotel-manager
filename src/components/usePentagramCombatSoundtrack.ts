import { useCallback, useEffect, useRef, useState } from 'react';
import { PentagramSoundtrackRenderClient } from '../lib/pentagram-soundtrack-worker-client';
import type { PentagramSoundtrackScore } from '../lib/pentagram-stages';

export type PentagramSoundtrackStatus = 'idle' | 'playing' | 'paused' | 'unavailable';
export type PentagramSoundtrackStartResult = 'started' | 'cancelled' | 'unavailable';

export interface PentagramSoundtrackStartOptions {
  paused?: boolean;
}

type AudioContextConstructor = new () => AudioContext;
type ContextSynchronizationResult = 'aligned' | 'changed' | 'cancelled' | 'failed';

function getAudioContextConstructor(): AudioContextConstructor | undefined {
  if (typeof window === 'undefined') return undefined;
  const audioWindow = window as Window & {
    webkitAudioContext?: AudioContextConstructor;
  };
  return window.AudioContext ?? audioWindow.webkitAudioContext;
}

function isAbortError(error: unknown): boolean {
  return typeof DOMException !== 'undefined'
    && error instanceof DOMException
    && error.name === 'AbortError';
}

export function usePentagramCombatSoundtrack() {
  const [status, setStatus] = useState<PentagramSoundtrackStatus>('idle');
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const bufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const renderClientRef = useRef<PentagramSoundtrackRenderClient | null>(null);
  const renderAbortRef = useRef<AbortController | null>(null);
  const statusRef = useRef<PentagramSoundtrackStatus>('idle');
  const requestRef = useRef(0);
  const disposedRef = useRef(false);
  const pauseRequestedRef = useRef(false);
  const contextOperationRef = useRef<Promise<void>>(Promise.resolve());

  const updateStatus = useCallback((nextStatus: PentagramSoundtrackStatus) => {
    statusRef.current = nextStatus;
    if (!disposedRef.current) setStatus(nextStatus);
  }, []);

  const releaseSource = useCallback(() => {
    const source = sourceRef.current;
    sourceRef.current = null;
    if (source) {
      try {
        source.stop();
      } catch {
        // A source can already be stopped during a fast quit/remount.
      }
      source.buffer = null;
      source.disconnect();
    }
    masterGainRef.current?.disconnect();
    masterGainRef.current = null;
  }, []);

  const synchronizeContextOnce = useCallback((
    context: AudioContext,
    requestId: number,
    source?: AudioBufferSourceNode,
  ): Promise<ContextSynchronizationResult> => {
    const isCurrent = () => (
      requestRef.current === requestId
      && !disposedRef.current
      && (!source || sourceRef.current === source)
      && contextRef.current === context
    );

    const operation = contextOperationRef.current
      .catch(() => undefined)
      .then(async (): Promise<ContextSynchronizationResult> => {
        if (!isCurrent()) return 'cancelled';

        const shouldPause = pauseRequestedRef.current;
        try {
          if (shouldPause) {
            if (context.state === 'running') await context.suspend();
          } else if (context.state === 'suspended') {
            await context.resume();
          }
        } catch {
          if (isCurrent()) updateStatus('unavailable');
          return 'failed';
        }

        if (!isCurrent()) return 'cancelled';
        if (pauseRequestedRef.current !== shouldPause) return 'changed';

        if (source) updateStatus(shouldPause ? 'paused' : 'playing');
        return 'aligned';
      });

    contextOperationRef.current = operation.then(() => undefined);
    return operation;
  }, [updateStatus]);

  const synchronizeContextUntilStable = useCallback(async (
    context: AudioContext,
    requestId: number,
    source?: AudioBufferSourceNode,
  ): Promise<Exclude<ContextSynchronizationResult, 'changed'>> => {
    while (true) {
      const result = await synchronizeContextOnce(context, requestId, source);
      if (result !== 'changed') return result;
    }
  }, [synchronizeContextOnce]);

  const stop = useCallback(() => {
    requestRef.current += 1;
    pauseRequestedRef.current = false;
    renderAbortRef.current?.abort();
    renderAbortRef.current = null;
    releaseSource();
    updateStatus('idle');
  }, [releaseSource, updateStatus]);

  const release = useCallback(() => {
    requestRef.current += 1;
    pauseRequestedRef.current = false;
    renderAbortRef.current?.abort();
    renderAbortRef.current = null;
    releaseSource();
    bufferCacheRef.current.clear();
    renderClientRef.current?.dispose();
    renderClientRef.current = null;

    const context = contextRef.current;
    contextRef.current = null;
    contextOperationRef.current = Promise.resolve();
    if (context && context.state !== 'closed') {
      void context.close().catch(() => undefined);
    }
    updateStatus('idle');
  }, [releaseSource, updateStatus]);

  const start = useCallback(async (
    score: PentagramSoundtrackScore,
    options: PentagramSoundtrackStartOptions = {},
  ): Promise<PentagramSoundtrackStartResult> => {
    const AudioContextClass = getAudioContextConstructor();
    if (!AudioContextClass) {
      updateStatus('unavailable');
      return 'unavailable';
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    pauseRequestedRef.current = options.paused ?? false;
    renderAbortRef.current?.abort();
    renderAbortRef.current = null;
    releaseSource();

    let activeRenderController: AbortController | null = null;
    try {
      let context = contextRef.current;
      if (!context || context.state === 'closed') {
        context = new AudioContextClass();
        contextRef.current = context;
        bufferCacheRef.current.clear();
      }

      // Invoke resume during the originating click task. The definitive state
      // is still serialized below after the asynchronous render completes.
      if (!pauseRequestedRef.current && context.state === 'suspended') {
        void context.resume().catch(() => undefined);
      }

      // A 22.05 kHz source is enough for the deliberately gritty cabaret
      // timbre and halves generation cost; Web Audio resamples it on output.
      const renderRate = Math.min(context.sampleRate, 22_050);
      const cacheKey = `${score.id}@${renderRate}`;
      let buffer = bufferCacheRef.current.get(cacheKey);
      if (!buffer) {
        const abortController = new AbortController();
        activeRenderController = abortController;
        renderAbortRef.current = abortController;
        const renderClient = renderClientRef.current
          ?? new PentagramSoundtrackRenderClient();
        renderClientRef.current = renderClient;
        const rendered = await renderClient.render(score, renderRate, abortController.signal);
        if (renderAbortRef.current === abortController) renderAbortRef.current = null;
        if (
          requestRef.current !== requestId
          || disposedRef.current
          || abortController.signal.aborted
          || contextRef.current !== context
        ) return 'cancelled';

        buffer = context.createBuffer(2, rendered.left.length, rendered.sampleRate);
        buffer.getChannelData(0).set(rendered.left);
        buffer.getChannelData(1).set(rendered.right);
        bufferCacheRef.current.set(cacheKey, buffer);
      }

      // Align the context before source.start(): a paused request must never
      // leak a short audible fragment while a suspension is still pending.
      const preparation = await synchronizeContextUntilStable(context, requestId);
      if (preparation === 'cancelled') return 'cancelled';
      if (preparation === 'failed') return 'unavailable';

      const source = context.createBufferSource();
      const masterGain = context.createGain();
      source.buffer = buffer;
      source.loop = true;
      masterGain.gain.setValueAtTime(0.0001, context.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.12);
      source.connect(masterGain);
      masterGain.connect(context.destination);
      sourceRef.current = source;
      masterGainRef.current = masterGain;
      source.start();

      const synchronization = await synchronizeContextUntilStable(context, requestId, source);
      if (synchronization === 'cancelled') return 'cancelled';
      if (synchronization === 'failed') {
        if (sourceRef.current === source) releaseSource();
        return 'unavailable';
      }
      return 'started';
    } catch (error) {
      if (
        isAbortError(error)
        || requestRef.current !== requestId
        || disposedRef.current
      ) return 'cancelled';

      releaseSource();
      updateStatus('unavailable');
      return 'unavailable';
    } finally {
      if (renderAbortRef.current === activeRenderController) {
        renderAbortRef.current = null;
      }
    }
  }, [
    releaseSource,
    synchronizeContextUntilStable,
    updateStatus,
  ]);

  const pause = useCallback(() => {
    pauseRequestedRef.current = true;
    const context = contextRef.current;
    if (!context) return;
    const source = sourceRef.current ?? undefined;
    void synchronizeContextOnce(context, requestRef.current, source);
  }, [synchronizeContextOnce]);

  const resume = useCallback(() => {
    pauseRequestedRef.current = false;
    const context = contextRef.current;
    if (!context) return;

    // Capture the browser's user activation even if an older suspend is still
    // queued; the serialized operation below makes the latest intent win.
    if (context.state === 'suspended') {
      void context.resume().catch(() => undefined);
    }
    const source = sourceRef.current ?? undefined;
    void synchronizeContextOnce(context, requestRef.current, source);
  }, [synchronizeContextOnce]);

  useEffect(() => {
    disposedRef.current = false;
    const bufferCache = bufferCacheRef.current;
    return () => {
      disposedRef.current = true;
      requestRef.current += 1;
      pauseRequestedRef.current = false;
      renderAbortRef.current?.abort();
      renderAbortRef.current = null;
      releaseSource();
      bufferCache.clear();
      renderClientRef.current?.dispose();
      renderClientRef.current = null;
      const context = contextRef.current;
      contextRef.current = null;
      contextOperationRef.current = Promise.resolve();
      if (context && context.state !== 'closed') {
        void context.close().catch(() => undefined);
      }
    };
  }, [releaseSource]);

  return {
    status,
    start,
    stop,
    release,
    pause,
    resume,
  };
}
