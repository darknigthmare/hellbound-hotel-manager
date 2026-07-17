import type { PentagramSoundtrackScore } from './pentagram-stages';

export interface RenderedPentagramScore {
  left: Float32Array;
  right: Float32Array;
  sampleRate: number;
  durationSeconds: number;
}

const TAU = Math.PI * 2;

function midiToFrequency(note: number): number {
  return 440 * (2 ** ((note - 69) / 12));
}

function deterministicNoise(sampleIndex: number, seed: number): number {
  let value = (sampleIndex + seed * 1013) | 0;
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value ^= value >>> 16;
  return ((value >>> 0) / 0xffffffff) * 2 - 1;
}

function triangle(phase: number): number {
  return 1 - 4 * Math.abs(Math.round(phase) - phase);
}

function softClip(value: number): number {
  return Math.tanh(value * 1.35) * 0.72;
}

/**
 * Renders a deterministic, original cabaret/jazz-electro loop. The synthesis
 * uses only generated oscillators and seeded noise: no samples, dialogue,
 * melodies or stems from Hazbin Hotel are included.
 */
export function renderPentagramScore(
  score: PentagramSoundtrackScore,
  requestedSampleRate = 22_050,
): RenderedPentagramScore {
  if (!Number.isFinite(requestedSampleRate) || requestedSampleRate < 4_000) {
    throw new RangeError('Pentagram soundtrack sample rate must be at least 4000 Hz.');
  }
  if (score.chordProgression.length === 0) {
    throw new RangeError('Pentagram soundtrack requires at least one chord.');
  }

  const sampleRate = Math.min(48_000, Math.round(requestedSampleRate));
  const beatSeconds = 60 / score.bpm;
  const durationSeconds = score.chordProgression.length * 4 * beatSeconds;
  const sampleCount = Math.ceil(durationSeconds * sampleRate);
  const left = new Float32Array(sampleCount);
  const right = new Float32Array(sampleCount);
  const echoSamples = Math.max(1, Math.round(beatSeconds * 0.75 * sampleRate));
  const leadPattern = score.leadPattern.length > 0 ? score.leadPattern : [null];
  const bassPattern = score.bassPattern.length > 0 ? score.bassPattern : [0];
  const swingSplit = 0.5 + Math.max(0, Math.min(1, score.swing)) * 0.14;
  const drive = Math.max(0, Math.min(1, score.drive));

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const beatPosition = time / beatSeconds;
    const wholeBeat = Math.floor(beatPosition);
    const beatInBar = wholeBeat % 4;
    const barIndex = Math.floor(beatPosition / 4) % score.chordProgression.length;
    const beatPhase = beatPosition - wholeBeat;
    const inFirstEighth = beatPhase < swingSplit;
    const eighthInBeat = inFirstEighth ? 0 : 1;
    const eighthPhase = inFirstEighth
      ? beatPhase / swingSplit
      : (beatPhase - swingSplit) / (1 - swingSplit);
    const eighthStep = wholeBeat * 2 + eighthInBeat;
    const chord = score.chordProgression[barIndex];
    const chordRoot = chord[0] ?? 0;

    const kickActive = beatInBar === 0
      || beatInBar === 2
      || (drive > 0.85 && beatInBar === 3 && !inFirstEighth);
    const kickEnvelope = kickActive ? Math.exp(-beatPhase * 15) : 0;
    const kickPitch = 92 - Math.min(55, beatPhase * 80);
    const kick = Math.sin(TAU * kickPitch * time) * kickEnvelope * (0.24 + drive * 0.12);

    const noise = deterministicNoise(index, score.seed);
    const snareActive = beatInBar === 1 || beatInBar === 3;
    const snareEnvelope = snareActive ? Math.exp(-beatPhase * 18) : 0;
    const snare = (
      noise * 0.26
      + Math.sin(TAU * 176 * time) * 0.09
    ) * snareEnvelope * (0.65 + drive * 0.28);

    const hatEnvelope = Math.exp(-eighthPhase * (24 - drive * 5));
    const hat = noise * hatEnvelope * (inFirstEighth ? 0.052 : 0.075 + drive * 0.025);

    const bassInterval = bassPattern[eighthStep % bassPattern.length] ?? 0;
    const bassFrequency = midiToFrequency(score.rootMidi + chordRoot + bassInterval);
    const bassEnvelope = Math.exp(-eighthPhase * 2.8);
    const bassPhase = bassFrequency * time;
    const bass = (
      Math.sin(TAU * bassPhase) * 0.76
      + triangle(bassPhase) * 0.24
    ) * bassEnvelope * (0.13 + drive * 0.045);

    const chordHit = beatInBar === 1 || beatInBar === 3;
    const chordEnvelope = chordHit ? Math.exp(-beatPhase * (3.5 - score.swing * 0.8)) : 0;
    let chordVoice = 0;
    for (let noteIndex = 0; noteIndex < chord.length; noteIndex += 1) {
      const frequency = midiToFrequency(score.rootMidi + 12 + chord[noteIndex]);
      const phase = frequency * time;
      chordVoice += (
        Math.sin(TAU * phase)
        + triangle(phase * 0.5) * 0.28
      ) / chord.length;
    }
    chordVoice *= chordEnvelope * 0.17;

    const leadInterval = leadPattern[eighthStep % leadPattern.length];
    const leadFrequency = leadInterval === null
      ? 0
      : midiToFrequency(score.rootMidi + 12 + chordRoot + leadInterval);
    const leadEnvelope = leadInterval === null
      ? 0
      : Math.exp(-eighthPhase * 3.6) * Math.min(1, eighthPhase * 18);
    const leadPhase = leadFrequency * time;
    const lead = leadInterval === null
      ? 0
      : (
        Math.sin(TAU * leadPhase) * 0.72
        + Math.sin(TAU * leadPhase * 2) * 0.2
        + triangle(leadPhase) * 0.08
      ) * leadEnvelope * (0.075 + drive * 0.025);

    const boundaryFadeSeconds = 0.012;
    const boundaryFade = Math.min(
      1,
      time / boundaryFadeSeconds,
      (durationSeconds - time) / boundaryFadeSeconds,
    );
    const dryLeft = kick + snare * 0.78 + hat * 0.72 + bass * 1.05 + chordVoice * 0.88 + lead * 0.7;
    const dryRight = kick + snare * 0.9 + hat + bass * 0.92 + chordVoice * 1.08 + lead;
    const echoLeft = index >= echoSamples ? right[index - echoSamples] * 0.13 : 0;
    const echoRight = index >= echoSamples ? left[index - echoSamples] * 0.16 : 0;
    left[index] = softClip(dryLeft + echoLeft) * boundaryFade;
    right[index] = softClip(dryRight + echoRight) * boundaryFade;
  }

  return {
    left,
    right,
    sampleRate,
    durationSeconds,
  };
}
