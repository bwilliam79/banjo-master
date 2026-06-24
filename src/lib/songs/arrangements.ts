import type { Song, Arrangement, Tab } from '@/types/song';

/**
 * Returns all arrangements for a song.
 * Falls back to legacy single-tab data during migration.
 */
export function getArrangements(song: Song): Arrangement[] {
  if (song.arrangements && song.arrangements.length > 0) {
    return song.arrangements;
  }

  // Legacy migration path
  if (song.tab) {
    const level = (song.difficulty as 1 | 2 | 3) || 3;
    return [{
      id: `legacy-${song.id}`,
      level,
      label: level === 1 ? 'Beginner' : level === 2 ? 'Intermediate' : 'Advanced',
      tab: song.tab,
      description: 'Migrated from legacy data',
    }];
  }

  return [];
}

/**
 * Get the tab for a specific difficulty level.
 */
export function getTabForLevel(song: Song, level: 1 | 2 | 3): Tab | null {
  const arrangements = getArrangements(song);
  const arr = arrangements.find(a => a.level === level);
  return arr?.tab ?? null;
}

/**
 * Derive an overall difficulty rating (1-5) for filtering / display.
 * Uses the highest available arrangement level as a proxy for now.
 */
export function getSongDifficulty(song: Song): 1 | 2 | 3 | 4 | 5 {
  if (typeof song.difficulty === 'number') {
    return song.difficulty;
  }

  const arrangements = getArrangements(song);
  if (arrangements.length === 0) return 1;

  const maxLevel = Math.max(...arrangements.map(a => a.level)) as 1 | 2 | 3;
  // Map 3 levels to 1-5 scale roughly: Beginner=2, Intermediate=3, Advanced=5
  return maxLevel === 1 ? 2 : maxLevel === 2 ? 3 : 5;
}

/**
 * Get the default tab (Beginner if available, otherwise first).
 */
export function getDefaultTab(song: Song): Tab | null {
  const beginner = getTabForLevel(song, 1);
  if (beginner) return beginner;

  const arrangements = getArrangements(song);
  return arrangements[0]?.tab ?? null;
}

/**
 * Convert a legacy Song shape into the new multi-arrangement shape.
 */
export function migrateLegacySong(legacy: any): Song {
  if (legacy.arrangements && legacy.arrangements.length > 0) {
    return legacy as Song;
  }

  const level = (legacy.difficulty as 1 | 2 | 3) || 3;
  const tab = legacy.tab;

  return {
    ...legacy,
    arrangements: tab ? [{
      id: `arr-${legacy.id || 'legacy'}`,
      level,
      label: level === 1 ? 'Beginner' : level === 2 ? 'Intermediate' : 'Advanced',
      tab,
      description: undefined,
    }] : [],
    difficulty: legacy.difficulty,
    tab: undefined, // we keep the old tab temporarily if needed
  };
}