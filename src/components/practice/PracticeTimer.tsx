'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { db } from '@/lib/db/schema';
import type { PracticeActivity } from '@/types/practice';

const ACTIVITY_TYPES: { value: PracticeActivity['type']; label: string }[] = [
  { value: 'chord-practice', label: 'Chord Practice' },
  { value: 'song', label: 'Song Practice' },
  { value: 'lesson', label: 'Lesson' },
  { value: 'free-play', label: 'Free Play' },
  { value: 'exercise', label: 'Metronome / Exercise' },
];

interface PracticeTimerProps {
  onStop?: () => void;
}

export default function PracticeTimer({ onStop }: PracticeTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [activityType, setActivityType] = useState<PracticeActivity['type']>('free-play');
  const [itemName, setItemName] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setElapsed(accumulatedRef.current + Math.floor((now - startTimeRef.current) / 1000));
    }, 250);
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    accumulatedRef.current = elapsed;
    setRunning(false);
  }, [elapsed]);

  const stop = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);

    if (elapsed > 0) {
      const activity: PracticeActivity = {
        type: activityType,
        durationSeconds: elapsed,
        ...(itemName.trim() ? { referenceId: itemName.trim() } : {}),
      };

      const now = new Date();
      await db.practiceSessions.add({
        startedAt: new Date(now.getTime() - elapsed * 1000),
        endedAt: now,
        durationSeconds: elapsed,
        activities: [activity],
        notes: itemName.trim() || '',
        mood: 3,
      });

      // Update total practice minutes
      const progress = await db.userProgress.get('singleton');
      if (progress) {
        const addedMinutes = Math.round(elapsed / 60);
        const today = new Date().toISOString().slice(0, 10);
        const lastDate = progress.lastPracticeDate;
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

        let newStreak = progress.currentStreak;
        if (lastDate === today) {
          // Already practiced today, no streak change
        } else if (lastDate === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        await db.userProgress.update('singleton', {
          totalPracticeMinutes: progress.totalPracticeMinutes + addedMinutes,
          lastPracticeDate: today,
          currentStreak: newStreak,
          longestStreak: Math.max(progress.longestStreak, newStreak),
        });
      }
    }

    setElapsed(0);
    accumulatedRef.current = 0;
    onStop?.();
  }, [elapsed, activityType, itemName, onStop]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="bg-surface rounded-xl border border-border p-6 mb-6">
      <h2 className="text-sm font-semibold text-foreground mb-4 text-center">Practice Session</h2>

      {/* Timer display */}
      <div className="text-center mb-6">
        <div
          className="text-6xl font-mono font-bold tabular-nums"
          style={{ color: running ? '#b45309' : '#2d1810' }}
        >
          {display}
        </div>
        {elapsed > 0 && !running && (
          <p className="text-xs text-muted mt-1">Paused</p>
        )}
      </div>

      {/* Activity type selector */}
      <div className="mb-4">
        <label className="block text-xs text-muted mb-1">Activity Type</label>
        <select
          value={activityType}
          onChange={(e) => setActivityType(e.target.value as PracticeActivity['type'])}
          disabled={running}
          className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
        >
          {ACTIVITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Item name input */}
      <div className="mb-5">
        <label className="block text-xs text-muted mb-1">
          What are you practicing? <span className="text-muted">(optional)</span>
        </label>
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="e.g. Cripple Creek, G chord, Lesson 3..."
          disabled={running}
          className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
        />
      </div>

      {/* Control buttons */}
      <div className="flex gap-3">
        {!running && elapsed === 0 && (
          <button
            type="button"
            onClick={start}
            className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Start
          </button>
        )}
        {running && (
          <button
            type="button"
            onClick={pause}
            className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
          >
            Pause
          </button>
        )}
        {!running && elapsed > 0 && (
          <button
            type="button"
            onClick={start}
            className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Resume
          </button>
        )}
        {elapsed > 0 && (
          <button
            type="button"
            onClick={stop}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Stop &amp; Save
          </button>
        )}
        {(elapsed > 0 || running) && (
          <button
            type="button"
            onClick={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setRunning(false);
              setElapsed(0);
              accumulatedRef.current = 0;
              onStop?.();
            }}
            className="px-4 py-3 border border-border text-foreground rounded-xl text-sm font-semibold hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
