'use client';

import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/seed';
import type { Song } from '@/types/song';
import StarRating from '@/components/ui/StarRating';

const STYLES: Song['style'][] = ['three-finger', 'clawhammer', 'melodic', 'single-string'];
const GENRES = ['Bluegrass', 'Old-Time'];

const STYLE_LABELS: Record<string, string> = {
  'three-finger': 'Three-Finger',
  clawhammer: 'Clawhammer',
  melodic: 'Melodic',
  'single-string': 'Single-String',
};

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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SongsPage() {
  const router = useRouter();
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  useEffect(() => {
    seedDatabase();
  }, []);

  const songs = useLiveQuery(() => db.songs.toArray(), []);

  const filteredSongs = (songs ?? []).filter((song) => {
    if (selectedDifficulty && song.difficulty !== selectedDifficulty) return false;
    if (selectedStyle && song.style !== selectedStyle) return false;
    if (selectedGenre && song.genre !== selectedGenre) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Song Library</h1>
          <p className="text-sm text-muted mt-1">
            {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Difficulty */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="shrink-0 text-xs font-semibold text-muted uppercase tracking-wide">
              Level
            </span>
            <Pill
              label="All"
              active={selectedDifficulty === null}
              onClick={() => setSelectedDifficulty(null)}
            />
            {[1, 2, 3, 4, 5].map((d) => (
              <Pill
                key={d}
                label={`${'★'.repeat(d)}`}
                active={selectedDifficulty === d}
                onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
              />
            ))}
          </div>

          {/* Style */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="shrink-0 text-xs font-semibold text-muted uppercase tracking-wide">
              Style
            </span>
            <Pill
              label="All"
              active={selectedStyle === null}
              onClick={() => setSelectedStyle(null)}
            />
            {STYLES.map((s) => (
              <Pill
                key={s}
                label={STYLE_LABELS[s]}
                active={selectedStyle === s}
                onClick={() => setSelectedStyle(selectedStyle === s ? null : s)}
              />
            ))}
          </div>

          {/* Genre */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="shrink-0 text-xs font-semibold text-muted uppercase tracking-wide">
              Genre
            </span>
            <Pill
              label="All"
              active={selectedGenre === null}
              onClick={() => setSelectedGenre(null)}
            />
            {GENRES.map((g) => (
              <Pill
                key={g}
                label={g}
                active={selectedGenre === g}
                onClick={() => setSelectedGenre(selectedGenre === g ? null : g)}
              />
            ))}
          </div>
        </div>

        {/* Song List */}
        {!songs ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted">Loading songs...</div>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted">No songs match your filters.</div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSongs.map((song) => (
              <button
                key={song.id}
                type="button"
                onClick={() => router.push(`/songs/${song.id}`)}
                className="bg-surface rounded-xl p-4 border border-border text-left transition hover:bg-surface-hover hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{song.title}</h3>
                    <p className="text-sm text-muted truncate">{song.artist}</p>
                  </div>
                  <span className="text-xs text-muted tabular-nums shrink-0">
                    {formatDuration(song.duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={song.difficulty} max={5} size="sm" />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                    {STYLE_LABELS[song.style]}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-surface-hover text-muted rounded-full">
                    {song.genre}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
