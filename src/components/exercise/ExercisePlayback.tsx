'use client';

import React from 'react';
import type { Exercise } from '@/types/lesson';
import type { ExpectedNote } from '@/lib/audio/exercise-pitch-analyzer';
import { useExerciseStore } from '@/stores/exercise-store';
import FeedbackOverlay from './FeedbackOverlay';

interface ExercisePlaybackProps {
  exercise: Exercise;
  tabSequence: ExpectedNote[];
  bpm: number;
  useCamera: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onStop: () => void;
}

export default function ExercisePlayback({
  exercise,
  tabSequence,
  bpm,
  useCamera,
  videoRef,
  onStop,
}: ExercisePlaybackProps) {
  const { elapsedMs, tabCursor, feedbackMessage, noteEvents } =
    useExerciseStore();

  const elapsedSec = Math.floor(elapsedMs / 1000);
  const duration = (exercise.data?.duration as number) || 30;
  const progress =
    tabSequence.length > 0
      ? (tabCursor / tabSequence.length) * 100
      : (elapsedSec / duration) * 100;

  return (
    <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
      {/* Header with stop button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-danger animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            Listening...
          </span>
          <span className="text-xs text-muted tabular-nums">
            {formatTime(elapsedSec)}
          </span>
        </div>
        <button
          type="button"
          onClick={onStop}
          className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20 transition-colors"
        >
          Stop
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* Tab sequence display */}
      {tabSequence.length > 0 && (
        <div className="bg-surface-hover rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted">Pattern</span>
            <span className="text-xs text-muted tabular-nums">
              {tabCursor}/{tabSequence.length} notes
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tabSequence.map((note, i) => (
              <span
                key={i}
                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-mono font-bold transition-all ${
                  i < tabCursor
                    ? noteEvents[i]?.noteEval?.correctNote
                      ? 'bg-success/20 text-success'
                      : 'bg-danger/20 text-danger'
                    : i === tabCursor
                      ? 'bg-primary text-white scale-110 shadow-md'
                      : 'bg-border/50 text-muted'
                }`}
              >
                {note.string}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chord display */}
      {exercise.type === 'play-chord' && exercise.data?.chords && (
        <div className="bg-surface-hover rounded-lg p-4 text-center">
          <span className="text-xs text-muted">Current Chord</span>
          <div className="text-3xl font-bold text-primary mt-1">
            {(exercise.data.chords as string[])[
              Math.min(
                Math.floor(noteEvents.length / 8),
                (exercise.data.chords as string[]).length - 1,
              )
            ] || (exercise.data.chords as string[])[0]}
          </div>
        </div>
      )}

      {/* BPM indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted">
        <span>Target: {bpm} BPM</span>
        <span className="text-border">|</span>
        <span>{noteEvents.length} notes detected</span>
      </div>

      {/* Camera feed */}
      {useCamera && (
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Feedback overlay */}
      <FeedbackOverlay message={feedbackMessage} />
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
