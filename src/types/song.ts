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

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  style: 'three-finger' | 'clawhammer' | 'melodic' | 'single-string';
  tab: Tab;
  chordsUsed: string[];
  duration: number;
  tags: string[];
}
