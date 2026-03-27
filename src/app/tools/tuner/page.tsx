'use client';

import React from 'react';
import Link from 'next/link';
import Tuner from '@/components/tuner/Tuner';
import { BANJO_STRINGS } from '@/lib/audio/pitch-detector';

export default function TunerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
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
          <div>
            <h1 className="text-xl font-bold text-foreground">Chromatic Tuner</h1>
            <p className="text-muted text-xs">Standard Open G Tuning (gDGBD)</p>
          </div>
        </div>

        <div className="mt-8">
          <Tuner />
        </div>

        {/* Reference pitches */}
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Reference Pitches
          </h2>
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="px-4 py-2 font-medium">String</th>
                  <th className="px-4 py-2 font-medium">Note</th>
                  <th className="px-4 py-2 font-medium text-right">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {BANJO_STRINGS.map((s) => (
                  <tr key={s.string} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 text-foreground">
                      {s.string === 5 ? '5th (short)' : `${s.string}${s.string === 1 ? 'st' : s.string === 2 ? 'nd' : s.string === 3 ? 'rd' : 'th'}`}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-foreground">
                      {s.name}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted tabular-nums">
                      {s.frequency.toFixed(2)} Hz
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
