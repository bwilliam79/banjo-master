export interface Chord {
  id: string;
  name: string;
  root: string;
  quality: string;
  strings: [number, number, number, number, number]; // fret for strings 5,4,3,2,1 (-1=muted, 0=open)
  fingers: [number, number, number, number, number]; // 0=none, 1=index, 2=middle, 3=ring, 4=pinky
  barres?: { fromString: number; toString: number; fret: number }[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: 'open' | 'barre' | 'moveable';
  tags: string[];
}
