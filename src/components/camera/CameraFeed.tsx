'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  startCamera,
  stopCamera,
  getCameraCapabilities,
  type FacingMode,
} from '@/lib/camera/camera-manager';

interface CameraFeedProps {
  /** Called when the stream starts or stops */
  onStreamChange?: (stream: MediaStream | null) => void;
  /** Optional overlay content rendered on top of the video */
  children?: React.ReactNode;
}

export default function CameraFeed({ onStreamChange, children }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<FacingMode>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  // Check for multiple cameras on mount
  useEffect(() => {
    getCameraCapabilities().then((cameras) => {
      setHasMultipleCameras(cameras.length > 1);
    });
  }, []);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopCamera(streamRef.current);
        streamRef.current = null;
      }
    };
  }, []);

  const handleStart = useCallback(async () => {
    if (!videoRef.current) return;
    setError(null);
    try {
      const stream = await startCamera(videoRef.current, facingMode);
      streamRef.current = stream;
      setIsActive(true);
      onStreamChange?.(stream);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start camera.');
    }
  }, [facingMode, onStreamChange]);

  const handleStop = useCallback(() => {
    if (streamRef.current) {
      stopCamera(streamRef.current);
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    onStreamChange?.(null);
  }, [onStreamChange]);

  const handleFlip = useCallback(async () => {
    const next: FacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    if (isActive) {
      // Restart with new facing mode
      if (streamRef.current) {
        stopCamera(streamRef.current);
        streamRef.current = null;
      }
      if (!videoRef.current) return;
      try {
        const stream = await startCamera(videoRef.current, next);
        streamRef.current = stream;
        onStreamChange?.(stream);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to switch camera.');
      }
    }
  }, [facingMode, isActive, onStreamChange]);

  const isMirrored = facingMode === 'user';

  return (
    <div className="w-full">
      {/* Video container */}
      <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: isMirrored ? 'scaleX(-1)' : undefined }}
          playsInline
          muted
          autoPlay
        />

        {/* Positioning grid overlay */}
        {isActive && showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical thirds */}
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
            {/* Horizontal thirds */}
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
          </div>
        )}

        {/* Children overlay (e.g. HandPositionGuide) */}
        {isActive && children && (
          <div className="absolute inset-0 pointer-events-none">{children}</div>
        )}

        {/* Placeholder when camera is off */}
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 gap-2">
            <svg
              width={48}
              height={48}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-sm">Camera off</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 mt-4">
        {/* Start / Stop */}
        <button
          onClick={isActive ? handleStop : handleStart}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            isActive
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
          style={!isActive ? { backgroundColor: '#b45309' } : undefined}
        >
          {isActive ? 'Stop Camera' : 'Start Camera'}
        </button>

        {/* Flip camera */}
        {hasMultipleCameras && (
          <button
            onClick={handleFlip}
            className="rounded-lg border border-border bg-surface px-3 py-2.5 text-foreground hover:bg-gray-50 transition"
            aria-label="Flip camera"
            title={`Switch to ${facingMode === 'user' ? 'rear' : 'front'} camera`}
          >
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
              <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
              <polyline points="16 3 19 6 16 9" className="translate-x-[-2px]" />
              <polyline points="8 15 5 18 8 21" className="translate-x-[2px]" />
            </svg>
          </button>
        )}

        {/* Toggle grid */}
        <button
          onClick={() => setShowGrid((v) => !v)}
          className={`rounded-lg border px-3 py-2.5 transition text-sm ${
            showGrid
              ? 'border-primary/40 bg-primary/5 text-primary'
              : 'border-border bg-surface text-foreground hover:bg-gray-50'
          }`}
          style={showGrid ? { color: '#b45309', borderColor: 'rgba(180,83,9,0.4)' } : undefined}
          aria-label="Toggle grid overlay"
          title="Toggle positioning grid"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
