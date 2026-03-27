'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/seed';
import StarRating from '@/components/ui/StarRating';
import TabViewer from '@/components/tab/TabViewer';

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

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

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
            <StarRating rating={song.difficulty} max={5} size="md" />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-medium">
              {STYLE_LABELS[song.style]}
            </span>
            <span className="text-xs px-2.5 py-1 bg-surface-hover text-muted rounded-full">
              {song.genre}
            </span>
          </div>

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
          <h2 className="text-lg font-bold text-foreground mb-4">Tablature</h2>
          <TabViewer tab={song.tab} />
        </div>
      </div>
    </div>
  );
}
