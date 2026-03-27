import { create } from 'zustand';
import type { Exercise } from '@/types/lesson';
import type { NoteEvaluation } from '@/lib/audio/exercise-pitch-analyzer';
import type { TimingResult } from '@/lib/audio/rhythm-analyzer';

export type ExercisePhase =
  | 'idle'
  | 'setup'
  | 'countdown'
  | 'playing'
  | 'reviewing'
  | 'complete';

export interface NoteEvent {
  timestamp: number;
  noteEval: NoteEvaluation | null;
  timingResult: TimingResult | null;
}

interface ExerciseState {
  phase: ExercisePhase;
  currentExercise: Exercise | null;
  elapsedMs: number;
  scores: { accuracy: number; timing: number; handPlacement: number };
  noteEvents: NoteEvent[];
  feedbackMessage: string;
  isListening: boolean;
  isCameraActive: boolean;
  tabCursor: number;

  // Actions
  startExercise: (exercise: Exercise) => void;
  setPhase: (phase: ExercisePhase) => void;
  setElapsedMs: (ms: number) => void;
  recordNoteEvent: (event: NoteEvent) => void;
  updateScores: (scores: Partial<ExerciseState['scores']>) => void;
  setFeedbackMessage: (msg: string) => void;
  setListening: (listening: boolean) => void;
  setCameraActive: (active: boolean) => void;
  advanceTabCursor: () => void;
  reset: () => void;
}

const initialState = {
  phase: 'idle' as ExercisePhase,
  currentExercise: null as Exercise | null,
  elapsedMs: 0,
  scores: { accuracy: 0, timing: 0, handPlacement: -1 },
  noteEvents: [] as NoteEvent[],
  feedbackMessage: '',
  isListening: false,
  isCameraActive: false,
  tabCursor: 0,
};

export const useExerciseStore = create<ExerciseState>((set) => ({
  ...initialState,

  startExercise: (exercise) =>
    set({
      ...initialState,
      phase: 'setup',
      currentExercise: exercise,
    }),

  setPhase: (phase) => set({ phase }),
  setElapsedMs: (elapsedMs) => set({ elapsedMs }),

  recordNoteEvent: (event) =>
    set((s) => ({ noteEvents: [...s.noteEvents, event] })),

  updateScores: (partial) =>
    set((s) => ({ scores: { ...s.scores, ...partial } })),

  setFeedbackMessage: (feedbackMessage) => set({ feedbackMessage }),
  setListening: (isListening) => set({ isListening }),
  setCameraActive: (isCameraActive) => set({ isCameraActive }),
  advanceTabCursor: () => set((s) => ({ tabCursor: s.tabCursor + 1 })),

  reset: () => set(initialState),
}));
