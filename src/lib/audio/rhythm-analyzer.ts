/**
 * Rhythm / timing analyzer for exercise playback.
 *
 * Builds a beat grid from a BPM and subdivision count, detects note
 * onsets via amplitude transitions, and scores timing accuracy.
 */

/** Minimum RMS to consider the signal "sounding". */
const ONSET_THRESHOLD = 0.015;

/** How many ms of silence before we allow a new onset. */
const ONSET_DEBOUNCE_MS = 60;

export interface BeatGrid {
  bpm: number;
  subdivisions: number;
  /** Absolute timestamps (performance.now) for each expected beat. */
  beats: number[];
  /** Interval between beats in ms. */
  intervalMs: number;
}

export interface OnsetEvent {
  /** performance.now() timestamp of the detected onset. */
  timestamp: number;
  /** RMS amplitude at onset. */
  amplitude: number;
}

export type TimingRating = 'perfect' | 'good' | 'early' | 'late' | 'miss';

export interface TimingResult {
  nearestBeatIndex: number;
  offsetMs: number;
  rating: TimingRating;
}

/**
 * Build a beat grid starting at `startTime`.
 *
 * @param bpm          Tempo in beats per minute.
 * @param subdivisions Number of notes per beat (1 = quarter, 2 = eighth, 3 = triplet).
 * @param startTime    performance.now() reference for beat 0.
 * @param totalNotes   Total number of subdivision slots in the grid.
 */
export function createBeatGrid(
  bpm: number,
  subdivisions: number,
  startTime: number,
  totalNotes: number,
): BeatGrid {
  const beatIntervalMs = 60_000 / bpm;
  const subIntervalMs = beatIntervalMs / subdivisions;
  const beats: number[] = [];
  for (let i = 0; i < totalNotes; i++) {
    beats.push(startTime + i * subIntervalMs);
  }
  return { bpm, subdivisions, beats, intervalMs: subIntervalMs };
}

/**
 * Detect whether an onset just occurred by checking if the signal
 * transitioned from below to above the threshold.
 *
 * Maintains state via the returned object — call once per animation frame.
 */
export function createOnsetDetector() {
  let wasSilent = true;
  let lastOnsetTime = 0;

  return function detectOnset(analyser: AnalyserNode): OnsetEvent | null {
    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / buffer.length);

    const now = performance.now();
    const isSounding = rms >= ONSET_THRESHOLD;

    if (isSounding && wasSilent && now - lastOnsetTime > ONSET_DEBOUNCE_MS) {
      wasSilent = false;
      lastOnsetTime = now;
      return { timestamp: now, amplitude: rms };
    }

    if (!isSounding) {
      wasSilent = true;
    }

    return null;
  };
}

/**
 * Classify an onset against the nearest beat in the grid.
 */
export function classifyOnset(
  onsetTime: number,
  grid: BeatGrid,
): TimingResult {
  let bestIndex = 0;
  let bestDist = Infinity;

  for (let i = 0; i < grid.beats.length; i++) {
    const dist = Math.abs(onsetTime - grid.beats[i]);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
    // Beats are sorted, so once distance starts increasing we can stop.
    if (dist > bestDist) break;
  }

  const offsetMs = onsetTime - grid.beats[bestIndex];
  const rating = rateOffset(offsetMs, grid.intervalMs);

  return { nearestBeatIndex: bestIndex, offsetMs, rating };
}

function rateOffset(offsetMs: number, intervalMs: number): TimingRating {
  const abs = Math.abs(offsetMs);
  // Scale thresholds to tempo — tighter window at slow tempos.
  const window = Math.min(intervalMs * 0.5, 200);
  if (abs <= window * 0.15) return 'perfect';
  if (abs <= window * 0.35) return 'good';
  if (abs > window) return 'miss';
  return offsetMs < 0 ? 'early' : 'late';
}

/**
 * Compute an aggregate 0–100 timing score from a set of timing results.
 */
export function computeTimingScore(results: TimingResult[]): number {
  if (results.length === 0) return 0;

  let total = 0;
  for (const r of results) {
    switch (r.rating) {
      case 'perfect':
        total += 100;
        break;
      case 'good':
        total += 80;
        break;
      case 'early':
      case 'late':
        total += 50;
        break;
      case 'miss':
        total += 0;
        break;
    }
  }
  return Math.round(total / results.length);
}
