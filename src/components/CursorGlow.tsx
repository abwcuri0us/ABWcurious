'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

/**
 * CursorGlow: A subtle glow that follows the mouse cursor.
 * Fully client-only to avoid hydration mismatch from theme-dependent CSS.
 * Uses CSS variables for theme-awareness instead of JS conditionals.
 */

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export default function CursorGlow() {
  const mounted = useIsMounted();
  const glowRef = useRef<HTMLDivElement>(null);
  const isDesktopRef = useRef(false);
  const rafIdRef = useRef(0);
  const targetXRef = useRef(-400);
  const targetYRef = useRef(-400);
  const currentXRef = useRef(-400);
  const currentYRef = useRef(-400);

  useEffect(() => {
    // Check for fine pointer (desktop)
    const mq = window.matchMedia('(pointer: fine)');
    isDesktopRef.current = mq.matches;

    const handleMqChange = (e: MediaQueryListEvent) => {
      isDesktopRef.current = e.matches;
      if (!e.matches && glowRef.current) {
        glowRef.current.style.transform = 'translate3d(-400px, -400px, 0) translate(-50%, -50%)';
      }
    };
    mq.addEventListener('change', handleMqChange);

    if (!isDesktopRef.current) return;

    // Smooth interpolation using rAF
    const lerp = (current: number, target: number, factor: number) =>
      current + (target - current) * factor;

    const animate = () => {
      currentXRef.current = lerp(currentXRef.current, targetXRef.current, 0.12);
      currentYRef.current = lerp(currentYRef.current, targetYRef.current, 0.12);

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentXRef.current}px, ${currentYRef.current}px, 0) translate(-50%, -50%)`;
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    // Debounced mouse move handler using rAF
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          targetXRef.current = e.clientX;
          targetYRef.current = e.clientY;
          ticking = false;
        });
      }
    };

    const handleMouseLeave = () => {
      targetXRef.current = -400;
      targetYRef.current = -400;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      mq.removeEventListener('change', handleMqChange);
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[45]"
      aria-hidden="true"
    >
      <div
        ref={glowRef}
        className="absolute top-0 left-0"
        style={{
          willChange: 'transform',
          transform: 'translate3d(-400px, -400px, 0) translate(-50%, -50%)',
        }}
      >
        <div
          className="rounded-full cursor-glow-dot"
          style={{
            width: '350px',
            height: '350px',
          }}
        />
      </div>
    </div>
  );
}
