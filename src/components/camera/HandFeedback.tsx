'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CameraFeed from './CameraFeed';
import HandPositionGuide from './HandPositionGuide';

interface HandFeedbackProps {
  /** Current lesson context for showing relevant tips */
  currentLesson?: string;
}

interface TipSet {
  category: string;
  tips: string[];
}

const GENERAL_TIPS: TipSet = {
  category: 'General',
  tips: [
    'Keep your thumb behind the neck for better reach.',
    'Curve your fretting fingers so the tips press the strings.',
    'Relax your picking hand — tension causes fatigue.',
    'Keep your wrist straight to avoid strain.',
    'Sit up straight; let the banjo rest on your lap naturally.',
    'Keep your elbow close to your body for stability.',
  ],
};

const LESSON_TIPS: Record<string, TipSet> = {
  rolls: {
    category: 'Rolls',
    tips: [
      'Use thumb, index, and middle fingers for three-finger rolls.',
      'Keep your picking hand anchored on the head with your ring finger.',
      'Start slowly and build speed gradually.',
      'Relax your picking hand — tension causes fatigue.',
      'Keep your wrist straight to avoid strain.',
    ],
  },
  chords: {
    category: 'Chords',
    tips: [
      'Press strings close to the fret wire for clean sound.',
      'Keep your thumb behind the neck for better reach.',
      'Curve your fretting fingers so the tips press the strings.',
      'Check each string individually to make sure none are muted.',
      'Keep your wrist straight to avoid strain.',
    ],
  },
  'hammer-ons': {
    category: 'Hammer-ons & Pull-offs',
    tips: [
      'Hammer firmly with your fingertip, not the pad.',
      'Keep other fingers close to the strings for quick transitions.',
      'Curve your fretting fingers so the tips press the strings.',
      'Relax your picking hand — tension causes fatigue.',
    ],
  },
  slides: {
    category: 'Slides',
    tips: [
      'Maintain consistent pressure while sliding.',
      'Keep your thumb behind the neck for support during slides.',
      'Look ahead to your target fret before you slide.',
      'Relax your picking hand — tension causes fatigue.',
    ],
  },
};

export default function HandFeedback({ currentLesson }: HandFeedbackProps) {
  const [tipsOpen, setTipsOpen] = useState(true);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [leftHandDetected] = useState(false);
  const [rightHandDetected] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | undefined>();

  // Pick tips based on current lesson
  const tipSet =
    currentLesson && LESSON_TIPS[currentLesson]
      ? LESSON_TIPS[currentLesson]
      : GENERAL_TIPS;

  // Cycle through tips every 6 seconds
  useEffect(() => {
    setActiveTipIndex(0);
    const interval = setInterval(() => {
      setActiveTipIndex((prev) => (prev + 1) % tipSet.tips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [tipSet]);

  const handleStreamChange = useCallback((stream: MediaStream | null) => {
    if (stream) {
      setFeedbackMessage('Position your banjo so both hands are visible.');
    } else {
      setFeedbackMessage(undefined);
    }
  }, []);

  const currentTip = tipSet.tips[activeTipIndex];

  return (
    <div className="w-full space-y-4">
      {/* Camera with hand position overlay */}
      <CameraFeed onStreamChange={handleStreamChange}>
        <HandPositionGuide
          leftHandDetected={leftHandDetected}
          rightHandDetected={rightHandDetected}
          feedbackMessage={feedbackMessage}
        />
      </CameraFeed>

      {/* Collapsible tips panel */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <button
          onClick={() => setTipsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b45309"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span className="text-sm font-semibold text-foreground">
              Hand Position Tips
              {tipSet.category !== 'General' && (
                <span className="ml-2 text-xs font-normal text-muted">
                  ({tipSet.category})
                </span>
              )}
            </span>
          </div>
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-muted transition-transform ${tipsOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {tipsOpen && (
          <div className="px-4 pb-4 space-y-3">
            {/* Active tip highlight */}
            <div
              className="flex items-start gap-3 rounded-lg px-3 py-3"
              style={{ backgroundColor: 'rgba(180,83,9,0.06)' }}
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
                style={{ backgroundColor: '#b45309' }}
              >
                !
              </span>
              <p className="text-sm text-foreground leading-relaxed">{currentTip}</p>
            </div>

            {/* All tips list */}
            <ul className="space-y-2 pl-1">
              {tipSet.tips.map((tip, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-2 text-sm ${
                    i === activeTipIndex ? 'text-foreground font-medium' : 'text-muted'
                  }`}
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        i === activeTipIndex ? '#b45309' : '#a8a29e',
                    }}
                  />
                  {tip}
                </li>
              ))}
            </ul>

            {/* Tip progress dots */}
            <div className="flex justify-center gap-1.5 pt-1">
              {tipSet.tips.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTipIndex(i)}
                  className="h-2 w-2 rounded-full transition-all"
                  style={{
                    backgroundColor:
                      i === activeTipIndex ? '#b45309' : '#d6cfc7',
                    transform: i === activeTipIndex ? 'scale(1.3)' : 'scale(1)',
                  }}
                  aria-label={`Go to tip ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
