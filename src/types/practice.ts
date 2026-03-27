export interface PracticeSession {
  id?: number;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds: number;
  activities: PracticeActivity[];
  notes: string;
  mood: 1 | 2 | 3 | 4 | 5;
}

export interface PracticeActivity {
  type: 'chord-practice' | 'song' | 'lesson' | 'exercise' | 'free-play';
  referenceId?: string;
  durationSeconds: number;
  scores?: {
    accuracy?: number;
    timing?: number;
    handPlacement?: number;
  };
}

export interface UserProgress {
  id: string; // 'singleton'
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  totalPracticeMinutes: number;
  completedLessonIds: string[];
  unlockedAchievementIds: string[];
  skillLevels: {
    chords: number;
    picking: number;
    timing: number;
    repertoire: number;
    theory: number;
  };
  preferences: {
    style: 'three-finger' | 'clawhammer' | 'both';
    dailyGoalMinutes: number;
    metronomeDefaultBpm: number;
  };
}
