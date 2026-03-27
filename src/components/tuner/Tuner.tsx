'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createAnalyser, cleanupAudio, getAudioContext } from '@/lib/audio/audio-context';
import { detectPitch, closestBanjoString, BANJO_STRINGS, type PitchResult } from '@/lib/audio/pitch-detector';

type TunerState = 'idle' | 'starting' | 'active' | 'error';

export default function Tuner() {
  const [state, setState] = useState<TunerState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pitch, setPitch] = useState<PitchResult | null>(null);
  const [selectedString, setSelectedString] = useState<number | null>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Smoothed cents for display (simple exponential moving average)
  const smoothedCentsRef = useRef(0);

  const tick = useCallback(() => {
    if (!analyserRef.current) return;

    const result = detectPitch(analyserRef.current);
    if (result) {
      // Smooth cents to avoid jitter
      smoothedCentsRef.current =
        smoothedCentsRef.current * 0.6 + result.cents * 0.4;
      setPitch({
        ...result,
        cents: Math.round(smoothedCentsRef.current),
      });
    } else {
      setPitch(null);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startTuner = useCallback(async () => {
    setState('starting');
    setError(null);
    try {
      // Resume context (user gesture requirement)
      getAudioContext();
      const analyser = await createAnalyser();
      analyserRef.current = analyser;
      setState('active');
      smoothedCentsRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to start tuner.');
    }
  }, [tick]);

  const stopTuner = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    cleanupAudio();
    analyserRef.current = null;
    setPitch(null);
    setState('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      cleanupAudio();
    };
  }, []);

  // Determine closest banjo string to detected pitch
  const matchedString = pitch ? closestBanjoString(pitch.frequency) : null;

  // Accuracy colour
  const getAccuracyColor = (cents: number) => {
    const abs = Math.abs(cents);
    if (abs <= 5) return 'text-success';
    if (abs <= 15) return 'text-warning';
    return 'text-danger';
  };

  const getAccuracyBg = (cents: number) => {
    const abs = Math.abs(cents);
    if (abs <= 5) return 'bg-success';
    if (abs <= 15) return 'bg-warning';
    return 'bg-danger';
  };

  const getAccuracyLabel = (cents: number) => {
    const abs = Math.abs(cents);
    if (abs <= 5) return 'In Tune';
    if (cents < 0) return 'Flat';
    return 'Sharp';
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* ---- Idle / Error state ------------------------------------------ */}
      {state === 'idle' && (
        <button
          type="button"
          onClick={startTuner}
          className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 active:scale-95 transition"
          aria-label="Start Tuner"
        >
          {/* Microphone icon */}
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x={9} y={1} width={6} height={12} rx={3} />
            <path d="M19 10v2a7 7 0 01-14 0v-2" />
            <line x1={12} y1={19} x2={12} y2={23} />
            <line x1={8} y1={23} x2={16} y2={23} />
          </svg>
        </button>
      )}

      {state === 'idle' && (
        <p className="text-muted text-sm">Tap to start the tuner</p>
      )}

      {state === 'starting' && (
        <p className="text-muted text-sm animate-pulse">Requesting microphone access...</p>
      )}

      {state === 'error' && (
        <div className="text-center space-y-3">
          <p className="text-danger text-sm">{error}</p>
          <button
            type="button"
            onClick={startTuner}
            className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ---- Active tuner ------------------------------------------------ */}
      {state === 'active' && (
        <>
          {/* Note display */}
          <div className="text-center">
            <div className={`text-7xl font-bold tabular-nums transition-colors ${pitch ? getAccuracyColor(pitch.cents) : 'text-muted'}`}>
              {pitch ? pitch.note : '--'}
            </div>
            {pitch && (
              <div className="text-lg text-muted mt-1">
                {pitch.note}{pitch.octave}
              </div>
            )}
          </div>

          {/* Cents gauge */}
          <div className="w-full px-2">
            {/* Scale labels */}
            <div className="flex justify-between text-xs text-muted mb-1 px-1">
              <span>-50</span>
              <span>0</span>
              <span>+50</span>
            </div>

            {/* Gauge track */}
            <div className="relative w-full h-6 bg-surface-hover rounded-full border border-border overflow-hidden">
              {/* Center line */}
              <div className="absolute left-1/2 top-0 w-px h-full bg-border -translate-x-px z-10" />

              {/* Indicator needle */}
              {pitch && (
                <div
                  className={`absolute top-1 bottom-1 w-3 rounded-full transition-all duration-100 ${getAccuracyBg(pitch.cents)}`}
                  style={{
                    left: `calc(${50 + (pitch.cents / 50) * 50}% - 6px)`,
                  }}
                />
              )}

              {/* Tick marks */}
              {[-40, -30, -20, -10, 10, 20, 30, 40].map((c) => (
                <div
                  key={c}
                  className="absolute top-2 w-px h-2 bg-border"
                  style={{ left: `${50 + (c / 50) * 50}%` }}
                />
              ))}
            </div>

            {/* Accuracy label */}
            <div className="text-center mt-2">
              {pitch ? (
                <span className={`text-sm font-semibold ${getAccuracyColor(pitch.cents)}`}>
                  {getAccuracyLabel(pitch.cents)}{' '}
                  <span className="font-normal text-muted">
                    ({pitch.cents > 0 ? '+' : ''}{pitch.cents} cents)
                  </span>
                </span>
              ) : (
                <span className="text-sm text-muted">Play a note...</span>
              )}
            </div>
          </div>

          {/* Frequency */}
          <div className="text-sm text-muted tabular-nums">
            {pitch ? `${pitch.frequency.toFixed(1)} Hz` : '-- Hz'}
          </div>

          {/* String selector */}
          <div className="w-full">
            <div className="text-xs font-semibold text-muted uppercase tracking-wide text-center mb-2">
              String
            </div>
            <div className="flex items-center justify-center gap-2">
              {BANJO_STRINGS.map((s) => {
                const isMatched = matchedString?.string === s.string && pitch !== null && selectedString === null;
                const isSelected = selectedString === s.string;
                return (
                  <button
                    key={s.string}
                    type="button"
                    onClick={() =>
                      setSelectedString(selectedString === s.string ? null : s.string)
                    }
                    className={`flex flex-col items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isSelected
                        ? 'bg-primary text-white'
                        : isMatched
                          ? 'bg-primary/10 text-primary border border-primary/30'
                          : 'bg-surface-hover text-foreground hover:bg-border'
                    }`}
                  >
                    <span className="text-xs opacity-70">{s.string === 5 ? '5th' : `${s.string}${s.string === 1 ? 'st' : s.string === 2 ? 'nd' : s.string === 3 ? 'rd' : 'th'}`}</span>
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stop button */}
          <button
            type="button"
            onClick={stopTuner}
            className="w-16 h-16 rounded-full bg-danger/10 text-danger flex items-center justify-center hover:bg-danger/20 active:scale-95 transition"
            aria-label="Stop Tuner"
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
              <rect x={6} y={6} width={12} height={12} rx={2} />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
