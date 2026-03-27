'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useMetronomeStore } from '@/stores/metronome-store';

const TIME_SIGNATURES: [number, number][] = [
  [4, 4],
  [3, 4],
  [6, 8],
  [2, 4],
];

export default function Metronome() {
  const {
    bpm,
    setBpm,
    isPlaying,
    setIsPlaying,
    timeSignature,
    setTimeSignature,
    currentBeat,
    setCurrentBeat,
    volume,
    setVolume,
  } = useMetronomeStore();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const tapTimesRef = useRef<number[]>([]);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playClick = useCallback(
    (time: number, isAccent: boolean) => {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = isAccent ? 1000 : 800;
      gain.gain.setValueAtTime(volume * (isAccent ? 1.0 : 0.6), time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

      osc.start(time);
      osc.stop(time + 0.05);
    },
    [getAudioContext, volume]
  );

  const scheduleAhead = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const scheduleAheadTime = 0.1; // seconds to look ahead
    const beatsPerMeasure = timeSignature[0];

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      const isAccent = currentBeatRef.current === 0;
      playClick(nextNoteTimeRef.current, isAccent);
      setCurrentBeat(currentBeatRef.current);

      // Advance
      const secondsPerBeat = 60.0 / bpm;
      nextNoteTimeRef.current += secondsPerBeat;
      currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerMeasure;
    }
  }, [bpm, timeSignature, playClick, setCurrentBeat]);

  const startMetronome = useCallback(() => {
    const ctx = getAudioContext();
    currentBeatRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime;
    setCurrentBeat(0);
    setIsPlaying(true);
  }, [getAudioContext, setCurrentBeat, setIsPlaying]);

  const stopMetronome = useCallback(() => {
    setIsPlaying(false);
    setCurrentBeat(0);
    currentBeatRef.current = 0;
  }, [setIsPlaying, setCurrentBeat]);

  // Scheduler loop
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(scheduleAhead, 25);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, scheduleAhead]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  }, [isPlaying, startMetronome, stopMetronome]);

  const handleTapTempo = useCallback(() => {
    const now = performance.now();
    const taps = tapTimesRef.current;
    taps.push(now);

    // Keep last 5 taps to compute 4 intervals
    if (taps.length > 5) {
      taps.shift();
    }

    if (taps.length >= 2) {
      // Reset if gap too long (>2s)
      if (now - taps[taps.length - 2] > 2000) {
        tapTimesRef.current = [now];
        return;
      }

      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / avgInterval);
      setBpm(newBpm);
    }
  }, [setBpm]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  const beatsPerMeasure = timeSignature[0];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* BPM Display */}
      <div className="text-center">
        <div className="text-6xl font-bold text-foreground tabular-nums">{bpm}</div>
        <div className="text-sm text-muted mt-1">BPM</div>
      </div>

      {/* BPM Slider */}
      <div className="w-full px-4">
        <input
          type="range"
          min={40}
          max={240}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full accent-primary h-2 rounded-full appearance-none bg-border cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>40</span>
          <span>240</span>
        </div>
      </div>

      {/* Fine adjustment & Tap */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setBpm(bpm - 5)}
          className="w-12 h-10 rounded-lg bg-surface-hover text-foreground font-semibold text-sm hover:bg-border transition"
        >
          -5
        </button>
        <button
          type="button"
          onClick={() => setBpm(bpm - 1)}
          className="w-10 h-10 rounded-lg bg-surface-hover text-foreground font-semibold text-sm hover:bg-border transition"
        >
          -1
        </button>
        <button
          type="button"
          onClick={handleTapTempo}
          className="px-5 h-10 rounded-lg bg-surface-hover text-foreground font-semibold text-sm hover:bg-border transition"
        >
          Tap
        </button>
        <button
          type="button"
          onClick={() => setBpm(bpm + 1)}
          className="w-10 h-10 rounded-lg bg-surface-hover text-foreground font-semibold text-sm hover:bg-border transition"
        >
          +1
        </button>
        <button
          type="button"
          onClick={() => setBpm(bpm + 5)}
          className="w-12 h-10 rounded-lg bg-surface-hover text-foreground font-semibold text-sm hover:bg-border transition"
        >
          +5
        </button>
      </div>

      {/* Beat Visualizer */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: beatsPerMeasure }, (_, i) => {
          const isActive = isPlaying && currentBeat === i;
          const isAccent = i === 0;
          return (
            <div
              key={i}
              className={`rounded-full transition-all duration-100 ${
                isActive
                  ? 'bg-primary scale-110'
                  : 'bg-border'
              } ${isAccent ? 'w-5 h-5' : 'w-4 h-4'}`}
            />
          );
        })}
      </div>

      {/* Play/Stop Button */}
      <button
        type="button"
        onClick={togglePlayback}
        className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 active:scale-95 transition"
        aria-label={isPlaying ? 'Stop' : 'Play'}
      >
        {isPlaying ? (
          <svg width={28} height={28} viewBox="0 0 24 24" fill="currentColor">
            <rect x={6} y={5} width={4} height={14} rx={1} />
            <rect x={14} y={5} width={4} height={14} rx={1} />
          </svg>
        ) : (
          <svg width={28} height={28} viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>

      {/* Time Signature */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">Time</span>
        {TIME_SIGNATURES.map(([num, den]) => {
          const isActive = timeSignature[0] === num && timeSignature[1] === den;
          return (
            <button
              key={`${num}/${den}`}
              type="button"
              onClick={() => {
                setTimeSignature([num, den]);
                if (isPlaying) {
                  stopMetronome();
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-surface-hover text-foreground hover:bg-border'
              }`}
            >
              {num}/{den}
            </button>
          );
        })}
      </div>

      {/* Volume */}
      <div className="w-full px-4 flex items-center gap-3">
        <svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="text-muted shrink-0"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          {volume > 0.3 && <path d="M15.54 8.46a5 5 0 010 7.07" />}
          {volume > 0.6 && <path d="M19.07 4.93a10 10 0 010 14.14" />}
        </svg>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full accent-primary h-2 rounded-full appearance-none bg-border cursor-pointer"
        />
      </div>
    </div>
  );
}
