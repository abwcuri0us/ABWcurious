'use client';

import React, { useSyncExternalStore } from 'react';

interface AuroraBackgroundProps {
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

const intensityMap = {
  low: {
    dark: 0.5,
    light: 0.6,
  },
  medium: {
    dark: 0.75,
    light: 0.8,
  },
  high: {
    dark: 1,
    light: 1,
  },
};

// Reduced from 3 to 2 blobs for better performance
const blobStyles: React.CSSProperties[] = [
  {
    width: '600px',
    height: '600px',
    top: '-10%',
    left: '-5%',
    animationDuration: '22s',
  },
  {
    width: '500px',
    height: '500px',
    top: '20%',
    right: '-10%',
    animationDuration: '28s',
    animationDelay: '-10s',
  },
];

// Keyframes moved to globals.css for better caching

const animationNames = [
  'aurora-drift-1',
  'aurora-drift-2',
];

// Dark mode blob colors (reduced to 2)
const darkBlobColors = [
  'rgba(0, 240, 255, 0.15)',   // cyan
  'rgba(124, 58, 237, 0.12)',  // purple
];

// Light mode blob colors (reduced to 2)
const lightBlobColors = [
  'rgba(8, 145, 178, 0.08)',   // teal
  'rgba(124, 58, 237, 0.06)',  // purple
];

function useIsDesktop() {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia('(min-width: 768px)');
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    },
    () => window.matchMedia('(min-width: 768px)').matches,
    () => false,
  );
}

export default function AuroraBackground({
  className = '',
  intensity = 'medium',
}: AuroraBackgroundProps) {
  const isDesktop = useIsDesktop();

  // Don't render heavy blurred elements on mobile
  if (!isDesktop) {
    return (
      <div
        className={`pointer-events-none ${className}`}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, var(--glow-color) 0%, transparent 60%)',
          opacity: 0.08,
          zIndex: 0,
        }}
        aria-hidden="true"
      />
    );
  }

  const intensityMultiplier = intensityMap[intensity];

  return (
    <div
      className={`aurora-background pointer-events-none ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
        {/* Dark mode blobs */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: intensityMultiplier.dark,
            transition: 'opacity 0.5s ease',
          }}
          className="aurora-blobs-dark"
        >
          {blobStyles.map((style, i) => (
            <div
              key={`dark-${i}`}
              style={{
                position: 'absolute',
                width: style.width,
                height: style.height,
                top: style.top,
                left: style.left,
                right: style.right,
                bottom: style.bottom,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${darkBlobColors[i]} 0%, transparent 70%)`,
                filter: 'blur(40px)',
                mixBlendMode: 'screen',
                animation: `${animationNames[i]} ${style.animationDuration} ease-in-out infinite${style.animationDelay ? ` ${style.animationDelay}` : ''}`,
                willChange: 'transform',
              }}
            />
          ))}
        </div>

        {/* Light mode blobs */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: intensityMultiplier.light,
            transition: 'opacity 0.5s ease',
          }}
          className="aurora-blobs-light"
        >
          {blobStyles.map((style, i) => (
            <div
              key={`light-${i}`}
              style={{
                position: 'absolute',
                width: style.width,
                height: style.height,
                top: style.top,
                left: style.left,
                right: style.right,
                bottom: style.bottom,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${lightBlobColors[i]} 0%, transparent 70%)`,
                filter: 'blur(40px)',
                mixBlendMode: 'multiply',
                animation: `${animationNames[i]} ${style.animationDuration} ease-in-out infinite${style.animationDelay ? ` ${style.animationDelay}` : ''}`,
                willChange: 'transform',
              }}
            />
          ))}
        </div>

        {/* Subtle pulsing overlay for depth */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, var(--glow-color) 0%, transparent 60%)',
            opacity: 0.12,
            animation: 'aurora-pulse 10s ease-in-out infinite',
            willChange: 'opacity',
            pointerEvents: 'none',
          }}
        />
    </div>
  );
}
