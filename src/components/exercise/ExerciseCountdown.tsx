'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getAudioContext } from '@/lib/audio/audio-context';

interface ExerciseCountdownProps {
  bpm: number;
  beats: number;
  onComplete: () => void;
}

export default function ExerciseCountdown({
  bpm,
  beats,
  onComplete,
}: ExerciseCountdownProps) {
  const [currentBeat, setCurrentBeat] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatRef = useRef(0);

  useEffect(() => {
    const intervalMs = 60_000 / bpm;

    // Play the first click immediately.
    playClick(true);
    setCurrentBeat(1);
    beatRef.current = 1;

    timerRef.current = setInterval(() => {
      beatRef.current += 1;
      const b = beatRef.current;

      if (b > beats) {
        if (timerRef.current) clearInterval(timerRef.current);
        onComplete();
        return;
      }

      setCurrentBeat(b);
      playClick(b === beats);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-surface rounded-xl border border-border p-8 flex flex-col items-center justify-center min-h-[200px]">
      <p className="text-xs text-muted uppercase tracking-wide mb-4">
        Get Ready
      </p>
      <div className="text-6xl font-bold text-primary tabular-nums mb-6">
        {currentBeat}
      </div>
      <div className="flex gap-3">
        {Array.from({ length: beats }, (_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all ${
              i < currentBeat
                ? 'bg-primary scale-110'
                : 'bg-border'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted mt-4">{bpm} BPM</p>
    </div>
  );
}

function playClick(accent: boolean) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = accent ? 1000 : 800;
    gain.gain.value = 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Audio context may not be ready.
  }
}
