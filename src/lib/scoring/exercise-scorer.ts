/**
 * Composite exercise scoring and progress update logic.
 */

import { db } from '@/lib/db/schema';
import type { PracticeSession, UserProgress } from '@/types/practice';

export interface ExerciseScores {
  accuracy: number;
  timing: number;
  handPlacement: number;
}

export interface ExerciseResult {
  exerciseId: string;
  lessonId: string;
  exerciseType: string;
  scores: ExerciseScores;
  durationSeconds: number;
  passed: boolean;
  passingScore: number;
}

/**
 * Compute a weighted composite score.
 * If camera was not used (handPlacement === -1), it's excluded.
 */
export function compositeScore(scores: ExerciseScores): number {
  if (scores.handPlacement < 0) {
    // No camera — 50/50 split.
    return Math.round(scores.accuracy * 0.5 + scores.timing * 0.5);
  }
  return Math.round(
    scores.accuracy * 0.4 + scores.timing * 0.4 + scores.handPlacement * 0.2,
  );
}

/**
 * Map exercise type to the corresponding skill level key.
 */
function exerciseTypeToSkill(
  type: string,
): keyof UserProgress['skillLevels'] | null {
  switch (type) {
    case 'play-chord':
      return 'chords';
    case 'play-tab':
      return 'picking';
    case 'rhythm':
      return 'timing';
    case 'ear-training':
      return 'theory';
    default:
      return null;
  }
}

/**
 * Save exercise result to the database and update user progress.
 */
export async function saveExerciseResult(result: ExerciseResult): Promise<void> {
  const progress = await db.userProgress.get('singleton');
  if (!progress) return;

  // Create a practice session record.
  const session: PracticeSession = {
    startedAt: new Date(),
    durationSeconds: result.durationSeconds,
    activities: [
      {
        type: 'exercise',
        referenceId: result.exerciseId,
        durationSeconds: result.durationSeconds,
        scores: {
          accuracy: result.scores.accuracy,
          timing: result.scores.timing,
          handPlacement:
            result.scores.handPlacement >= 0
              ? result.scores.handPlacement
              : undefined,
        },
      },
    ],
    notes: `Exercise ${result.exerciseId} from lesson ${result.lessonId}`,
    mood: 3,
  };
  await db.practiceSessions.add(session);

  // Update skill level (small increment per exercise).
  const skill = exerciseTypeToSkill(result.exerciseType);
  const overall = compositeScore(result.scores);

  const updates: Partial<UserProgress> = {
    totalPracticeMinutes:
      progress.totalPracticeMinutes + Math.ceil(result.durationSeconds / 60),
    lastPracticeDate: new Date().toISOString().split('T')[0],
  };

  if (skill) {
    const currentLevel = progress.skillLevels[skill];
    const increment = (overall / 100) * 2; // Up to 2 points per exercise.
    updates.skillLevels = {
      ...progress.skillLevels,
      [skill]: Math.min(100, currentLevel + increment),
    };
  }

  // Update streak.
  const today = new Date().toISOString().split('T')[0];
  const lastDate = progress.lastPracticeDate;
  if (lastDate !== today) {
    const yesterday = new Date(Date.now() - 86_400_000)
      .toISOString()
      .split('T')[0];
    if (lastDate === yesterday) {
      updates.currentStreak = progress.currentStreak + 1;
      updates.longestStreak = Math.max(
        progress.longestStreak,
        progress.currentStreak + 1,
      );
    } else if (!lastDate) {
      updates.currentStreak = 1;
      updates.longestStreak = Math.max(progress.longestStreak, 1);
    } else {
      updates.currentStreak = 1;
    }
  }

  await db.userProgress.update('singleton', updates);
}
