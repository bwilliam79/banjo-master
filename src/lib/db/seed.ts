import { db } from './schema';
import chordData from '@/data/chords.json';
import songData from '@/data/songs.json';
import lessonData from '@/data/lessons.json';
import type { Chord } from '@/types/chord';
import type { Song } from '@/types/song';
import type { Lesson } from '@/types/lesson';
import type { UserProgress } from '@/types/practice';

export async function seedDatabase() {
  const chordCount = await db.chords.count();
  if (chordCount === 0) {
    await db.chords.bulkAdd(chordData as Chord[]);
  }

  const songCount = await db.songs.count();
  if (songCount === 0) {
    await db.songs.bulkAdd(songData as Song[]);
  }

  const lessonCount = await db.lessons.count();
  if (lessonCount === 0) {
    await db.lessons.bulkAdd(lessonData as Lesson[]);
  }

  const progressCount = await db.userProgress.count();
  if (progressCount === 0) {
    const defaultProgress: UserProgress = {
      id: 'singleton',
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: '',
      totalPracticeMinutes: 0,
      completedLessonIds: [],
      unlockedAchievementIds: [],
      skillLevels: {
        chords: 0,
        picking: 0,
        timing: 0,
        repertoire: 0,
        theory: 0,
      },
      preferences: {
        style: 'three-finger',
        dailyGoalMinutes: 15,
        metronomeDefaultBpm: 100,
      },
    };
    await db.userProgress.add(defaultProgress);
  }
}
