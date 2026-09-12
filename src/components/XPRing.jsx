import React from 'react';

/**
 * Compact SVG ring showing current level with a progress arc toward the
 * next level, matching the server's leveling formula: level = floor(xp/1000)+1.
 * Sized for use inline in a header/nav bar.
 */
export default function XPRing({ level = 1, xp = 0, size = 34 }) {
  const xpIntoLevel = ((xp % 1000) + 1000) % 1000; // guard against negative/odd values
  const progress = Math.min(1, xpIntoLevel / 1000);

  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#03140C"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#10B981"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-black text-[#FBBF24]"
        style={{ fontSize: size * 0.34 }}
      >
        {level}
      </div>
    </div>
  );
}
