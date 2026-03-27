'use client';

import React from 'react';
import Link from 'next/link';
import HandFeedback from '@/components/camera/HandFeedback';

export default function CameraPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/tools"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-hover text-foreground hover:bg-border transition"
            aria-label="Back to Tools"
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Hand Position Check</h1>
            <p className="text-muted text-sm">
              Use your camera to check your hand placement
            </p>
          </div>
        </div>

        {/* Camera feedback */}
        <div className="mt-6">
          <HandFeedback />
        </div>

        {/* Instructions */}
        <div className="mt-8 rounded-xl border border-border bg-surface p-5 space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            How to Position Your Camera
          </h2>

          <ol className="space-y-3 text-sm text-foreground list-decimal list-inside">
            <li>
              <strong>Place your device in front of you</strong> at roughly arm&apos;s
              length, angled so the camera can see your lap and hands.
            </li>
            <li>
              <strong>On mobile,</strong> use the rear camera and prop the phone up on a
              stand or lean it against something stable. The rear camera gives a
              non-mirrored view of your hands.
            </li>
            <li>
              <strong>On desktop/laptop,</strong> the built-in webcam works well. Sit
              facing the camera with the banjo in your normal playing position.
            </li>
            <li>
              <strong>Make sure there is good lighting</strong> so your hands and the
              banjo neck are clearly visible. Avoid backlighting (don&apos;t sit with a
              bright window behind you).
            </li>
            <li>
              <strong>Align your hands</strong> with the guide zones shown on the camera
              feed. The left zone is for your fretting hand, the right zone is for your
              picking hand.
            </li>
          </ol>
        </div>

        {/* Hand position tips */}
        <div className="mt-6 rounded-xl border border-border bg-surface p-5 space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            Proper Hand Position
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fretting hand */}
            <div className="space-y-2">
              <h3
                className="text-sm font-semibold"
                style={{ color: '#b45309' }}
              >
                Fretting Hand (Left)
              </h3>
              <ul className="space-y-1.5 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600 text-xs">&#10003;</span>
                  Thumb placed behind the center of the neck, pointing upward
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600 text-xs">&#10003;</span>
                  Fingers curved so only the fingertips press the strings
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600 text-xs">&#10003;</span>
                  Press close to the fret wire (toward the body) for clean tone
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-600 text-xs">&#10007;</span>
                  Avoid wrapping the thumb over the top of the neck
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-600 text-xs">&#10007;</span>
                  Avoid flattening fingers across multiple strings (unless barring)
                </li>
              </ul>
            </div>

            {/* Picking hand */}
            <div className="space-y-2">
              <h3
                className="text-sm font-semibold"
                style={{ color: '#b45309' }}
              >
                Picking Hand (Right)
              </h3>
              <ul className="space-y-1.5 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600 text-xs">&#10003;</span>
                  Anchor your ring finger (or pinky) on the banjo head
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600 text-xs">&#10003;</span>
                  Keep your wrist relatively straight, not bent sharply
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-green-600 text-xs">&#10003;</span>
                  Thumb picks down, index and middle pick up
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-600 text-xs">&#10007;</span>
                  Avoid excessive tension — your hand should feel relaxed
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-600 text-xs">&#10007;</span>
                  Avoid picking too far from the bridge (tone gets muddy)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
