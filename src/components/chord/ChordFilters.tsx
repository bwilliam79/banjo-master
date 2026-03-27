'use client';

import React from 'react';

interface ChordFiltersProps {
  selectedRoot: string | null;
  selectedQuality: string | null;
  selectedDifficulty: number | null;
  onRootChange: (root: string | null) => void;
  onQualityChange: (quality: string | null) => void;
  onDifficultyChange: (difficulty: number | null) => void;
}

const ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Bb', 'Eb', 'Ab'];
const QUALITIES = ['Major', 'Minor', '7th', 'Maj7', 'Min7', 'Sus', 'Dim', 'Aug'];

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition ${
        active
          ? 'bg-primary text-white'
          : 'bg-surface-hover text-foreground hover:bg-border'
      }`}
    >
      {label}
    </button>
  );
}

export default function ChordFilters({
  selectedRoot,
  selectedQuality,
  selectedDifficulty,
  onRootChange,
  onQualityChange,
  onDifficultyChange,
}: ChordFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Root notes */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <span className="shrink-0 text-xs font-semibold text-muted uppercase tracking-wide">
          Root
        </span>
        <Pill label="All" active={selectedRoot === null} onClick={() => onRootChange(null)} />
        {ROOTS.map((root) => (
          <Pill
            key={root}
            label={root}
            active={selectedRoot === root}
            onClick={() => onRootChange(selectedRoot === root ? null : root)}
          />
        ))}
      </div>

      {/* Qualities */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <span className="shrink-0 text-xs font-semibold text-muted uppercase tracking-wide">
          Type
        </span>
        <Pill
          label="All"
          active={selectedQuality === null}
          onClick={() => onQualityChange(null)}
        />
        {QUALITIES.map((q) => (
          <Pill
            key={q}
            label={q}
            active={selectedQuality === q}
            onClick={() => onQualityChange(selectedQuality === q ? null : q)}
          />
        ))}
      </div>

      {/* Difficulty */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <span className="shrink-0 text-xs font-semibold text-muted uppercase tracking-wide">
          Level
        </span>
        <Pill
          label="All"
          active={selectedDifficulty === null}
          onClick={() => onDifficultyChange(null)}
        />
        {[1, 2, 3, 4, 5].map((d) => (
          <Pill
            key={d}
            label={`${'★'.repeat(d)}`}
            active={selectedDifficulty === d}
            onClick={() => onDifficultyChange(selectedDifficulty === d ? null : d)}
          />
        ))}
      </div>
    </div>
  );
}
