'use client';

import React from 'react';
import Link from 'next/link';
import type { Recommendation } from '@/lib/recommendations/engine';
import TypeIcon from '@/components/ui/TypeIcon';

// Palette-driven badges — each pair reads warm in light mode and stays legible
// in dark mode. Success / danger pairs keep their semantic hue.
const TYPE_BADGE_COLORS: Record<Recommendation['type'], string> = {
  lesson:           'bg-primary/15 text-foreground',
  song:             'bg-accent/25 text-foreground',
  'chord-practice': 'bg-primary-light/20 text-foreground',
  technique:        'bg-success/20 text-success',
  review:           'bg-danger/15 text-danger',
};

const TYPE_LABELS: Record<Recommendation['type'], string> = {
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
              <span className="text-primary group-hover:text-primary-dark transition-colors">
                <TypeIcon name={rec.icon} size={24} />
              </span>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE_COLORS[rec.type]}`}
              >
                {TYPE_LABELS[rec.type]}
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
