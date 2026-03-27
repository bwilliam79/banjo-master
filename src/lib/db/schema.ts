import Dexie, { type EntityTable } from 'dexie';
import type { Chord } from '@/types/chord';
import type { Song } from '@/types/song';
import type { Lesson } from '@/types/lesson';
import type { PracticeSession, UserProgress } from '@/types/practice';

const db = new Dexie('BanjoMasterDB') as Dexie & {
  chords: EntityTable<Chord, 'id'>;
  songs: EntityTable<Song, 'id'>;
  lessons: EntityTable<Lesson, 'id'>;
  practiceSessions: EntityTable<PracticeSession, 'id'>;
  userProgress: EntityTable<UserProgress, 'id'>;
};

db.version(1).stores({
  chords: 'id, root, quality, difficulty, category',
  songs: 'id, title, difficulty, genre, style',
  lessons: 'id, moduleId, level, order',
  practiceSessions: '++id, startedAt, endedAt',
  userProgress: 'id',
});

export { db };
