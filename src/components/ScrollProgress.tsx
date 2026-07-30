'use client';

import { useSyncExternalStore } from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * ScrollProgress
 *
 * A thin, GPU-friendly scroll progress bar fixed to the top of the viewport.
 *
 * Performance notes:
 *  - Uses `transform: scaleX()` only (no `width` animation → no layout thrash).
 *  - Sits in a `position: fixed; top: 0` wrapper above the navbar (z-[60]).
 *  - Respects `prefers-reduced-motion`: when reduced motion is requested the
 *    bar is rendered statically (no spring, no smoothed transform) so it
 *    still reflects scroll position without animated transitions.
 *  - The wrapper sets `pointer-events: none` so it never blocks clicks.
 *  - `will-change: transform` is applied only to the single bar element that
 *    actually animates.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  // Smoothed spring (skipped under reduced-motion for an instant/static bar).
  const springX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const mounted = useIsMounted();

  // Don't render until mounted to avoid hydration mismatch.
  if (!mounted) return null;

  // Under reduced-motion, bind directly to raw scroll progress (no spring).
  const scaleX = prefersReducedMotion ? scrollYProgress : springX;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] pointer-events-none"
      style={{ scaleX, transformOrigin: '0% 50%' }}
      aria-hidden="true"
    >
      <div
        className="scroll-progress-bar"
        style={{
          height: '3px',
          transformOrigin: 'left',
          willChange: 'transform',
        }}
      />
    </motion.div>
  );
}
