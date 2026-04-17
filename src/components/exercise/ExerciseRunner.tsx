'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Exercise } from '@/types/lesson';
import { useExerciseStore } from '@/stores/exercise-store';
import { cleanupAudio } from '@/lib/audio/audio-context';
import { detectPitch } from '@/lib/audio/pitch-detector';
import {
  createBeatGrid,
  createOnsetDetector,
  classifyOnset,
  computeTimingScore,
  type BeatGrid,
} from '@/lib/audio/rhythm-analyzer';
import {
  parseTabSequence,
  evaluateNote,
  evaluateChordTone,
  computeAccuracyScore,
  type NoteEvaluation,
} from '@/lib/audio/exercise-pitch-analyzer';
import {
  compositeScore,
  saveExerciseResult,
} from '@/lib/scoring/exercise-scorer';
import {
  detectHands,
  analyzeHandPosition,
  cleanupHandDetector,
  isHandDetectorReady,
} from '@/lib/camera/hand-detector';
import { stopCamera } from '@/lib/camera/camera-manager';
import ExerciseSetup from './ExerciseSetup';
import ExercisePreflight from './ExercisePreflight';
import ExerciseCountdown from './ExerciseCountdown';
import ExercisePlayback from './ExercisePlayback';
import ExerciseReview from './ExerciseReview';

// Direct access to store state outside the React render cycle.
// Used for one-shot reads/writes inside RAF ticks, setInterval callbacks,
// and event handlers where React reactivity is NOT needed — these paths
// already re-render via the `useExerciseStore()` hook at the top of the
// component. Do not use this pattern in render; subscribe via the hook.
const getState = () => useExerciseStore.getState();

interface ExerciseRunnerProps {
  exercise: Exercise;
  lessonId: string;
  onComplete: (scores: { accuracy: number; timing: number; handPlacement: number }, passed: boolean) => void;
  onSkip: () => void;
}

export default function ExerciseRunner({
  exercise,
  lessonId,
  onComplete,
  onSkip,
}: ExerciseRunnerProps) {
  const store = useExerciseStore();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const beatGridRef = useRef<BeatGrid | null>(null);
  const onsetDetectorRef = useRef<ReturnType<typeof createOnsetDetector> | null>(null);
  const startTimeRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handScoresRef = useRef<number[]>([]);
  const noteEvalsRef = useRef<NoteEvaluation[]>([]);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const stoppedRef = useRef(false);
  const [useCamera, setUseCamera] = useState(false);

  // Parse exercise data.
  const bpm = (exercise.data?.bpm as number) || 60;
  const tabSequence = exercise.data?.tab
    ? parseTabSequence(exercise.data.tab as string)
    : [];
  const chords = (exercise.data?.chords as string[]) || [];
  const duration = (exercise.data?.duration as number) || 30;

  // Initialize exercise on mount.
  useEffect(() => {
    store.startExercise(exercise);
    return () => {
      cleanup();
      store.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  const cleanup = useCallback(() => {
    stoppedRef.current = true;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    // Clear the hand-detection interval BEFORE closing the detector, so
    // no stale async callback can invoke a freshly-closed HandLandmarker.
    if (handIntervalRef.current) {
      clearInterval(handIntervalRef.current);
      handIntervalRef.current = null;
    }
    if (cameraStreamRef.current) {
      stopCamera(cameraStreamRef.current);
      cameraStreamRef.current = null;
    }
    cleanupAudio();
    cleanupHandDetector();
    analyserRef.current = null;
  }, []);

  // Setup -> Preflight transition.
  const startPreflight = useCallback(() => {
    getState().setPhase('preflight');
  }, []);

  // Preflight confirms mic/camera are working, passes resources forward.
  const handlePreflightReady = useCallback(
    (analyser: AnalyserNode, cameraStream: MediaStream | null, videoElement: HTMLVideoElement | null) => {
      analyserRef.current = analyser;
      cameraStreamRef.current = cameraStream;
      videoRef.current = videoElement;
      getState().setListening(true);
      if (cameraStream) getState().setCameraActive(true);
      getState().setPhase('countdown');
    },
    [],
  );

  const handlePreflightBack = useCallback(() => {
    getState().setPhase('setup');
  }, []);

  const finishExercise = useCallback(() => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    // Clear the hand-detection interval here too, mirroring cleanup().
    // Stale ticks after this point could invoke a closed detector.
    if (handIntervalRef.current) {
      clearInterval(handIntervalRef.current);
      handIntervalRef.current = null;
    }

    const state = getState();
    const timingResults = state.noteEvents
      .map((e) => e.timingResult)
      .filter((r): r is NonNullable<typeof r> => r !== null);

    const accuracy = computeAccuracyScore(noteEvalsRef.current);
    const timing = computeTimingScore(timingResults);
    const handPlacement =
      handScoresRef.current.length > 0
        ? Math.round(
            handScoresRef.current.reduce((a, b) => a + b, 0) /
              handScoresRef.current.length,
          )
        : -1;

    const scores = { accuracy, timing, handPlacement };
    state.updateScores(scores);

    const overall = compositeScore(scores);
    const passed = overall >= exercise.passingScore;

    const elapsed = performance.now() - startTimeRef.current;
    saveExerciseResult({
      exerciseId: exercise.id,
      lessonId,
      exerciseType: exercise.type,
      scores,
      durationSeconds: Math.round(elapsed / 1000),
      passed,
      passingScore: exercise.passingScore,
    });

    state.setPhase('reviewing');
  }, [exercise, lessonId]);

  // Called when countdown finishes — start the playing phase.
  const startPlaying = useCallback(() => {
    stoppedRef.current = false;
    startTimeRef.current = performance.now();
    onsetDetectorRef.current = createOnsetDetector();
    noteEvalsRef.current = [];
    handScoresRef.current = [];

    const totalNotes =
      tabSequence.length > 0
        ? tabSequence.length
        : Math.ceil((duration * bpm) / 60);
    beatGridRef.current = createBeatGrid(bpm, 1, startTimeRef.current, totalNotes);

    getState().setPhase('playing');

    // Start hand detection if camera stream is already running from preflight.
    if (cameraStreamRef.current && videoRef.current) {
      const video = videoRef.current;
      handIntervalRef.current = setInterval(async () => {
        // Guard: the exercise may have been stopped or the detector closed
        // between scheduling this tick and running it. detectHands() awaits
        // WASM init which yields the event loop.
        if (stoppedRef.current || !isHandDetectorReady()) return;
        if (!video || video.readyState < 2) return;
        const result = await detectHands(video);
        // Re-check after the async boundary — cleanup may have run.
        if (stoppedRef.current || !isHandDetectorReady()) return;
        if (result) {
          const feedback = analyzeHandPosition(result);
          handScoresRef.current.push(feedback.overallScore);
          getState().setFeedbackMessage(feedback.message);
        }
      }, 500);
    }

    // Start the main analysis loop.
    const tick = () => {
      if (!analyserRef.current || stoppedRef.current) return;

      const elapsed = performance.now() - startTimeRef.current;
      getState().setElapsedMs(elapsed);

      // Normal completion buffer (duration + 2s grace for a final onset).
      if (elapsed > duration * 1000 + 2000) {
        finishExercise();
        return;
      }

      // Safety net: if something wedged the completion path, force-stop
      // well past the expected end so the exercise can't run forever.
      if (elapsed > duration * 1000 * 1.5) {
        console.warn(
          `[ExerciseRunner] Force-stopping exercise — elapsed=${Math.round(
            elapsed,
          )}ms exceeded 1.5x duration (${duration}s).`,
        );
        finishExercise();
        return;
      }

      const onset = onsetDetectorRef.current?.(analyserRef.current);
      if (onset && beatGridRef.current) {
        const timingResult = classifyOnset(onset.timestamp, beatGridRef.current);
        const pitchResult = detectPitch(analyserRef.current);

        let noteEval: NoteEvaluation | null = null;
        const state = getState();

        if (exercise.type === 'play-tab' && tabSequence.length > 0) {
          const cursor = state.tabCursor;
          if (cursor < tabSequence.length) {
            noteEval = evaluateNote(pitchResult, tabSequence[cursor]);
            noteEvalsRef.current.push(noteEval);
            state.advanceTabCursor();
          }
        } else if (exercise.type === 'play-chord' && chords.length > 0) {
          const chordIdx = Math.min(
            Math.floor(timingResult.nearestBeatIndex / 8),
            chords.length - 1,
          );
          const result = evaluateChordTone(pitchResult, chords[chordIdx]);
          noteEval = {
            expected: { string: 0, note: chords[chordIdx], octave: 0, frequency: 0 },
            detected: pitchResult,
            correctNote: result.inChord,
            centsOff: 0,
            score: result.score,
          };
          noteEvalsRef.current.push(noteEval);
        } else if (exercise.type === 'rhythm') {
          if (pitchResult) {
            noteEval = {
              expected: { string: 0, note: pitchResult.note, octave: pitchResult.octave, frequency: pitchResult.frequency },
              detected: pitchResult,
              correctNote: true,
              centsOff: 0,
              score: 100,
            };
            noteEvalsRef.current.push(noteEval);
          }
        } else {
          if (pitchResult) {
            noteEval = {
              expected: { string: 0, note: pitchResult.note, octave: pitchResult.octave, frequency: pitchResult.frequency },
              detected: pitchResult,
              correctNote: true,
              centsOff: 0,
              score: 80,
            };
            noteEvalsRef.current.push(noteEval);
          }
        }

        state.recordNoteEvent({ timestamp: onset.timestamp, noteEval, timingResult });

        const rating = timingResult.rating;
        const noteInfo = noteEval?.correctNote ? 'correct' : 'wrong note';
        state.setFeedbackMessage(`${rating.toUpperCase()} — ${noteInfo}`);
      }

      if (
        exercise.type === 'play-tab' &&
        tabSequence.length > 0 &&
        getState().tabCursor >= tabSequence.length
      ) {
        finishExercise();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [bpm, duration, exercise, tabSequence, chords, finishExercise]);

  const handleRetry = useCallback(() => {
    cleanup();
    stoppedRef.current = false;
    getState().startExercise(exercise);
  }, [cleanup, exercise]);

  const handleComplete = useCallback(() => {
    const { scores } = getState();
    const overall = compositeScore(scores);
    const passed = overall >= exercise.passingScore;
    onComplete(scores, passed);
  }, [exercise.passingScore, onComplete]);

  // Render based on phase.
  switch (store.phase) {
    case 'idle':
    case 'setup':
      return (
        <ExerciseSetup
          exercise={exercise}
          useCamera={useCamera}
          onToggleCamera={() => setUseCamera((c) => !c)}
          onStart={startPreflight}
          onSkip={onSkip}
        />
      );

    case 'preflight':
      return (
        <ExercisePreflight
          useCamera={useCamera}
          onReady={handlePreflightReady}
          onBack={handlePreflightBack}
        />
      );

    case 'countdown':
      return (
        <ExerciseCountdown
          bpm={bpm}
          beats={4}
          onComplete={startPlaying}
        />
      );

    case 'playing':
      return (
        <ExercisePlayback
          exercise={exercise}
          tabSequence={tabSequence}
          bpm={bpm}
          useCamera={useCamera}
          videoRef={videoRef}
          cameraStream={cameraStreamRef.current}
          onStop={finishExercise}
        />
      );

    case 'reviewing':
    case 'complete':
      return (
        <ExerciseReview
          exercise={exercise}
          onRetry={handleRetry}
          onContinue={handleComplete}
        />
      );

    default:
      return null;
  }
}
