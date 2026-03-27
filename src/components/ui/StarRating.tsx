'use client';

import React from 'react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md';
}

const SIZES = {
  sm: 14,
  md: 20,
};

function StarIcon({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#b45309' : 'none'}
      stroke={filled ? '#b45309' : '#a8a29e'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function StarRating({ rating, max = 5, size = 'sm' }: StarRatingProps) {
  const px = SIZES[size];
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <StarIcon key={i} filled={i < rating} size={px} />
      ))}
    </span>
  );
}
