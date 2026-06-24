import Dexie, { type EntityTable } from 'dexie';
import type { Chord } from '@/types/chord';
import type { Song } from '@/types/song';
import type { Lesson } from '@/types/lesson';
import type { PracticeSession, UserProgress } from '@/types/practice';
import { migrateLegacySong } from '@/lib/songs/arrangements';

const db = new Dexie('BanjoMasterDB') as Dexie & {
  chords: EntityTable<Chord, 'id'>;
  songs: EntityTable<Song, 'id'>;
  lessons: EntityTable<Lesson, 'id'>;
  practiceSessions: EntityTable<PracticeSession, 'id'>;
  userProgress: EntityTable<UserProgress, 'id'>;
};

// Version 1 (original)
db.version(1).stores({
  chords: 'id, root, quality, difficulty, category',
  songs: 'id, title, difficulty, genre, style',
  lessons: 'id, moduleId, level, order',
  practiceSessions: '++id, startedAt, endedAt',
  userProgress: 'id',
});

// Version 2: Progressive Arrangements support
db.version(2).stores({
  chords: 'id, root, quality, difficulty, category',
  songs: 'id, title, genre, style',  // difficulty moved into arrangements
  lessons: 'id, moduleId, level, order',
  practiceSessions: '++id, startedAt, endedAt',
  userProgress: 'id',
}).upgrade(async (tx) => {
  // Migrate all existing songs to the new arrangements structure
  const songsTable = tx.table('songs');
  const allSongs = await songsTable.toArray();

  for (const oldSong of allSongs) {
    const migrated = migrateLegacySong(oldSong);
    await songsTable.put(migrated);
  }
});

export { db };