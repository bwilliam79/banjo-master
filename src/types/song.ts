export interface TabNote {
  string: 1 | 2 | 3 | 4 | 5;
  fret: number;
  duration: number;
  technique?: 'hammer-on' | 'pull-off' | 'slide' | 'bend' | 'choke';
  offset: number;
}

export interface TabMeasure {
  notes: TabNote[];
  timeSignature: [number, number];
}

export interface Tab {
  id: string;
  title: string;
  measures: TabMeasure[];
  tuning: [string, string, string, string, string];
  tempo: number;
  capo?: number;
}

// New: Progressive difficulty arrangements
export interface Arrangement {
  id: string;
  level: 1 | 2 | 3;           // 1 = Beginner, 2 = Intermediate, 3 = Advanced
  label: string;              // "Beginner", "Intermediate", "Advanced"
  tab: Tab;
  description?: string;       // short learning notes for this level
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  style: 'three-finger' | 'clawhammer' | 'melodic' | 'single-string';
  arrangements: Arrangement[];   // Replaces the old single `tab`
  chordsUsed: string[];
  duration: number;
  tags: string[];
  // Legacy fields kept temporarily for migration
  difficulty?: 1 | 2 | 3 | 4 | 5;
  tab?: Tab;
}
