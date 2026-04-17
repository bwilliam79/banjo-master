'use client';

import React from 'react';

interface ChordDiagramProps {
  name: string;
  strings: [number, number, number, number, number]; // frets for strings 5,4,3,2,1
  fingers: [number, number, number, number, number]; // finger numbers
  barres?: { fromString: number; toString: number; fret: number }[];
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const SIZES = {
  sm: { width: 100, scale: 1 },
  md: { width: 150, scale: 1.5 },
  lg: { width: 200, scale: 2 },
} as const;

const COLORS = {
  primary: '#b45309',
  strings: '#78716c',
  nut: '#2d1810',
  text: '#2d1810',
  white: '#ffffff',
  open: '#78716c',
  muted: '#78716c',
};

export default function ChordDiagram({
  name,
  strings,
  fingers,
  barres = [],
  size = 'md',
  showName = true,
}: ChordDiagramProps) {
  const { scale } = SIZES[size];

  // Base dimensions (designed for sm, then scaled)
  const padding = { top: 30, left: 20, right: 15, bottom: 25 };
  const stringSpacing = 16;
  const fretSpacing = 18;
  const numStrings = 5;
  const numFrets = 4;

  const gridWidth = stringSpacing * (numStrings - 1);
  const gridHeight = fretSpacing * numFrets;

  const totalWidth = padding.left + gridWidth + padding.right;
  const totalHeight = padding.top + gridHeight + padding.bottom;

  const svgWidth = totalWidth * scale;
  const svgHeight = totalHeight * scale;

  // Up-the-neck handling: if any fretted note is beyond the 4-fret window,
  // slide the window so it starts at the lowest fretted note and show a
  // "Nfr" indicator instead of the nut.
  const frettedNotes = strings.filter((f) => f > 0);
  const maxFret = frettedNotes.length > 0 ? Math.max(...frettedNotes) : 0;
  const minFret = frettedNotes.length > 0 ? Math.min(...frettedNotes) : 1;
  const startFret = maxFret > numFrets ? minFret : 1;
  const displayFret = (fret: number) => fret - startFret + 1;

  // Get X position for a string (5=leftmost, 1=rightmost)
  const stringX = (stringNum: number) =>
    padding.left + (5 - stringNum) * stringSpacing;

  // Get Y position for a fret (0=top line, 1=first fret below, etc.)
  const fretY = (fret: number) => padding.top + fret * fretSpacing;

  // Get center Y for a finger placed on a given display row
  const fingerY = (row: number) =>
    padding.top + (row - 0.5) * fretSpacing;

  const nutThickness = 3 * scale;
  const circleR = 5.5;
  const fontSize = 7;
  const labelFontSize = 6;
  const nameFontSize = 9;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      className="select-none"
    >
      {/* Chord name */}
      {showName && (
        <text
          x={padding.left + gridWidth / 2}
          y={10}
          textAnchor="middle"
          fill={COLORS.text}
          fontSize={nameFontSize}
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          {name}
        </text>
      )}

      {/* Nut (thick top bar) — only when diagram starts at fret 1 */}
      {startFret === 1 && (
        <rect
          x={padding.left - 1}
          y={padding.top - nutThickness / scale}
          width={gridWidth + 2}
          height={nutThickness / scale}
          fill={COLORS.nut}
          rx={0.5}
        />
      )}

      {/* Starting fret indicator for up-the-neck diagrams */}
      {startFret > 1 && (
        <text
          x={padding.left + gridWidth + 3}
          y={fingerY(1) + labelFontSize * 0.35}
          textAnchor="start"
          fill={COLORS.text}
          fontSize={labelFontSize}
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          {startFret}fr
        </text>
      )}

      {/* Fret lines (horizontal) */}
      {Array.from({ length: numFrets + 1 }, (_, i) => (
        <line
          key={`fret-${i}`}
          x1={padding.left}
          y1={fretY(i)}
          x2={padding.left + gridWidth}
          y2={fretY(i)}
          stroke={COLORS.strings}
          strokeWidth={i === 0 ? 0.5 : 0.5}
        />
      ))}

      {/* String lines (vertical) */}
      {Array.from({ length: numStrings }, (_, i) => {
        const sNum = 5 - i; // string number (5 on left, 1 on right)
        const x = padding.left + i * stringSpacing;
        return (
          <line
            key={`string-${sNum}`}
            x1={x}
            y1={fretY(0)}
            x2={x}
            y2={fretY(numFrets)}
            stroke={COLORS.strings}
            strokeWidth={sNum === 5 ? 0.7 : 0.7}
          />
        );
      })}

      {/* Barres */}
      {barres.map((barre, i) => {
        const x1 = stringX(barre.fromString);
        const x2 = stringX(barre.toString);
        const y = fingerY(displayFret(barre.fret));
        return (
          <rect
            key={`barre-${i}`}
            x={Math.min(x1, x2) - circleR}
            y={y - circleR * 0.6}
            width={Math.abs(x2 - x1) + circleR * 2}
            height={circleR * 1.2}
            rx={circleR * 0.6}
            fill={COLORS.primary}
          />
        );
      })}

      {/* Finger dots */}
      {strings.map((fret, i) => {
        const stringNum = 5 - i; // strings[0] = 5th string
        if (fret <= 0) return null; // skip open and muted strings

        const cx = stringX(stringNum);
        const cy = fingerY(displayFret(fret));
        const finger = fingers[i];

        return (
          <g key={`finger-${stringNum}`}>
            <circle cx={cx} cy={cy} r={circleR} fill={COLORS.primary} />
            {finger > 0 && (
              <text
                x={cx}
                y={cy + fontSize * 0.35}
                textAnchor="middle"
                fill={COLORS.white}
                fontSize={fontSize}
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {finger}
              </text>
            )}
          </g>
        );
      })}

      {/* Open / Muted indicators above nut */}
      {strings.map((fret, i) => {
        const stringNum = 5 - i;
        const x = stringX(stringNum);
        const y = padding.top - nutThickness / scale - 4;

        if (fret === 0) {
          return (
            <text
              key={`open-${stringNum}`}
              x={x}
              y={y}
              textAnchor="middle"
              fill={COLORS.open}
              fontSize={fontSize}
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              O
            </text>
          );
        }
        if (fret === -1) {
          return (
            <text
              key={`muted-${stringNum}`}
              x={x}
              y={y}
              textAnchor="middle"
              fill={COLORS.muted}
              fontSize={fontSize}
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              X
            </text>
          );
        }
        return null;
      })}

      {/* String labels at bottom */}
      {Array.from({ length: numStrings }, (_, i) => {
        const stringNum = 5 - i;
        return (
          <text
            key={`label-${stringNum}`}
            x={padding.left + i * stringSpacing}
            y={fretY(numFrets) + 12}
            textAnchor="middle"
            fill={COLORS.text}
            fontSize={labelFontSize}
            fontFamily="sans-serif"
          >
            {stringNum}
          </text>
        );
      })}
    </svg>
  );
}
