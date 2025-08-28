"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingAnimationProps {
  onComplete: () => void;
}

export default function LoadingAnimation({ onComplete }: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showWhiteFlash, setShowWhiteFlash] = useState(false);

  // Add loader class to body when component mounts
  useEffect(() => {
    console.log('LoadingAnimation mounted - adding loader-active class');
    document.body.classList.add('loader-active');
    
    // Remove class when component unmounts
    return () => {
      console.log('LoadingAnimation unmounting - removing loader-active class');
      document.body.classList.remove('loader-active');
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Start the completion sequence
          setTimeout(() => {
            setIsComplete(true);
            setShowWhiteFlash(true);
            
            // Remove white flash and complete loading
            setTimeout(() => {
              onComplete();
            }, 1200);
          }, 800);
          return 100;
        }
        
        // Realistic loading progression
        const increment = Math.random() * 15 + 2;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  console.log('LoadingAnimation rendering with progress:', progress);
  
  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000000',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {/* White Flash Overlay */}
        <AnimatePresence>
          {showWhiteFlash && (
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#ffffff',
                zIndex: 10,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Company Name */}
          <motion.div
            style={{ position: 'relative' }}
            initial={{ scale: 1, opacity: 1 }}
            animate={isComplete ? { 
              scale: 12, 
              opacity: 0,
            } : { scale: 1, opacity: 1 }}
            transition={{ 
              duration: 1.4, 
              ease: [0.25, 0.1, 0.25, 1],
              delay: isComplete ? 0.3 : 0
            }}
          >
            <motion.h1
              style={{
                fontSize: '6rem',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '0.02em',
                textShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
                fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
                margin: 0,
              }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              AbwCurious
            </motion.h1>

            {/* Loading Text and Percentage */}
            <motion.div
              style={{
                position: 'absolute',
                bottom: '-2rem',
                right: 0,
                display: 'flex',
                alignItems: 'flex-end',
                gap: '0.75rem',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.025em' }}>
                loading
              </span>
              <motion.span
                style={{
                  color: '#ffffff',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  minWidth: '60px',
                  textAlign: 'right',
                }}
                key={Math.floor(progress)}
              >
                {Math.floor(progress)}%
              </motion.span>
            </motion.div>

            {/* Subtle Loading Bar */}
            <motion.div
              style={{
                position: 'absolute',
                bottom: '-0.5rem',
                left: 0,
                height: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                overflow: 'hidden',
                width: '100%',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                style={{
                  height: '100%',
                  backgroundColor: '#ffffff',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "easeOut" }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Ambient Particles */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.1, 0.5, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
