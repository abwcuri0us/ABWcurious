'use client';

import { useSyncExternalStore } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const mounted = useIsMounted();

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[49] pointer-events-none"
      style={{ scaleX }}
      aria-hidden="true"
    >
      <div
        className="scroll-progress-bar"
        style={{
          height: '3px',
          transformOrigin: 'left',
        }}
      />
    </motion.div>
  );
}
