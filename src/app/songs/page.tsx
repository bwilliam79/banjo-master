'use client';

import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db/schema';
import { seedDatabase } from '@/lib/db/seed';
import type { Song } from '@/types/song';
import { getSongDifficulty } from '@/lib/songs/arrangements';
import StarRating from '@/components/ui/StarRating';
import ImportFromLinkModal from '@/components/import/ImportFromLinkModal';

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
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    seedDatabase();
  }, []);

  const songs = useLiveQuery(() => db.songs.toArray(), []);

  const filteredSongs = (songs ?? []).filter((song) => {
    const songDifficulty = getSongDifficulty(song);
    if (selectedDifficulty && songDifficulty !== selectedDifficulty) return false;
    if (selectedStyle && song.style !== selectedStyle) return false;
    if (selectedGenre && song.genre !== selectedGenre) return false;
    return true;
  });

  // Demo: Load songs with explicit Beginner + Intermediate + Advanced arrangements
  async function loadProgressiveDemo() {
    await db.songs.clear();

    const demoSongs: Song[] = [
      {
        id: 'demo-reuben',
        title: 'Reuben (Progressive Demo)',
        artist: 'Traditional',
        genre: 'Old-Time',
        style: 'three-finger',
        duration: 95,
        difficulty: 3,
        chordsUsed: ['G', 'C', 'D'],
        tags: ['classic', 'demo'],
        arrangements: [
          {
            id: 'arr-reuben-1',
            level: 1,
            label: 'Beginner',
            description: 'Simple melody, open strings, steady quarter notes',
            tab: {
              id: 'tab-reuben-1',
              title: 'Reuben - Beginner',
              tuning: ['G', 'D', 'G', 'B', 'D'],
              tempo: 100,
              measures: [
                {
                  timeSignature: [4, 4],
                  notes: [
                    { string: 3, fret: 0, duration: 0.5, offset: 0 },
                    { string: 2, fret: 0, duration: 0.5, offset: 0.5 },
                    { string: 1, fret: 0, duration: 0.5, offset: 1 },
                    { string: 5, fret: 0, duration: 0.5, offset: 1.5 },
                    { string: 3, fret: 0, duration: 0.5, offset: 2 },
                    { string: 2, fret: 0, duration: 0.5, offset: 2.5 },
                    { string: 1, fret: 0, duration: 0.5, offset: 3 },
                    { string: 5, fret: 0, duration: 0.5, offset: 3.5 },
                  ],
                },
              ],
            },
          },
          {
            id: 'arr-reuben-2',
            level: 2,
            label: 'Intermediate',
            description: 'Adds hammer-ons, slight syncopation, rolls',
            tab: {
              id: 'tab-reuben-2',
              title: 'Reuben - Intermediate',
              tuning: ['G', 'D', 'G', 'B', 'D'],
              tempo: 110,
              measures: [
                {
                  timeSignature: [4, 4],
                  notes: [
                    { string: 3, fret: 0, duration: 0.5, offset: 0 },
                    { string: 2, fret: 0, duration: 0.5, offset: 0.5 },
                    { string: 1, fret: 0, duration: 0.25, offset: 1, technique: 'hammer-on' },
                    { string: 5, fret: 0, duration: 0.25, offset: 1.25 },
                    { string: 3, fret: 0, duration: 0.5, offset: 2 },
                    { string: 2, fret: 0, duration: 0.5, offset: 2.5 },
                    { string: 1, fret: 2, duration: 0.5, offset: 3 },
                    { string: 5, fret: 0, duration: 0.5, offset: 3.5 },
                  ],
                },
              ],
            },
          },
          {
            id: 'arr-reuben-3',
            level: 3,
            label: 'Advanced',
            description: 'Full rolls, syncopation, melodic variations',
            tab: {
              id: 'tab-reuben-3',
              title: 'Reuben - Advanced',
              tuning: ['G', 'D', 'G', 'B', 'D'],
              tempo: 125,
              measures: [
                {
                  timeSignature: [4, 4],
                  notes: [
                    { string: 3, fret: 0, duration: 0.25, offset: 0 },
                    { string: 2, fret: 0, duration: 0.25, offset: 0.25 },
                    { string: 1, fret: 0, duration: 0.25, offset: 0.5 },
                    { string: 5, fret: 0, duration: 0.25, offset: 0.75 },
                    { string: 3, fret: 2, duration: 0.25, offset: 1, technique: 'hammer-on' },
                    { string: 2, fret: 1, duration: 0.25, offset: 1.25 },
                    { string: 1, fret: 0, duration: 0.5, offset: 2 },
                    { string: 5, fret: 0, duration: 0.5, offset: 3 },
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        id: 'demo-cripple-advanced',
        title: 'Cripple Creek (with levels)',
        artist: 'Traditional',
        genre: 'Bluegrass',
        style: 'three-finger',
        duration: 120,
        difficulty: 4,
        chordsUsed: ['G', 'C', 'D'],
        tags: ['demo'],
        arrangements: [
          {
            id: 'arr-cc-1',
            level: 1,
            label: 'Beginner',
            description: 'Basic melody only',
            tab: {
              id: 'tab-cc-1',
              title: 'Cripple Creek - Beginner',
              tuning: ['G', 'D', 'G', 'B', 'D'],
              tempo: 110,
              measures: [
                {
                  timeSignature: [4, 4],
                  notes: [
                    { string: 3, fret: 0, duration: 0.5, offset: 0 },
                    { string: 2, fret: 1, duration: 0.5, offset: 0.5 },
                    { string: 5, fret: 0, duration: 0.5, offset: 1 },
                    { string: 1, fret: 0, duration: 0.5, offset: 1.5 },
                  ],
                },
              ],
            },
          },
          {
            id: 'arr-cc-3',
            level: 3,
            label: 'Advanced',
            description: 'Full rolls + syncopation from the original data',
            tab: {
              id: 'tab-cc-3',
              title: 'Cripple Creek - Advanced',
              tuning: ['G', 'D', 'G', 'B', 'D'],
              tempo: 120,
              measures: [
                { timeSignature: [4, 4], notes: [{ string: 3, fret: 0, duration: 0.5, offset: 0 }] },
              ],
            },
          },
        ],
      },
    ];

    await db.songs.bulkAdd(demoSongs);
    window.location.reload();
  }

  async function handleSongCreated(newSong: Song) {
    try {
      await db.songs.add(newSong);
      window.location.reload();
    } catch (e: any) {
      alert('Failed to save imported song: ' + (e?.message || e));
    }
  }

  async function deleteSong(songId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this song from your catalogue? This cannot be undone.')) {
      return;
    }
    try {
      await db.songs.delete(songId);
      // Dexie live query will automatically refresh the list
    } catch (e: any) {
      alert('Failed to delete song: ' + (e?.message || e));
    }
  }

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

        {/* Action buttons for new features */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={loadProgressiveDemo}
            className="px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            Load Progressive Demo Songs
          </button>
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold bg-surface-hover text-foreground border border-border hover:bg-border transition"
          >
            Import from URL (Grok)
          </button>
          <span className="text-xs text-muted self-center ml-2">
            Click "Load Progressive Demo Songs" to see the level switcher
          </span>
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
            {filteredSongs.map((song) => {
              const displayDifficulty = getSongDifficulty(song);
              const hasMultipleLevels = (song.arrangements?.length || 0) > 1;

              return (
                <div
                  key={song.id}
                  onClick={() => router.push(`/songs/${song.id}`)}
                  className="group bg-surface rounded-xl p-4 border border-border text-left transition hover:bg-surface-hover hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate group-hover:underline">{song.title}</h3>
                      <p className="text-sm text-muted truncate">{song.artist}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted tabular-nums">
                        {formatDuration(song.duration)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => deleteSong(song.id, e)}
                        className="p-1 text-muted hover:text-danger transition rounded"
                        title="Delete song"
                        aria-label={`Delete ${song.title}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.595-1.858L5 7m5 4v6m4-6v6m1-10V9a1 1 0 00-1-1h-4a1 1 0 00-1 1v1M5 7h14" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={displayDifficulty} max={5} size="sm" />
                    {hasMultipleLevels && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-medium">
                        3 levels
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                      {STYLE_LABELS[song.style]}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-surface-hover text-muted rounded-full">
                      {song.genre}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ImportFromLinkModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSongCreated={handleSongCreated}
      />
    </div>
  );
}
