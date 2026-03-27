'use client';

import React, { useMemo } from 'react';
import type { PracticeSession } from '@/types/practice';

interface StreakCalendarProps {
  sessions: PracticeSession[];
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getGreenShade(minutes: number): string {
  if (minutes <= 0) return 'transparent';
  if (minutes < 5) return '#bbf7d0';   // green-200
  if (minutes < 15) return '#86efac';  // green-300
  if (minutes < 30) return '#4ade80';  // green-400
  if (minutes < 60) return '#22c55e';  // green-500
  return '#16a34a';                     // green-600
}

export default function StreakCalendar({ sessions }: StreakCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);

  // Build a map of date -> total practice minutes
  const dayMinutes = useMemo(() => {
    const map = new Map<string, number>();
    for (const session of sessions) {
      const dateKey = toDateKey(new Date(session.startedAt));
      const mins = Math.round(session.durationSeconds / 60);
      map.set(dateKey, (map.get(dateKey) ?? 0) + mins);
    }
    return map;
  }, [sessions]);

  // Generate last 30 days
  const days = useMemo(() => {
    const result: { key: string; date: Date }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      result.push({ key: toDateKey(d), date: d });
    }
    return result;
  }, [today]);

  // Day labels for header
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="bg-surface rounded-xl border border-border p-4 mb-6">
      <h2 className="text-sm font-semibold text-foreground mb-3">Practice Streak</h2>
      <div className="grid grid-cols-10 gap-1.5">
        {days.map(({ key, date }) => {
          const mins = dayMinutes.get(key) ?? 0;
          const isToday = key === todayKey;
          const bgColor = mins > 0 ? getGreenShade(mins) : undefined;

          return (
            <div
              key={key}
              title={`${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}${mins > 0 ? ` - ${mins} min` : ' - No practice'}`}
              className={`aspect-square rounded-sm border transition-colors ${
                isToday
                  ? 'border-primary ring-1 ring-primary/40'
                  : mins > 0
                    ? 'border-green-300'
                    : 'border-border'
              } ${mins === 0 ? 'bg-surface-hover' : ''}`}
              style={bgColor ? { backgroundColor: bgColor } : undefined}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-muted">30 days ago</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted mr-1">Less</span>
          {[0, 5, 15, 30, 60].map((m) => (
            <div
              key={m}
              className="w-2.5 h-2.5 rounded-sm border border-border"
              style={{ backgroundColor: m === 0 ? undefined : getGreenShade(m) }}
            />
          ))}
          <span className="text-[10px] text-muted ml-1">More</span>
        </div>
        <span className="text-[10px] text-muted">Today</span>
      </div>
    </div>
  );
}
