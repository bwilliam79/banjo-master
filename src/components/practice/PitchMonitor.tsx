'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createAnalyser, cleanupAudio, getAudioContext } from '@/lib/audio/audio-context';
import { detectPitch, type PitchResult } from '@/lib/audio/pitch-detector';

export default function PitchMonitor() {
  const [active, setActive] = useState(false);
  const [pitch, setPitch] = useState<PitchResult | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Running accuracy tracker
  const samplesRef = useRef<{ inTune: number; total: number }>({ inTune: 0, total: 0 });
  const smoothedCentsRef = useRef(0);

  const tick = useCallback(() => {
    if (!analyserRef.current) return;

    const result = detectPitch(analyserRef.current);
    if (result) {
      smoothedCentsRef.current =
        smoothedCentsRef.current * 0.5 + result.cents * 0.5;

      const smoothed: PitchResult = {
        ...result,
        cents: Math.round(smoothedCentsRef.current),
      };
      setPitch(smoothed);

      // Update accuracy
      samplesRef.current.total++;
      if (Math.abs(smoothed.cents) <= 10) {
        samplesRef.current.inTune++;
      }
      const pct = Math.round(
        (samplesRef.current.inTune / samplesRef.current.total) * 100
      );
      setAccuracy(pct);
    } else {
      setPitch(null);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      getAudioContext();
      const analyser = await createAnalyser();
      analyserRef.current = analyser;
      samplesRef.current = { inTune: 0, total: 0 };
      smoothedCentsRef.current = 0;
      setAccuracy(null);
      setPitch(null);
      setActive(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Microphone error.');
      setActive(false);
    }
  }, [tick]);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    cleanupAudio();
    analyserRef.current = null;
    setActive(false);
    setPitch(null);
  }, []);

  const toggle = useCallback(() => {
    if (active) stop();
    else start();
  }, [active, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      cleanupAudio();
    };
  }, []);

  const absCents = pitch ? Math.abs(pitch.cents) : 0;
  const dotColor = !pitch
    ? 'bg-muted'
    : absCents <= 5
      ? 'bg-success'
      : absCents <= 15
        ? 'bg-warning'
        : 'bg-danger';

  return (
    <div className="flex items-center gap-3 bg-surface rounded-xl border border-border px-4 py-3">
      {/* Toggle */}
      <button
        type="button"
        onClick={toggle}
        className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition ${
          active
            ? 'bg-danger/10 text-danger hover:bg-danger/20'
            : 'bg-surface-hover text-foreground hover:bg-border'
        }`}
        aria-label={active ? 'Stop pitch monitor' : 'Start pitch monitor'}
      >
        {active ? (
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <rect x={6} y={6} width={12} height={12} rx={2} />
          </svg>
        ) : (
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x={9} y={1} width={6} height={12} rx={3} />
            <path d="M19 10v2a7 7 0 01-14 0v-2" />
            <line x1={12} y1={19} x2={12} y2={23} />
            <line x1={8} y1={23} x2={16} y2={23} />
          </svg>
        )}
      </button>

      {active ? (
        <>
          {/* In-tune dot */}
          <div className={`shrink-0 w-3 h-3 rounded-full transition-colors ${dotColor}`} />

          {/* Note name */}
          <div className="min-w-[3rem] text-center">
            <span className="text-lg font-bold text-foreground tabular-nums">
              {pitch ? pitch.note : '--'}
            </span>
            {pitch && (
              <span className="text-xs text-muted ml-0.5">{pitch.octave}</span>
            )}
          </div>

          {/* Cents offset */}
          <div className="text-xs text-muted tabular-nums min-w-[4rem]">
            {pitch
              ? `${pitch.cents > 0 ? '+' : ''}${pitch.cents}c`
              : '--'}
          </div>

          {/* Accuracy */}
          {accuracy !== null && (
            <div className="ml-auto text-xs text-muted tabular-nums">
              {accuracy}% in tune
            </div>
          )}
        </>
      ) : (
        <span className="text-sm text-muted">
          {error || 'Pitch monitor off'}
        </span>
      )}
    </div>
  );
}
