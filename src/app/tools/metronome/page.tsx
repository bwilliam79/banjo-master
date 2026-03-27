'use client';

import React from 'react';
import Link from 'next/link';
import Metronome from '@/components/metronome/Metronome';

export default function MetronomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-hover text-foreground hover:bg-border transition"
            aria-label="Back"
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
          <h1 className="text-xl font-bold text-foreground">Metronome</h1>
        </div>

        <Metronome />
      </div>
    </div>
  );
}
