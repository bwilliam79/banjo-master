/**
 * Exercise-specific pitch analysis.
 *
 * Wraps the core pitch detector to compare detected notes against
 * expected notes from exercise data (tab sequences, chord tones, etc.).
 */

import { BANJO_STRINGS, type PitchResult } from './pitch-detector';

export interface ExpectedNote {
  /** Banjo string number (1-5). */
  string: number;
  note: string;
  octave: number;
  frequency: number;
}

export interface NoteEvaluation {
  expected: ExpectedNote;
  detected: PitchResult | null;
  correctNote: boolean;
  centsOff: number;
  /** 0–100 score for this individual note. */
  score: number;
}

/**
 * Parse a tab string like "3-2-1-3-2-1-3-2" into an array of expected notes.
 * Supports "|" as a measure separator (ignored for note sequence).
 */
export function parseTabSequence(tab: string): ExpectedNote[] {
  const tokens = tab
    .split(/[|\-]/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  return tokens.map((token) => {
    const stringNum = parseInt(token, 10);
    const banjoString = BANJO_STRINGS.find((s) => s.string === stringNum);
    if (!banjoString) {
      // Default to string 3 (G) if parsing fails.
      const fallback = BANJO_STRINGS[2];
      return {
        string: fallback.string,
        note: fallback.note,
        octave: fallback.octave,
        frequency: fallback.frequency,
      };
    }
    return {
      string: banjoString.string,
      note: banjoString.note,
      octave: banjoString.octave,
      frequency: banjoString.frequency,
    };
  });
}

/**
 * Get the expected open-string notes for a chord.
 * For open G tuning, "G" means all open strings ring (gDGBD).
 * For other chords, we still check that the played notes match
 * the chord tones.
 */
export function getChordTones(chordName: string): string[] {
  const chordMap: Record<string, string[]> = {
    G: ['G', 'D', 'B'],
    C: ['C', 'E', 'G'],
    D: ['D', 'F#', 'A'],
    D7: ['D', 'F#', 'A', 'C'],
    Em: ['E', 'G', 'B'],
    Am: ['A', 'C', 'E'],
    F: ['F', 'A', 'C'],
  };
  return chordMap[chordName] ?? [];
}

/**
 * Evaluate a detected pitch against an expected note.
 */
export function evaluateNote(
  detected: PitchResult | null,
  expected: ExpectedNote,
): NoteEvaluation {
  if (!detected) {
    return { expected, detected: null, correctNote: false, centsOff: 0, score: 0 };
  }

  // Check if the detected note matches the expected note name.
  const correctNote = detected.note === expected.note;

  // Cents offset from the expected frequency.
  const centsOff = Math.abs(
    1200 * Math.log2(detected.frequency / expected.frequency),
  );

  let score: number;
  if (!correctNote) {
    // Wrong note — partial credit if very close (within a semitone).
    score = centsOff < 100 ? Math.max(0, 30 - centsOff * 0.3) : 0;
  } else {
    // Correct note — score degrades with cents offset.
    if (centsOff <= 10) score = 100;
    else if (centsOff <= 25) score = 85;
    else if (centsOff <= 50) score = 60;
    else score = Math.max(0, 40 - (centsOff - 50) * 0.5);
  }

  return {
    expected,
    detected,
    correctNote,
    centsOff: Math.round(centsOff),
    score: Math.round(score),
  };
}

/**
 * Check if a detected pitch is one of the expected chord tones.
 */
export function evaluateChordTone(
  detected: PitchResult | null,
  chordName: string,
): { inChord: boolean; score: number } {
  if (!detected) return { inChord: false, score: 0 };

  const tones = getChordTones(chordName);
  const inChord = tones.includes(detected.note);

  return {
    inChord,
    score: inChord ? 100 : 0,
  };
}

/**
 * Compute aggregate accuracy score from a list of note evaluations.
 */
export function computeAccuracyScore(evaluations: NoteEvaluation[]): number {
  if (evaluations.length === 0) return 0;
  const total = evaluations.reduce((sum, e) => sum + e.score, 0);
  return Math.round(total / evaluations.length);
}
