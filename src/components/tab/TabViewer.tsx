'use client';

import React, { useRef, useEffect } from 'react';
import type { Tab, TabNote } from '@/types/song';

interface TabViewerProps {
  tab: Tab;
  currentMeasure?: number;
  compact?: boolean;
}

const TECHNIQUE_LABELS: Record<string, string> = {
  'hammer-on': 'h',
  'pull-off': 'p',
  'slide': 's',
  'bend': 'b',
  'choke': 'ch',
};

const COLORS = {
  string: '#78716c',
  text: '#2d1810',
  fretNumber: '#2d1810',
  label: '#a8a29e',
  barLine: '#2d1810',
  background: '#ffffff',
  border: '#d6cfc7',
  highlight: 'rgba(180, 83, 9, 0.08)',
  highlightBorder: 'rgba(180, 83, 9, 0.3)',
  technique: '#b45309',
};

export default function TabViewer({
  tab,
  currentMeasure,
  compact = false,
}: TabViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const numStrings = 5;
  const stringSpacing = compact ? 14 : 20;
  const measureWidth = compact ? 180 : 260;
  const labelWidth = compact ? 28 : 40;
  const paddingTop = compact ? 16 : 24;
  const paddingBottom = compact ? 12 : 18;
  const paddingRight = compact ? 8 : 12;
  const fretFontSize = compact ? 10 : 13;
  const labelFontSize = compact ? 9 : 11;
  const techniqueFontSize = compact ? 7 : 9;
  const titleFontSize = compact ? 11 : 14;
  const titleHeight = compact ? 20 : 28;

  const gridHeight = stringSpacing * (numStrings - 1);
  const svgHeight = paddingTop + titleHeight + gridHeight + paddingBottom;
  const svgWidth =
    labelWidth + tab.measures.length * measureWidth + paddingRight;

  // Y position for a string (string 1 at top, string 5 at bottom — standard banjo tab)
  const stringY = (s: number) =>
    paddingTop + titleHeight + (s - 1) * stringSpacing;

  // X position for a note within its measure
  const noteX = (measureIndex: number, offset: number, measure: { timeSignature: [number, number] }) => {
    const measureStart = labelWidth + measureIndex * measureWidth;
    const innerPadding = compact ? 10 : 16;
    const usable = measureWidth - innerPadding * 2;
    const beats = measure.timeSignature[0];
    // offset is in beats; map to horizontal position within the measure
    const fraction = beats > 0 ? offset / beats : 0;
    return measureStart + innerPadding + fraction * usable;
  };

  // Auto-scroll to current measure
  useEffect(() => {
    if (currentMeasure != null && scrollRef.current) {
      const target = labelWidth + currentMeasure * measureWidth;
      const container = scrollRef.current;
      const viewWidth = container.clientWidth;
      const scrollTarget = target - viewWidth / 3;
      container.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
    }
  }, [currentMeasure, labelWidth, measureWidth]);

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto rounded-lg"
      style={{
        border: '1px solid var(--border, #d6cfc7)',
        background: 'var(--surface, #ffffff)',
      }}
    >
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        className="select-none"
        style={{ display: 'block', minWidth: svgWidth }}
      >
        {/* Title & meta */}
        <text
          x={labelWidth}
          y={paddingTop + titleFontSize}
          fill={COLORS.text}
          fontSize={titleFontSize}
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          {tab.title}
          {tab.capo ? ` (Capo ${tab.capo})` : ''}
        </text>
        <text
          x={labelWidth + (compact ? 0 : 4)}
          y={paddingTop + titleFontSize}
          fill={COLORS.label}
          fontSize={labelFontSize}
          fontFamily="sans-serif"
          textAnchor="start"
          dx={
            (tab.title.length + (tab.capo ? ` (Capo ${tab.capo})`.length : 0)) *
              (titleFontSize * 0.6) +
            8
          }
        >
          {tab.tempo} BPM
        </text>

        {/* Current measure highlight */}
        {currentMeasure != null &&
          currentMeasure >= 0 &&
          currentMeasure < tab.measures.length && (
            <rect
              x={labelWidth + currentMeasure * measureWidth}
              y={paddingTop + titleHeight - 4}
              width={measureWidth}
              height={gridHeight + 8}
              fill={COLORS.highlight}
              stroke={COLORS.highlightBorder}
              strokeWidth={1.5}
              rx={4}
            />
          )}

        {/* String labels on the left */}
        {tab.tuning.map((label, i) => {
          const s = i + 1; // string number 1-5
          return (
            <text
              key={`label-${s}`}
              x={labelWidth - 6}
              y={stringY(s) + labelFontSize * 0.35}
              textAnchor="end"
              fill={COLORS.label}
              fontSize={labelFontSize}
              fontFamily="monospace"
              fontWeight="600"
            >
              {label}
            </text>
          );
        })}

        {/* Horizontal string lines */}
        {Array.from({ length: numStrings }, (_, i) => {
          const s = i + 1;
          return (
            <line
              key={`string-${s}`}
              x1={labelWidth}
              y1={stringY(s)}
              x2={svgWidth - paddingRight}
              y2={stringY(s)}
              stroke={COLORS.string}
              strokeWidth={0.8}
            />
          );
        })}

        {/* Opening bar line */}
        <line
          x1={labelWidth}
          y1={stringY(1)}
          x2={labelWidth}
          y2={stringY(numStrings)}
          stroke={COLORS.barLine}
          strokeWidth={1.5}
        />

        {/* Measure bar lines */}
        {tab.measures.map((_, mIdx) => {
          const x = labelWidth + (mIdx + 1) * measureWidth;
          return (
            <line
              key={`bar-${mIdx}`}
              x1={x}
              y1={stringY(1)}
              x2={x}
              y2={stringY(numStrings)}
              stroke={COLORS.barLine}
              strokeWidth={mIdx === tab.measures.length - 1 ? 2 : 1}
            />
          );
        })}

        {/* Final double bar line */}
        {tab.measures.length > 0 && (
          <line
            x1={labelWidth + tab.measures.length * measureWidth - 4}
            y1={stringY(1)}
            x2={labelWidth + tab.measures.length * measureWidth - 4}
            y2={stringY(numStrings)}
            stroke={COLORS.barLine}
            strokeWidth={0.8}
          />
        )}

        {/* Measure numbers */}
        {tab.measures.map((_, mIdx) => (
          <text
            key={`mnum-${mIdx}`}
            x={labelWidth + mIdx * measureWidth + 4}
            y={stringY(1) - 5}
            fill={COLORS.label}
            fontSize={compact ? 7 : 9}
            fontFamily="sans-serif"
          >
            {mIdx + 1}
          </text>
        ))}

        {/* Notes and technique annotations */}
        {tab.measures.map((measure, mIdx) =>
          measure.notes.map((note: TabNote, nIdx: number) => {
            const x = noteX(mIdx, note.offset, measure);
            const y = stringY(note.string);
            const fretText = String(note.fret);
            // Background rectangle to blank out the string line behind the number
            const bgWidth =
              fretText.length * (fretFontSize * 0.62) + (compact ? 3 : 4);
            const bgHeight = fretFontSize + (compact ? 2 : 4);

            return (
              <g key={`note-${mIdx}-${nIdx}`}>
                {/* White background behind fret number */}
                <rect
                  x={x - bgWidth / 2}
                  y={y - bgHeight / 2}
                  width={bgWidth}
                  height={bgHeight}
                  fill={COLORS.background}
                  rx={1}
                />
                {/* Fret number */}
                <text
                  x={x}
                  y={y + fretFontSize * 0.35}
                  textAnchor="middle"
                  fill={COLORS.fretNumber}
                  fontSize={fretFontSize}
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {note.fret}
                </text>
                {/* Technique annotation */}
                {note.technique && (
                  <text
                    x={x}
                    y={y - bgHeight / 2 - 2}
                    textAnchor="middle"
                    fill={COLORS.technique}
                    fontSize={techniqueFontSize}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                    fontStyle="italic"
                  >
                    {TECHNIQUE_LABELS[note.technique] ?? ''}
                  </text>
                )}
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}
