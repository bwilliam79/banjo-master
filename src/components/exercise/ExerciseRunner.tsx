'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Exercise } from '@/types/lesson';
import { useExerciseStore } from '@/stores/exercise-store';
import { createAnalyser, cleanupAudio, getAudioContext } from '@/lib/audio/audio-context';
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
} from '@/lib/camera/hand-detector';
import ExerciseSetup from './ExerciseSetup';
import ExerciseCountdown from './ExerciseCountdown';
import ExercisePlayback from './ExercisePlayback';
import ExerciseReview from './ExerciseReview';

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
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (handIntervalRef.current) {
      clearInterval(handIntervalRef.current);
      handIntervalRef.current = null;
    }
    cleanupAudio();
    cleanupHandDetector();
    analyserRef.current = null;
  }, []);

  // Start listening to the microphone.
  const startListening = useCallback(async () => {
    getAudioContext();
    const analyser = await createAnalyser();
    analyserRef.current = analyser;
    store.setListening(true);
  }, [store]);

  // Begin the countdown phase.
  const startCountdown = useCallback(async () => {
    await startListening();
    store.setPhase('countdown');
  }, [startListening, store]);

  // Called when countdown finishes — start the playing phase.
  const startPlaying = useCallback(() => {
    startTimeRef.current = performance.now();
    onsetDetectorRef.current = createOnsetDetector();
    noteEvalsRef.current = [];
    handScoresRef.current = [];

    // Build beat grid.
    const totalNotes =
      tabSequence.length > 0
        ? tabSequence.length
        : Math.ceil((duration * bpm) / 60);
    const subdivisions = exercise.type === 'rhythm' ? 1 : 1;
    beatGridRef.current = createBeatGrid(
      bpm,
      subdivisions,
      startTimeRef.current,
      totalNotes,
    );

    store.setPhase('playing');

    // Start hand detection if camera is active.
    if (useCamera && videoRef.current) {
      handIntervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        const result = await detectHands(videoRef.current);
        if (result) {
          const feedback = analyzeHandPosition(result);
          handScoresRef.current.push(feedback.overallScore);
          store.setFeedbackMessage(feedback.message);
        }
      }, 500);
    }

    // Start the main analysis loop.
    const tick = () => {
      if (!analyserRef.current || store.phase !== 'playing') return;

      const elapsed = performance.now() - startTimeRef.current;
      store.setElapsedMs(elapsed);

      // Check if exercise duration is exceeded.
      if (elapsed > duration * 1000 + 2000) {
        finishExercise();
        return;
      }

      // Detect onset.
      const onset = onsetDetectorRef.current?.(analyserRef.current);
      if (onset && beatGridRef.current) {
        const timingResult = classifyOnset(onset.timestamp, beatGridRef.current);

        // Detect pitch at this moment.
        const pitchResult = detectPitch(analyserRef.current);

        let noteEval: NoteEvaluation | null = null;

        if (exercise.type === 'play-tab' && tabSequence.length > 0) {
          const cursor = store.tabCursor;
          if (cursor < tabSequence.length) {
            noteEval = evaluateNote(pitchResult, tabSequence[cursor]);
            noteEvalsRef.current.push(noteEval);
            store.advanceTabCursor();
          }
        } else if (exercise.type === 'play-chord' && chords.length > 0) {
          // For chord exercises, check if played note is in chord.
          const chordIdx = Math.min(
            Math.floor(timingResult.nearestBeatIndex / 8),
            chords.length - 1,
          );
          const result = evaluateChordTone(pitchResult, chords[chordIdx]);
          noteEval = {
            expected: {
              string: 0,
              note: chords[chordIdx],
              octave: 0,
              frequency: 0,
            },
            detected: pitchResult,
            correctNote: result.inChord,
            centsOff: 0,
            score: result.score,
          };
          noteEvalsRef.current.push(noteEval);
        } else if (exercise.type === 'rhythm') {
          // Rhythm — only timing matters, any note is fine.
          if (pitchResult) {
            noteEval = {
              expected: {
                string: 0,
                note: pitchResult.note,
                octave: pitchResult.octave,
                frequency: pitchResult.frequency,
              },
              detected: pitchResult,
              correctNote: true,
              centsOff: 0,
              score: 100,
            };
            noteEvalsRef.current.push(noteEval);
          }
        } else {
          // Ear training or generic — just track what we hear.
          if (pitchResult) {
            noteEval = {
              expected: {
                string: 0,
                note: pitchResult.note,
                octave: pitchResult.octave,
                frequency: pitchResult.frequency,
              },
              detected: pitchResult,
              correctNote: true,
              centsOff: 0,
              score: 80,
            };
            noteEvalsRef.current.push(noteEval);
          }
        }

        store.recordNoteEvent({
          timestamp: onset.timestamp,
          noteEval,
          timingResult,
        });

        // Update real-time feedback.
        const rating = timingResult.rating;
        const noteInfo = noteEval?.correctNote ? 'correct' : 'wrong note';
        store.setFeedbackMessage(
          `${rating.toUpperCase()} — ${noteInfo}`,
        );
      }

      // Check if tab exercise is complete (all notes played).
      if (
        exercise.type === 'play-tab' &&
        tabSequence.length > 0 &&
        store.tabCursor >= tabSequence.length
      ) {
        finishExercise();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm, duration, exercise, store, tabSequence, chords, useCamera]);

  const finishExercise = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (handIntervalRef.current) {
      clearInterval(handIntervalRef.current);
      handIntervalRef.current = null;
    }

    // Compute final scores.
    const timingResults = store.noteEvents
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
    store.updateScores(scores);

    const overall = compositeScore(scores);
    const passed = overall >= exercise.passingScore;

    // Save to DB.
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

    store.setPhase('reviewing');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise, lessonId, store]);

  const handleRetry = useCallback(() => {
    cleanup();
    store.startExercise(exercise);
  }, [cleanup, exercise, store]);

  const handleComplete = useCallback(() => {
    const { scores } = store;
    const overall = compositeScore(scores);
    const passed = overall >= exercise.passingScore;
    onComplete(scores, passed);
  }, [exercise.passingScore, onComplete, store]);

  // Render based on phase.
  switch (store.phase) {
    case 'idle':
    case 'setup':
      return (
        <ExerciseSetup
          exercise={exercise}
          useCamera={useCamera}
          onToggleCamera={() => setUseCamera((c) => !c)}
          onStart={startCountdown}
          onSkip={onSkip}
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
