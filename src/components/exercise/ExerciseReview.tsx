'use client';

import React from 'react';
import type { Exercise } from '@/types/lesson';
import { useExerciseStore } from '@/stores/exercise-store';
import { compositeScore } from '@/lib/scoring/exercise-scorer';

interface ExerciseReviewProps {
  exercise: Exercise;
  onRetry: () => void;
  onContinue: () => void;
}

export default function ExerciseReview({
  exercise,
  onRetry,
  onContinue,
}: ExerciseReviewProps) {
  const { scores, noteEvents, elapsedMs } = useExerciseStore();

  const overall = compositeScore(scores);
  const passed = overall >= exercise.passingScore;
  const durationSec = Math.round(elapsedMs / 1000);

  // Count timing ratings.
  const timingCounts = { perfect: 0, good: 0, early: 0, late: 0, miss: 0 };
  for (const event of noteEvents) {
    if (event.timingResult) {
      timingCounts[event.timingResult.rating]++;
    }
  }

  const correctNotes = noteEvents.filter(
    (e) => e.noteEval?.correctNote,
  ).length;

  return (
    <div className="bg-surface rounded-xl border border-border p-6 space-y-5">
      {/* Result header */}
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
            passed ? 'bg-success/10' : 'bg-danger/10'
          }`}
        >
          <span className="text-3xl">{passed ? '\u2713' : '\u2717'}</span>
        </div>
        <h3 className="text-lg font-bold text-foreground">
          {passed ? 'Exercise Passed!' : 'Not Quite — Try Again'}
        </h3>
        <p className="text-xs text-muted mt-1">
          {durationSec}s played · {noteEvents.length} notes detected
        </p>
      </div>

      {/* Overall score */}
      <div className="text-center">
        <div
          className={`text-5xl font-bold tabular-nums ${
            overall >= 80
              ? 'text-success'
              : overall >= 60
                ? 'text-warning'
                : 'text-danger'
          }`}
        >
          {overall}%
        </div>
        <p className="text-xs text-muted mt-1">
          Overall Score (need {exercise.passingScore}% to pass)
        </p>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <ScoreCard label="Accuracy" value={scores.accuracy} />
        <ScoreCard label="Timing" value={scores.timing} />
        {scores.handPlacement >= 0 && (
          <ScoreCard label="Hand Position" value={scores.handPlacement} />
        )}
        <div className="bg-surface-hover rounded-lg p-3">
          <p className="text-xs text-muted">Correct Notes</p>
          <p className="text-lg font-bold text-foreground tabular-nums">
            {correctNotes}/{noteEvents.length}
          </p>
        </div>
      </div>

      {/* Timing breakdown */}
      {noteEvents.length > 0 && (
        <div className="bg-surface-hover rounded-lg p-4">
          <p className="text-xs font-medium text-foreground mb-2">
            Timing Breakdown
          </p>
          <div className="flex gap-2 flex-wrap">
            {timingCounts.perfect > 0 && (
              <TimingBadge label="Perfect" count={timingCounts.perfect} color="bg-success/20 text-success" />
            )}
            {timingCounts.good > 0 && (
              <TimingBadge label="Good" count={timingCounts.good} color="bg-primary/20 text-primary" />
            )}
            {timingCounts.early > 0 && (
              <TimingBadge label="Early" count={timingCounts.early} color="bg-warning/20 text-warning" />
            )}
            {timingCounts.late > 0 && (
              <TimingBadge label="Late" count={timingCounts.late} color="bg-warning/20 text-warning" />
            )}
            {timingCounts.miss > 0 && (
              <TimingBadge label="Miss" count={timingCounts.miss} color="bg-danger/20 text-danger" />
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 py-3 rounded-xl bg-surface-hover text-foreground text-sm font-semibold hover:bg-border transition-colors"
        >
          Retry
        </button>
        <button
          type="button"
          onClick={onContinue}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
            passed
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-surface-hover text-muted hover:text-foreground'
          }`}
        >
          {passed ? 'Continue' : 'Skip Anyway'}
        </button>
      </div>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color =
    value >= 80 ? 'text-success' : value >= 60 ? 'text-warning' : 'text-danger';
  return (
    <div className="bg-surface-hover rounded-lg p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${color}`}>{value}%</p>
    </div>
  );
}

function TimingBadge({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
      {label}: {count}
    </span>
  );
}
