'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface PreloaderProps {
  onComplete: () => void;
}

const PRELOADER_SESSION_KEY = 'abwcurious-preloader-seen';

const companyName = 'ABWcurious';
const letters = companyName.split('');

// CSS animations for the preloader — replaces framer-motion where possible
const preloaderStyles = `
@keyframes preloader-logo-enter {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes preloader-glow-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.7;
  }
}

@keyframes preloader-letter-enter {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes preloader-progress {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

@keyframes preloader-tagline-fade {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
`;

export default function Preloader({ onComplete }: PreloaderProps) {
  const [skipped] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!sessionStorage.getItem(PRELOADER_SESSION_KEY);
    }
    return false;
  });

  const [isVisible, setIsVisible] = useState(false);

  // If the user already saw the preloader this session, notify parent immediately
  useEffect(() => {
    if (skipped) {
      onComplete();
    }
  }, [skipped, onComplete]);

  // Trigger the entrance animation on mount (via rAF so it's asynchronous)
  useEffect(() => {
    if (skipped) return;

    const rafId = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(rafId);
  }, [skipped]);

  // Lock body scroll while preloader is visible
  useEffect(() => {
    if (skipped) return;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [skipped]);

  const handleExitComplete = useCallback(() => {
    sessionStorage.setItem(PRELOADER_SESSION_KEY, 'true');
    onComplete();
  }, [onComplete]);

  // Don't render anything if preloader was already seen
  if (skipped) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: preloaderStyles }} />
      <AnimatePresence onExitComplete={handleExitComplete}>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-[9990] flex flex-col items-center justify-center"
            style={{ background: 'var(--background)' }}
            initial={{ opacity: 1 }}
            exit={{
              y: '-100%',
              opacity: 0,
              transition: {
                duration: 0.7,
                ease: [0.76, 0, 0.24, 1],
              },
            }}
          >
            {/* Subtle radial glow behind content */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, var(--glow-color) 0%, transparent 70%)',
              }}
            />

            {/* Logo image — CSS animation instead of framer-motion */}
            <div
              className="relative mb-8"
              style={{
                animation: 'preloader-logo-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
              }}
            >
              {/* Pulsing glow ring behind the logo — CSS animation */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'var(--glow-color)',
                  filter: 'blur(20px)',
                  animation: 'preloader-glow-pulse 2s ease-in-out infinite',
                }}
              />

              <Image
                src="/logo.png"
                alt="ABWcurious Logo"
                width={80}
                height={80}
                className="relative z-10 drop-shadow-lg"
                priority
              />
            </div>

            {/* Letter-by-letter animated text — CSS staggered animation */}
            <div
              className="flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-10"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              {letters.map((letter, index) => {
                const isABW = index < 3;
                return (
                  <span
                    key={`${letter}-${index}`}
                    className={isABW ? 'text-gradient-cyan' : ''}
                    style={
                      !isABW
                        ? {
                            color: 'var(--foreground)',
                            opacity: 0,
                            animation: `preloader-letter-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${0.3 + index * 0.08}s forwards`,
                          }
                        : {
                            opacity: 0,
                            animation: `preloader-letter-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${0.3 + index * 0.08}s forwards`,
                          }
                    }
                  >
                    {letter}
                  </span>
                );
              })}
            </div>

            {/* Thin progress bar — CSS animation */}
            <div
              className="w-48 sm:w-64 h-[2px] rounded-full overflow-hidden"
              style={{ background: 'var(--border)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, var(--gradient-cyan-start), var(--gradient-cyan-end))',
                  animation: 'preloader-progress 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.8s forwards',
                  width: 0,
                }}
              />
            </div>

            {/* Subtle tagline — CSS fade-in */}
            <p
              className="mt-6 text-xs tracking-[0.3em] uppercase"
              style={{
                color: 'var(--muted-foreground)',
                fontFamily: 'var(--font-space-grotesk)',
                animation: 'preloader-tagline-fade 0.5s ease 1.2s forwards',
                opacity: 0,
              }}
            >
              Shaping A Better World
            </p>

            {/* Auto-dismiss after animation completes */}
            <AutoDismiss onComplete={() => setIsVisible(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Invisible helper component that triggers the exit animation
 * after the full sequence plays (~2.5s total).
 */
function AutoDismiss({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return null;
}
