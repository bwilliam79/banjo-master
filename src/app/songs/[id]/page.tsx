'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/seed';
import StarRating from '@/components/ui/StarRating';
import TabViewer from '@/components/tab/TabViewer';
import { getArrangements, getTabForLevel, getSongDifficulty } from '@/lib/songs/arrangements';
import ArrangementSwitcher from '@/components/tab/ArrangementSwitcher';
import type { Song } from '@/types/song';

const STYLE_LABELS: Record<string, string> = {
  'three-finger': 'Three-Finger',
  clawhammer: 'Clawhammer',
  melodic: 'Melodic',
  'single-string': 'Single-String',
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const LEVEL_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
};

const LEVEL_COLORS: Record<1 | 2 | 3, string> = {
  1: 'bg-emerald-600 text-white',
  2: 'bg-amber-600 text-white',
  3: 'bg-red-600 text-white',
};

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    seedDatabase();
  }, []);

  const song = useLiveQuery(
    () => db.songs.get(id).then((s) => s ?? null),
    [id],
  );

  if (song === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted">Loading song...</div>
      </div>
    );
  }

  if (song === null) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            type="button"
            onClick={() => router.push('/songs')}
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition mb-6"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Songs
          </button>
          <div className="bg-surface rounded-xl p-6 border border-border text-center text-muted">
            Song not found.
          </div>
        </div>
      </div>
    );
  }

  const arrangements = getArrangements(song);
  const currentTab = getTabForLevel(song, currentLevel) || getArrangements(song)[0]?.tab;
  const displayDifficulty = getSongDifficulty(song);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.push('/songs')}
          className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition mb-6"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Songs
        </button>

        {/* Song header */}
        <div className="bg-surface rounded-xl p-5 border border-border mb-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{song.title}</h1>
              <p className="text-muted mt-0.5">{song.artist}</p>
            </div>
            <span className="text-sm text-muted tabular-nums shrink-0">
              {formatDuration(song.duration)}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={displayDifficulty} max={5} size="md" />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium">
              {STYLE_LABELS[song.style]}
            </span>
            <span className="text-xs px-2.5 py-1 bg-surface-hover text-muted rounded-full">
              {song.genre}
            </span>
          </div>

          {/* Progressive Arrangement Selector */}
          {arrangements.length > 1 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Difficulty Level
              </h3>
              <div className="flex flex-wrap gap-2">
                {([1, 2, 3] as const).map((level) => {
                  const arr = arrangements.find(a => a.level === level);
                  const isActive = currentLevel === level;
                  const isAvailable = !!arr;

                  return (
                    <button
                      key={level}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setCurrentLevel(level)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
                        isActive 
                          ? LEVEL_COLORS[level] + ' border-transparent' 
                          : isAvailable 
                            ? 'bg-surface-hover text-foreground border-border hover:bg-border' 
                            : 'bg-surface text-muted border-border opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {LEVEL_LABELS[level]}
                      {arr?.description && <span className="ml-1 opacity-70 text-xs">({arr.description})</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chords used */}
          {song.chordsUsed.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
                Chords Used
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {song.chordsUsed.map((chord) => (
                  <span
                    key={chord}
                    className="text-sm px-2.5 py-0.5 bg-surface-hover text-foreground rounded-full border border-border font-medium"
                  >
                    {chord}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {song.tags.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1.5">
                {song.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-surface-hover rounded-full text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tablature */}
        <div className="bg-surface rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Tablature</h2>
            {arrangements.length > 0 && (
              <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {LEVEL_LABELS[currentLevel]}
              </span>
            )}
          </div>

          {currentTab ? (
            <TabViewer tab={currentTab} />
          ) : (
            <div className="text-muted text-sm">No tablature available for this level yet.</div>
          )}
        </div>

        {/* Level description */}
        {arrangements.length > 0 && (
          <div className="mt-4 text-sm text-muted">
            {arrangements.find(a => a.level === currentLevel)?.description || 
             `This is the ${LEVEL_LABELS[currentLevel].toLowerCase()} arrangement.`}
          </div>
        )}
      </div>
    </div>
  );
}
