'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/seed';
import type { Chord } from '@/types/chord';
import ChordGrid from '@/components/chord/ChordGrid';
import ChordFilters from '@/components/chord/ChordFilters';
import ChordDiagram from '@/components/chord/ChordDiagram';
import StarRating from '@/components/ui/StarRating';

export default function ChordsPage() {
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [activeChord, setActiveChord] = useState<Chord | null>(null);

  useEffect(() => {
    seedDatabase();
  }, []);

  const chords = useLiveQuery(() => db.chords.toArray(), []);

  const filteredChords = (chords ?? []).filter((chord) => {
    if (selectedRoot && chord.root !== selectedRoot) return false;
    if (selectedQuality && chord.quality !== selectedQuality) return false;
    if (selectedDifficulty && chord.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const handleChordSelect = useCallback((chord: Chord) => {
    setActiveChord(chord);
  }, []);

  const closeModal = useCallback(() => {
    setActiveChord(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Chord Library</h1>
          <p className="text-sm text-muted mt-1">
            {filteredChords.length} chord{filteredChords.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ChordFilters
            selectedRoot={selectedRoot}
            selectedQuality={selectedQuality}
            selectedDifficulty={selectedDifficulty}
            onRootChange={setSelectedRoot}
            onQualityChange={setSelectedQuality}
            onDifficultyChange={setSelectedDifficulty}
          />
        </div>

        {/* Grid */}
        {!chords ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted">Loading chords...</div>
          </div>
        ) : filteredChords.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted">No chords match your filters.</div>
          </div>
        ) : (
          <ChordGrid chords={filteredChords} onChordSelect={handleChordSelect} />
        )}
      </div>

      {/* Modal */}
      {activeChord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">{activeChord.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-surface-hover rounded-full text-muted">
                    {activeChord.category}
                  </span>
                  <StarRating rating={activeChord.difficulty} max={5} size="sm" />
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted hover:text-foreground transition p-1"
                aria-label="Close"
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex justify-center mb-4">
              <ChordDiagram
                name={activeChord.name}
                strings={activeChord.strings}
                fingers={activeChord.fingers}
                barres={activeChord.barres}
                size="lg"
                showName={false}
              />
            </div>

            {activeChord.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeChord.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-surface-hover rounded-full text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
