'use client';

import React, { useSyncExternalStore } from 'react';

/**
 * Floating geometric shapes that add depth and visual interest.
 * Optimized: fewer shapes, CSS animations, desktop-only rendering.
 */

interface ShapeConfig {
  type: string;
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay: number;
  duration: number;
  opacity: number;
}

// Reduced from 10 to 6 shapes for better performance
const shapes: ShapeConfig[] = [
  {
    type: 'circle-outline',
    size: 120,
    top: '8%',
    right: '5%',
    delay: 0,
    duration: 7,
    opacity: 0.06,
  },
  {
    type: 'circle-filled',
    size: 24,
    top: '35%',
    left: '3%',
    delay: 1.5,
    duration: 5,
    opacity: 0.12,
  },
  {
    type: 'hexagon',
    size: 80,
    top: '45%',
    right: '8%',
    delay: 0.8,
    duration: 9,
    opacity: 0.05,
  },
  {
    type: 'square',
    size: 40,
    bottom: '20%',
    left: '6%',
    delay: 2,
    duration: 12,
    opacity: 0.07,
  },
  {
    type: 'ring',
    size: 50,
    bottom: '35%',
    right: '4%',
    delay: 1,
    duration: 6,
    opacity: 0.08,
  },
  {
    type: 'circle-filled',
    size: 10,
    top: '25%',
    right: '25%',
    delay: 1.8,
    duration: 6.5,
    opacity: 0.08,
  },
];

function ShapeRenderer({
  type,
  size,
  opacity,
}: {
  type: string;
  size: number;
  opacity: number;
}) {
  const color = 'var(--primary)';

  switch (type) {
    case 'circle-outline':
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: `1px solid ${color}`,
            opacity,
          }}
        />
      );

    case 'circle-filled':
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: color,
            opacity,
            filter: size > 15 ? 'blur(1px)' : 'none',
          }}
        />
      );

    case 'hexagon':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          style={{ opacity }}
        >
          <polygon
            points="50,3 95,25 95,75 50,97 5,75 5,25"
            stroke={color}
            strokeWidth="1"
            fill="none"
          />
        </svg>
      );

    case 'square':
      return (
        <div
          style={{
            width: size,
            height: size,
            border: `1px solid ${color}`,
            opacity,
            borderRadius: '4px',
          }}
        />
      );

    case 'ring':
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: `2px solid ${color}`,
            opacity,
            boxShadow: `0 0 ${size / 3}px ${color}`,
          }}
        />
      );

    default:
      return null;
  }
}

function useIsDesktop() {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia("(min-width: 768px)");
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );
}

export default function FloatingShapes() {
  const isDesktop = useIsDesktop();

  // Don't render on mobile
  if (!isDesktop) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {shapes.map((shape, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: shape.top,
            left: shape.left,
            right: shape.right,
            bottom: shape.bottom,
            width: shape.size,
            height: shape.size,
            willChange: 'transform',
            animation: `${shape.type === 'square' ? 'shape-float-rotate' : 'shape-float'} ${shape.duration}s ease-in-out infinite`,
            animationDelay: `${shape.delay}s`,
          }}
        >
          <ShapeRenderer type={shape.type} size={shape.size} opacity={shape.opacity} />
        </div>
      ))}
    </div>
  );
}
