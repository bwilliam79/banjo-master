'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createAnalyser, cleanupAudio, getAudioContext } from '@/lib/audio/audio-context';
import { detectPitch, type PitchResult } from '@/lib/audio/pitch-detector';
import { startCamera, stopCamera, type FacingMode } from '@/lib/camera/camera-manager';

interface ExercisePreflightProps {
  useCamera: boolean;
  onReady: (
    analyser: AnalyserNode,
    cameraStream: MediaStream | null,
    videoElement: HTMLVideoElement | null,
  ) => void;
  onBack: () => void;
}

export default function ExercisePreflight({
  useCamera,
  onReady,
  onBack,
}: ExercisePreflightProps) {
  const [micStatus, setMicStatus] = useState<'pending' | 'active' | 'error'>('pending');
  const [camStatus, setCamStatus] = useState<'pending' | 'active' | 'error' | 'off'>(!useCamera ? 'off' : 'pending');
  const [micError, setMicError] = useState<string | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [pitch, setPitch] = useState<PitchResult | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');

  const analyserRef = useRef<AnalyserNode | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const cameraStartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start mic on mount.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        getAudioContext();
        const analyser = await createAnalyser();
        if (cancelled) return;
        analyserRef.current = analyser;
        setMicStatus('active');

        // Start a pitch detection loop for visual feedback.
        const tick = () => {
          if (cancelled || !analyserRef.current) return;
          const result = detectPitch(analyserRef.current);
          setPitch(result);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        if (!cancelled) {
          setMicStatus('error');
          setMicError(err instanceof Error ? err.message : 'Microphone error');
        }
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Start camera on mount if enabled.
  useEffect(() => {
    if (!useCamera) return;
    let cancelled = false;

    // Wait for video element to mount.
    cameraStartTimeoutRef.current = setTimeout(async () => {
      if (!videoRef.current) return;
      try {
        const stream = await startCamera(videoRef.current, facingMode);
        if (cancelled) {
          stopCamera(stream);
          return;
        }
        streamRef.current = stream;
        setCamStatus('active');
      } catch (err) {
        if (!cancelled) {
          setCamStatus('error');
          setCamError(err instanceof Error ? err.message : 'Camera error');
        }
      }
    }, 100);

    return () => {
      cancelled = true;
      if (cameraStartTimeoutRef.current) {
        clearTimeout(cameraStartTimeoutRef.current);
        cameraStartTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCamera, facingMode]);

  const handleFlip = useCallback(async () => {
    // Stop current stream.
    if (streamRef.current) {
      stopCamera(streamRef.current);
      streamRef.current = null;
    }
    setCamStatus('pending');
    const next: FacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    // The useEffect will restart with the new facing mode.
  }, [facingMode]);

  const handleConfirm = useCallback(() => {
    // Stop the pitch preview loop but keep mic and camera running.
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (analyserRef.current) {
      onReady(analyserRef.current, streamRef.current, videoRef.current);
    }
  }, [onReady]);

  const handleBack = useCallback(() => {
    // Clean everything up.
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (cameraStartTimeoutRef.current) {
      clearTimeout(cameraStartTimeoutRef.current);
      cameraStartTimeoutRef.current = null;
    }
    if (streamRef.current) {
      stopCamera(streamRef.current);
      streamRef.current = null;
    }
    cleanupAudio();
    analyserRef.current = null;
    onBack();
  }, [onBack]);

  const micReady = micStatus === 'active';
  const camReady = camStatus === 'active' || camStatus === 'off';
  const allReady = micReady && camReady;

  const absCents = pitch ? Math.abs(pitch.cents) : 0;
  const dotColor = !pitch
    ? 'bg-muted'
    : absCents <= 5
      ? 'bg-success'
      : absCents <= 15
        ? 'bg-warning'
        : 'bg-danger';

  return (
    <div className="bg-surface rounded-xl border border-border p-6 space-y-5">
      <div>
        <h3 className="text-base font-semibold text-foreground">Check Your Setup</h3>
        <p className="text-xs text-muted mt-1">
          Make sure your mic {useCamera ? 'and camera are' : 'is'} working before starting.
        </p>
      </div>

      {/* Microphone status */}
      <div className="bg-surface-hover rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusDot status={micStatus === 'active' ? 'ok' : micStatus === 'error' ? 'error' : 'pending'} />
            <span className="text-sm font-medium text-foreground">Microphone</span>
          </div>
          <span className="text-xs text-muted">
            {micStatus === 'pending' && 'Requesting...'}
            {micStatus === 'active' && 'Connected'}
            {micStatus === 'error' && 'Failed'}
          </span>
        </div>

        {micStatus === 'active' && (
          <div className="flex items-center gap-3">
            <div className={`shrink-0 w-3 h-3 rounded-full transition-colors ${dotColor}`} />
            <span className="text-lg font-bold text-foreground tabular-nums min-w-[3rem]">
              {pitch ? `${pitch.note}${pitch.octave}` : '--'}
            </span>
            <span className="text-xs text-muted">
              {pitch ? 'Play a note to confirm detection' : 'Waiting for sound...'}
            </span>
          </div>
        )}

        {micError && (
          <p className="text-xs text-danger">{micError}</p>
        )}
      </div>

      {/* Camera status */}
      {useCamera && (
        <div className="bg-surface-hover rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusDot status={camStatus === 'active' ? 'ok' : camStatus === 'error' ? 'error' : 'pending'} />
              <span className="text-sm font-medium text-foreground">Camera</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">
                {camStatus === 'pending' && 'Starting...'}
                {camStatus === 'active' && (facingMode === 'user' ? 'Front' : 'Rear')}
                {camStatus === 'error' && 'Failed'}
              </span>
              {camStatus === 'active' && (
                <button
                  type="button"
                  onClick={handleFlip}
                  className="p-1.5 rounded-lg bg-surface text-muted hover:text-foreground border border-border transition-colors"
                  aria-label="Flip camera"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
                    <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
                    <polyline points="16 3 19 6 16 9" />
                    <polyline points="8 15 5 18 8 21" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : undefined }}
            />
            {camStatus === 'pending' && (
              <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                Starting camera...
              </div>
            )}
          </div>

          {camError && (
            <p className="text-xs text-danger">{camError}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!allReady}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
            allReady
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-border text-muted cursor-not-allowed'
          }`}
        >
          {allReady ? 'Ready — Start Countdown' : 'Waiting for permissions...'}
        </button>
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-3 rounded-xl bg-surface-hover text-muted text-sm font-medium hover:text-foreground transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: 'ok' | 'error' | 'pending' }) {
  const color =
    status === 'ok'
      ? 'bg-success'
      : status === 'error'
        ? 'bg-danger'
        : 'bg-warning animate-pulse';
  return <div className={`w-2.5 h-2.5 rounded-full ${color}`} />;
}
