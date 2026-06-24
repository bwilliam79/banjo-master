'use client';

import React from 'react';
import type { Arrangement } from '@/types/song';

interface ArrangementSwitcherProps {
  arrangements: Arrangement[];
  currentLevel: 1 | 2 | 3;
  onLevelChange: (level: 1 | 2 | 3) => void;
}

const LEVEL_LABELS = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
} as const;

const LEVEL_CLASSES = {
  1: 'bg-emerald-600 hover:bg-emerald-700',
  2: 'bg-amber-600 hover:bg-amber-700',
  3: 'bg-red-600 hover:bg-red-700',
} as const;

export default function ArrangementSwitcher({
  arrangements,
  currentLevel,
  onLevelChange,
}: ArrangementSwitcherProps) {
  if (arrangements.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {([1, 2, 3] as const).map((level) => {
        const arr = arrangements.find((a) => a.level === level);
        const isActive = currentLevel === level;
        const isAvailable = !!arr;

        return (
          <button
            key={level}
            type="button"
            disabled={!isAvailable}
            onClick={() => onLevelChange(level)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition text-white disabled:opacity-40 disabled:cursor-not-allowed ${
              isActive 
                ? LEVEL_CLASSES[level] + ' ring-2 ring-offset-2 ring-offset-background ring-white/70' 
                : 'bg-surface-hover text-foreground hover:bg-border'
            }`}
            title={arr?.description}
          >
            {LEVEL_LABELS[level]}
            {isAvailable && arr.description && (
              <span className="ml-1.5 text-[10px] opacity-70">•</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
