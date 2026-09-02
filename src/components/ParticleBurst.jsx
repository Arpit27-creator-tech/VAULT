import React, { useEffect, useState } from 'react';

/**
 * Renders a short-lived burst of small particles radiating outward
 * from the center of the screen, then removes itself. Purely a
 * celebratory visual effect — fire-and-forget, no interaction.
 *
 * Usage: bump a counter state on the triggering event and render
 * <ParticleBurst key={burstTrigger} /> conditionally — the changing
 * key forces a fresh mount (and thus a fresh burst) each time.
 */
export default function ParticleBurst({ colors = ['#10B981', '#FBBF24', '#34D399', '#F0FDF4'], count = 18 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 750);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const particles = Array.from({ length: count }).map((_, i) => {
    const angle = (i / count) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
    const distance = 80 + Math.random() * 100;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const size = 4 + Math.random() * 5;
    const color = colors[i % colors.length];
    const delay = Math.random() * 0.08;

    return (
      <span
        key={i}
        className="particle-burst-dot"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '2px',
          backgroundColor: color,
          '--tx': `${tx}px`,
          '--ty': `${ty}px`,
          animationDelay: `${delay}s`
        }}
      />
    );
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {particles}
    </div>
  );
}
