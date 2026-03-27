/**
 * Pitch detection engine using autocorrelation (YIN-inspired algorithm).
 *
 * Designed for 5-string banjo in standard Open G tuning (gDGBD):
 *   5th string: g4 = 392 Hz
 *   4th string: D3 = 147 Hz
 *   3rd string: G3 = 196 Hz
 *   2nd string: B3 = 247 Hz
 *   1st string: D4 = 294 Hz
 */

// All 12 chromatic note names
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

// Standard banjo tuning reference (Open G: gDGBD)
export const BANJO_STRINGS = [
  { string: 1, name: 'D4', note: 'D', octave: 4, frequency: 293.66 },
  { string: 2, name: 'B3', note: 'B', octave: 3, frequency: 246.94 },
  { string: 3, name: 'G3', note: 'G', octave: 3, frequency: 196.0 },
  { string: 4, name: 'D3', note: 'D', octave: 3, frequency: 146.83 },
  { string: 5, name: 'g4', note: 'G', octave: 4, frequency: 392.0 },
] as const;

export interface PitchResult {
  frequency: number;
  note: string;
  octave: number;
  cents: number;
}

/** Minimum RMS amplitude to consider the signal audible.
 *  Lowered from 0.01 to work better with mobile device microphones. */
const SILENCE_THRESHOLD = 0.005;

/** YIN probability threshold — lower is stricter. */
const YIN_THRESHOLD = 0.15;

/**
 * Detect the fundamental pitch from an AnalyserNode using a YIN-style
 * autocorrelation algorithm.
 *
 * Returns null when the signal is too quiet or no clear pitch is found.
 */
export function detectPitch(analyser: AnalyserNode): PitchResult | null {
  const sampleRate = analyser.context.sampleRate;
  const bufferSize = analyser.fftSize;
  const buffer = new Float32Array(bufferSize);
  analyser.getFloatTimeDomainData(buffer);

  // ---- Gate: reject silence ------------------------------------------------
  let rms = 0;
  for (let i = 0; i < bufferSize; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / bufferSize);
  if (rms < SILENCE_THRESHOLD) return null;

  // ---- YIN step 2: difference function ------------------------------------
  const halfSize = Math.floor(bufferSize / 2);
  const yinBuffer = new Float32Array(halfSize);

  for (let tau = 0; tau < halfSize; tau++) {
    let sum = 0;
    for (let i = 0; i < halfSize; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    yinBuffer[tau] = sum;
  }

  // ---- YIN step 3: cumulative mean normalised difference -------------------
  yinBuffer[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < halfSize; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] *= tau / runningSum;
  }

  // ---- YIN step 4: absolute threshold -------------------------------------
  // Find the first dip below the threshold after the first zero-crossing.
  let tauEstimate = -1;

  // Banjo lowest note of interest is D3 ~147 Hz.  At 44100 Hz sample-rate
  // that is a period of ~300 samples, so we start searching from tau = 2 and
  // go up to the lag that corresponds to ~70 Hz to be safe.
  const minTau = Math.floor(sampleRate / 600); // ~600 Hz upper bound
  const maxTau = Math.min(halfSize, Math.floor(sampleRate / 70)); // ~70 Hz lower bound

  for (let tau = minTau; tau < maxTau; tau++) {
    if (yinBuffer[tau] < YIN_THRESHOLD) {
      // Walk forward to find the local minimum of the dip.
      while (tau + 1 < maxTau && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++;
      }
      tauEstimate = tau;
      break;
    }
  }

  if (tauEstimate === -1) return null;

  // ---- YIN step 5: parabolic interpolation --------------------------------
  let betterTau: number;
  const x0 = tauEstimate < 1 ? tauEstimate : tauEstimate - 1;
  const x2 = tauEstimate + 1 < halfSize ? tauEstimate + 1 : tauEstimate;

  if (x0 === tauEstimate) {
    betterTau = yinBuffer[tauEstimate] <= yinBuffer[x2] ? tauEstimate : x2;
  } else if (x2 === tauEstimate) {
    betterTau = yinBuffer[tauEstimate] <= yinBuffer[x0] ? tauEstimate : x0;
  } else {
    const s0 = yinBuffer[x0];
    const s1 = yinBuffer[tauEstimate];
    const s2 = yinBuffer[x2];
    betterTau = tauEstimate + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
  }

  const frequency = sampleRate / betterTau;

  // Sanity-check the detected frequency (roughly 60–700 Hz for banjo range).
  if (frequency < 60 || frequency > 700) return null;

  // ---- Convert frequency to note name + cents offset ----------------------
  return frequencyToNote(frequency);
}

/**
 * Convert a frequency in Hz to the nearest chromatic note name,
 * octave number, and cents offset.
 *
 * Uses A4 = 440 Hz as the reference.
 */
export function frequencyToNote(frequency: number): PitchResult {
  // Number of half-steps from A4
  const halfSteps = 12 * Math.log2(frequency / 440);
  const roundedHalfSteps = Math.round(halfSteps);
  const cents = Math.round((halfSteps - roundedHalfSteps) * 100);

  // A4 is MIDI note 69, index 9 in NOTE_NAMES (A)
  const noteIndex = ((roundedHalfSteps % 12) + 12) % 12;
  // Map: A is at index 9 in NOTE_NAMES → offset = roundedHalfSteps + 9
  const chromaticIndex = (((roundedHalfSteps + 9) % 12) + 12) % 12;
  const note = NOTE_NAMES[chromaticIndex];

  // Octave: A4 is octave 4. C is the start of each octave.
  // MIDI note number approach:
  const midiNote = 69 + roundedHalfSteps;
  const octave = Math.floor((midiNote - 12) / 12);

  return { frequency, note, octave, cents };
}

/**
 * Find the closest banjo string to a given frequency.
 */
export function closestBanjoString(frequency: number) {
  let closest: (typeof BANJO_STRINGS)[number] = BANJO_STRINGS[0];
  let minDist = Infinity;
  for (const s of BANJO_STRINGS) {
    // Compare in log-frequency space (cents) for perceptual accuracy.
    const dist = Math.abs(1200 * Math.log2(frequency / s.frequency));
    if (dist < minDist) {
      minDist = dist;
      closest = s;
    }
  }
  return closest;
}
