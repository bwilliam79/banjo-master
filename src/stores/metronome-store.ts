import { create } from 'zustand';

interface MetronomeState {
  bpm: number;
  setBpm: (bpm: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  timeSignature: [number, number];
  setTimeSignature: (ts: [number, number]) => void;
  currentBeat: number;
  setCurrentBeat: (beat: number) => void;
  volume: number;
  setVolume: (vol: number) => void;
}

export const useMetronomeStore = create<MetronomeState>((set) => ({
  bpm: 100,
  setBpm: (bpm) => set({ bpm: Math.max(40, Math.min(240, bpm)) }),
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  timeSignature: [4, 4] as [number, number],
  setTimeSignature: (timeSignature) => set({ timeSignature }),
  currentBeat: 0,
  setCurrentBeat: (currentBeat) => set({ currentBeat }),
  volume: 0.8,
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
}));
