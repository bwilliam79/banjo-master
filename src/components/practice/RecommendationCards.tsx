'use client';

import React from 'react';
import Link from 'next/link';
import type { Recommendation } from '@/lib/recommendations/engine';

const TYPE_BADGE_COLORS: Record<string, string> = {
  lesson: 'bg-blue-100 text-blue-800',
  song: 'bg-purple-100 text-purple-800',
  'chord-practice': 'bg-amber-100 text-amber-800',
  technique: 'bg-green-100 text-green-800',
  review: 'bg-rose-100 text-rose-800',
};

const TYPE_LABELS: Record<string, string> = {
  lesson: 'Lesson',
  song: 'Song',
  'chord-practice': 'Chords',
  technique: 'Technique',
  review: 'Review',
};

interface RecommendationCardsProps {
  recommendations: Recommendation[];
}

export default function RecommendationCards({ recommendations }: RecommendationCardsProps) {
  const visible = recommendations.slice(0, 5);

  if (visible.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-foreground mb-3">Recommended for You</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {visible.map((rec) => (
          <Link
            key={rec.id}
            href={rec.link}
            className="flex-shrink-0 w-56 bg-surface rounded-xl border border-border p-4 hover:bg-surface-hover hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{rec.icon}</span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE_COLORS[rec.type] ?? 'bg-gray-100 text-gray-800'}`}
              >
                {TYPE_LABELS[rec.type] ?? rec.type}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {rec.title}
            </h3>
            <p className="text-xs text-muted line-clamp-2 mb-3">{rec.description}</p>
            <span className="inline-block text-xs font-semibold text-primary group-hover:underline">
              Start &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
