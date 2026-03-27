export interface Exercise {
  id: string;
  type: 'play-chord' | 'play-tab' | 'rhythm' | 'ear-training';
  prompt: string;
  data: Record<string, unknown>;
  passingScore: number;
}

export interface LessonContent {
  type: 'text' | 'chord-diagram' | 'tab' | 'video' | 'exercise';
  content: string;
  data?: Record<string, unknown>;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  moduleId: string;
  moduleName: string;
  objectives: string[];
  content: LessonContent[];
  exercises: Exercise[];
  prerequisiteIds: string[];
  estimatedMinutes: number;
}
