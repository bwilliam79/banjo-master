'use client';

import React from 'react';
import type { Exercise } from '@/types/lesson';

interface ExerciseSetupProps {
  exercise: Exercise;
  useCamera: boolean;
  onToggleCamera: () => void;
  onStart: () => void;
  onSkip: () => void;
}

export default function ExerciseSetup({
  exercise,
  useCamera,
  onToggleCamera,
  onStart,
  onSkip,
}: ExerciseSetupProps) {
  const bpm = (exercise.data?.bpm as number) || null;
  const tab = (exercise.data?.tab as string) || null;
  const chords = (exercise.data?.chords as string[]) || null;

  return (
    <div className="bg-surface rounded-xl border border-border p-6 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            {exercise.type.replace('-', ' ')}
          </span>
          <span className="text-[10px] text-muted">
            Pass: {exercise.passingScore}%
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          {exercise.prompt}
        </p>
      </div>

      {/* Exercise details */}
      <div className="space-y-2">
        {bpm && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-medium text-foreground">Tempo:</span>
            {bpm} BPM
          </div>
        )}
        {tab && (
          <div>
            <span className="text-xs font-medium text-foreground">Pattern:</span>
            <pre className="text-xs font-mono text-primary mt-1 bg-surface-hover rounded px-3 py-2">
              {tab.replace(/\|/g, ' | ')}
            </pre>
          </div>
        )}
        {chords && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-medium text-foreground">Chords:</span>
            {chords.map((c, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Camera toggle */}
      <div className="flex items-center justify-between bg-surface-hover rounded-lg px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            Hand Position Camera
          </p>
          <p className="text-xs text-muted">
            Optional — uses your camera to check hand placement.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleCamera}
          className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
            useCamera ? 'bg-primary' : 'bg-border'
          }`}
          role="switch"
          aria-checked={useCamera}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              useCamera ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onStart}
          className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Start Exercise
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="px-4 py-3 rounded-xl bg-surface-hover text-muted text-sm font-medium hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
