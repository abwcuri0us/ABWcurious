'use client';

import React from 'react';

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

// Simplified keyframes - fewer keyframe steps (2 instead of 3), GPU-accelerated
const auroraKeyframes = `
@keyframes aurora-drift-1 {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(50px, -30px, 0) scale(1.06);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes aurora-drift-2 {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(-40px, 35px, 0) scale(1.08);
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes aurora-pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.45;
  }
}
`;

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

export default function AuroraBackground({
  className = '',
  intensity = 'medium',
}: AuroraBackgroundProps) {
  const intensityMultiplier = intensityMap[intensity];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: auroraKeyframes + `
        /* Default (light mode): show light blobs, hide dark blobs */
        .aurora-blobs-dark {
          display: none;
        }
        .aurora-blobs-light {
          display: block;
        }
        /* Dark mode: show dark blobs, hide light blobs */
        .dark .aurora-blobs-dark {
          display: block;
        }
        .dark .aurora-blobs-light {
          display: none;
        }
      ` }} />

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

    </>
  );
}
