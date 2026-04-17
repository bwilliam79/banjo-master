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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beatRef = useRef(0);

  // Keep the latest bpm / callbacks in refs so the scheduled tick reads
  // the current value without needing to re-setup the whole countdown
  // (which would reset the beat count) when bpm changes mid-countdown.
  const bpmRef = useRef(bpm);
  const beatsRef = useRef(beats);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);
  useEffect(() => {
    beatsRef.current = beats;
  }, [beats]);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Anchor each beat to a scheduled wall-clock time rather than re-adding
    // the interval from wherever the last setTimeout happened to fire.
    // setTimeout(fn, N) waits *at least* N ms; over several beats that slop
    // compounds into audible drift on the metronome clicks.
    let nextBeatAt = performance.now() + 60_000 / bpmRef.current;

    playClick(true);
    setCurrentBeat(1);
    beatRef.current = 1;

    const tick = () => {
      beatRef.current += 1;
      const b = beatRef.current;

      if (b > beatsRef.current) {
        onCompleteRef.current();
        return;
      }

      setCurrentBeat(b);
      playClick(b === beatsRef.current);

      // Add the interval to the *scheduled* time, not the current time,
      // so a late tick doesn't push subsequent beats later too.
      nextBeatAt += 60_000 / bpmRef.current;
      const delay = Math.max(0, nextBeatAt - performance.now());
      timerRef.current = setTimeout(tick, delay);
    };

    const initialDelay = Math.max(0, nextBeatAt - performance.now());
    timerRef.current = setTimeout(tick, initialDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="bg-surface rounded-xl border border-border p-8 flex flex-col items-center justify-center min-h-[200px] shadow-sm">
      <p className="font-hand text-2xl text-muted mb-2">
        Get ready…
      </p>
      <div className="font-serif text-7xl font-semibold text-primary tabular-nums mb-6">
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
