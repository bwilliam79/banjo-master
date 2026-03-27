'use client';

import React from 'react';
import type { Chord } from '@/types/chord';
import ChordDiagram from './ChordDiagram';
import StarRating from '@/components/ui/StarRating';

interface ChordGridProps {
  chords: Chord[];
  onChordSelect?: (chord: Chord) => void;
}

export default function ChordGrid({ chords, onChordSelect }: ChordGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {chords.map((chord) => (
        <button
          key={chord.id}
          type="button"
          onClick={() => onChordSelect?.(chord)}
          className="bg-surface rounded-xl p-4 border border-border hover:border-primary transition cursor-pointer flex flex-col items-center gap-2 text-left"
        >
          <ChordDiagram
            name={chord.name}
            strings={chord.strings}
            fingers={chord.fingers}
            barres={chord.barres}
            size="sm"
            showName={false}
          />
          <span className="text-sm font-semibold text-foreground">{chord.name}</span>
          <StarRating rating={chord.difficulty} max={5} size="sm" />
        </button>
      ))}
    </div>
  );
}
