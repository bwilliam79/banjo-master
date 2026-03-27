'use client';

import React, { useEffect, useState } from 'react';

interface FeedbackOverlayProps {
  message: string;
}

export default function FeedbackOverlay({ message }: FeedbackOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [displayMsg, setDisplayMsg] = useState('');

  useEffect(() => {
    if (message) {
      setDisplayMsg(message);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const isPositive =
    displayMsg.includes('PERFECT') ||
    displayMsg.includes('GOOD') ||
    displayMsg.includes('correct') ||
    displayMsg.includes('looks good');
  const isNegative =
    displayMsg.includes('MISS') ||
    displayMsg.includes('wrong') ||
    displayMsg.includes('Move') ||
    displayMsg.includes('Straighten');

  const color = isPositive
    ? 'text-success bg-success/10 border-success/20'
    : isNegative
      ? 'text-danger bg-danger/10 border-danger/20'
      : 'text-warning bg-warning/10 border-warning/20';

  if (!displayMsg) return null;

  return (
    <div
      className={`text-center py-2 px-4 rounded-lg border text-sm font-medium transition-opacity duration-300 ${color} ${
        visible ? 'opacity-100' : 'opacity-40'
      }`}
    >
      {displayMsg}
    </div>
  );
}
