'use client';

import React from 'react';

interface HandPositionGuideProps {
  /** Whether the left (fretting) hand is detected in the correct zone */
  leftHandDetected?: boolean;
  /** Whether the right (picking) hand is detected in the correct zone */
  rightHandDetected?: boolean;
  /** Optional feedback message shown at the bottom of the overlay */
  feedbackMessage?: string;
}

export default function HandPositionGuide({
  leftHandDetected = false,
  rightHandDetected = false,
  feedbackMessage,
}: HandPositionGuideProps) {
  const leftColor = leftHandDetected ? '#16a34a' : '#ca8a04';
  const rightColor = rightHandDetected ? '#16a34a' : '#ca8a04';

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1280 720"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fretting hand zone — left third of the frame, middle vertical area */}
      <rect
        x={40}
        y={140}
        width={380}
        height={440}
        rx={24}
        fill={leftColor}
        fillOpacity={0.08}
        stroke={leftColor}
        strokeWidth={3}
        strokeDasharray={leftHandDetected ? 'none' : '12 6'}
      />
      {/* Label background */}
      <rect
        x={50}
        y={150}
        width={170}
        height={32}
        rx={8}
        fill={leftColor}
        fillOpacity={0.85}
      />
      <text
        x={135}
        y={172}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={16}
        fontWeight={600}
        fontFamily="system-ui, sans-serif"
      >
        Fretting Hand
      </text>
      {/* Fretting hand icon hint */}
      <text
        x={230}
        y={380}
        textAnchor="middle"
        fill={leftColor}
        fillOpacity={0.5}
        fontSize={14}
        fontFamily="system-ui, sans-serif"
      >
        {leftHandDetected ? 'Position detected' : 'Place hand here'}
      </text>

      {/* Picking hand zone — right third of the frame, middle vertical area */}
      <rect
        x={860}
        y={140}
        width={380}
        height={440}
        rx={24}
        fill={rightColor}
        fillOpacity={0.08}
        stroke={rightColor}
        strokeWidth={3}
        strokeDasharray={rightHandDetected ? 'none' : '12 6'}
      />
      {/* Label background */}
      <rect
        x={870}
        y={150}
        width={160}
        height={32}
        rx={8}
        fill={rightColor}
        fillOpacity={0.85}
      />
      <text
        x={950}
        y={172}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={16}
        fontWeight={600}
        fontFamily="system-ui, sans-serif"
      >
        Picking Hand
      </text>
      {/* Picking hand hint */}
      <text
        x={1050}
        y={380}
        textAnchor="middle"
        fill={rightColor}
        fillOpacity={0.5}
        fontSize={14}
        fontFamily="system-ui, sans-serif"
      >
        {rightHandDetected ? 'Position detected' : 'Place hand here'}
      </text>

      {/* Center label — banjo neck reference */}
      <text
        x={640}
        y={360}
        textAnchor="middle"
        fill="#ffffff"
        fillOpacity={0.3}
        fontSize={18}
        fontFamily="system-ui, sans-serif"
        fontWeight={500}
      >
        Banjo Neck Area
      </text>
      <line
        x1={480}
        y1={375}
        x2={800}
        y2={375}
        stroke="#ffffff"
        strokeOpacity={0.15}
        strokeWidth={2}
      />

      {/* Feedback message at the bottom */}
      {feedbackMessage && (
        <>
          <rect
            x={340}
            y={650}
            width={600}
            height={40}
            rx={12}
            fill="#000000"
            fillOpacity={0.6}
          />
          <text
            x={640}
            y={676}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={15}
            fontFamily="system-ui, sans-serif"
          >
            {feedbackMessage}
          </text>
        </>
      )}
    </svg>
  );
}
