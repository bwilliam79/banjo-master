import type { UserProgress } from '@/types/practice';
import type { Song } from '@/types/song';
import type { IconName } from '@/components/ui/TypeIcon';

export interface Recommendation {
  id: string;
  type: 'lesson' | 'song' | 'chord-practice' | 'technique' | 'review';
  title: string;
  description: string;
  priority: number;
  link: string;
  icon: IconName;
}

const ALL_LESSON_IDS = [
  'lesson-01',
  'lesson-02',
  'lesson-03',
  'lesson-04',
  'lesson-05',
  'lesson-06',
  'lesson-07',
  'lesson-08',
  'lesson-09',
  'lesson-10',
];

const SKILL_TECHNIQUES: Record<string, { name: string; description: string; icon: IconName }> = {
  chords: { name: 'Chord Transitions', description: 'Practice switching between chords smoothly and quickly.', icon: 'music-note' },
  picking: { name: 'Picking Patterns', description: 'Work on your right-hand picking accuracy and speed.', icon: 'pluck' },
  timing: { name: 'Rhythm & Timing', description: 'Practice with a metronome to tighten your timing.', icon: 'timer' },
  repertoire: { name: 'Song Review', description: 'Revisit songs you have learned to keep them fresh.', icon: 'book-open' },
  theory: { name: 'Music Theory Basics', description: 'Study scales, intervals, and chord construction.', icon: 'ruler' },
};

function getDaysSince(dateStr: string): number {
  if (!dateStr) return Infinity;
  const last = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function difficultyFromLessons(completedCount: number): number {
  if (completedCount <= 2) return 1;
  if (completedCount <= 4) return 2;
  if (completedCount <= 6) return 3;
  if (completedCount <= 8) return 4;
  return 5;
}

export function generateRecommendations(
  progress: UserProgress,
  completedLessons: string[],
  songs: Song[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. If no lessons completed, recommend lesson-01
  if (completedLessons.length === 0) {
    recommendations.push({
      id: 'rec-first-lesson',
      type: 'lesson',
      title: 'Start Your First Lesson',
      description: 'Begin your banjo journey with "Meet Your Banjo" -- learn the parts, holding position, and tuning.',
      priority: 100,
      link: '/lessons/lesson-01',
      icon: 'target',
    });
  }

  // 2. Suggest the next uncompleted lesson in order
  const nextLesson = ALL_LESSON_IDS.find((id) => !completedLessons.includes(id));
  if (nextLesson && completedLessons.length > 0) {
    const lessonNum = nextLesson.replace('lesson-', '');
    recommendations.push({
      id: `rec-next-${nextLesson}`,
      type: 'lesson',
      title: `Continue to Lesson ${parseInt(lessonNum, 10)}`,
      description: `You have completed ${completedLessons.length} lessons. Keep the momentum going with the next one!`,
      priority: 90,
      link: `/lessons/${nextLesson}`,
      icon: 'library',
    });
  }

  // 3. If a skill level is low, recommend related exercises
  const skillEntries = Object.entries(progress.skillLevels) as [string, number][];
  const weakSkills = skillEntries
    .filter(([, level]) => level < 30)
    .sort((a, b) => a[1] - b[1]);

  for (const [skill] of weakSkills.slice(0, 2)) {
    const technique = SKILL_TECHNIQUES[skill];
    if (technique) {
      recommendations.push({
        id: `rec-technique-${skill}`,
        type: 'technique',
        title: `Improve: ${technique.name}`,
        description: technique.description,
        priority: 70 - (progress.skillLevels[skill as keyof typeof progress.skillLevels] ?? 0),
        link: skill === 'timing' ? '/tools/metronome' : '/practice',
        icon: technique.icon,
      });
    }
  }

  // 4. If streak is broken (lastPracticeDate > 1 day ago), suggest an easy review
  const daysSincePractice = getDaysSince(progress.lastPracticeDate);
  if (daysSincePractice > 1 && completedLessons.length > 0) {
    const reviewLesson = completedLessons[completedLessons.length - 1];
    recommendations.push({
      id: 'rec-review-streak',
      type: 'review',
      title: 'Welcome Back! Quick Review',
      description: `It has been ${daysSincePractice === Infinity ? 'a while' : `${daysSincePractice} days`} since your last practice. Start with a quick review to warm up.`,
      priority: 85,
      link: `/lessons/${reviewLesson}`,
      icon: 'sparkles',
    });
  }

  // 5. Recommend songs that match current difficulty level
  const currentDifficulty = difficultyFromLessons(completedLessons.length);
  const matchingSongs = songs
    .filter((s) => s.difficulty <= currentDifficulty)
    .sort((a, b) => b.difficulty - a.difficulty)
    .slice(0, 3);

  for (const song of matchingSongs) {
    recommendations.push({
      id: `rec-song-${song.id}`,
      type: 'song',
      title: `Play: ${song.title}`,
      description: `${song.artist} -- ${song.genre} (Difficulty ${song.difficulty}/5). A great match for your current level.`,
      priority: 50 + song.difficulty * 5,
      link: `/songs/${song.id}`,
      icon: 'music-note',
    });
  }

  // 6. Suggest chord practice for chords used in upcoming songs
  const upcomingSongs = songs
    .filter((s) => s.difficulty === currentDifficulty || s.difficulty === currentDifficulty + 1)
    .slice(0, 5);
  const chordsToLearn = new Set<string>();
  for (const song of upcomingSongs) {
    for (const chord of song.chordsUsed) {
      chordsToLearn.add(chord);
    }
  }

  if (chordsToLearn.size > 0) {
    const chordList = Array.from(chordsToLearn).slice(0, 4).join(', ');
    recommendations.push({
      id: 'rec-chord-practice',
      type: 'chord-practice',
      title: 'Practice Key Chords',
      description: `Work on these chords for upcoming songs: ${chordList}.`,
      priority: 60,
      link: '/chords',
      icon: 'hand',
    });
  }

  // Sort by priority descending and return
  return recommendations.sort((a, b) => b.priority - a.priority);
}
