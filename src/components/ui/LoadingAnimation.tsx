"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface LoadingAnimationProps {
  onComplete: () => void;
}

export default function LoadingAnimation({ onComplete }: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [stars, setStars] = useState<{ id: number; size: number; top: string; left: string; duration: number }[]>([]);

  useEffect(() => {
    document.body.classList.add('loader-active');
    
    // Generate random stars for the background
    const newStars = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 3 + 2,
    }));
    setStars(newStars);

    return () => document.body.classList.remove('loader-active');
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsComplete(true);
            setTimeout(() => onComplete(), 1200);
          }, 400);
          return 100;
        }
        return Math.min(prev + (Math.random() * 10 + 2), 100);
      });
    }, 150);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
        style={{
          zIndex: 9999,
          background: 'radial-gradient(ellipse at center, #1b003a 0%, #0B0C10 70%, #000000 100%)',
          overflow: 'hidden',
          perspective: '1000px'
        }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        {/* Parallax Stars Layer */}
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="position-absolute rounded-circle bg-white"
            style={{
              width: star.size,
              height: star.size,
              top: star.top,
              left: star.left,
              boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.8)`
            }}
            animate={{
              opacity: [0.1, 1, 0.1],
              scale: [1, 1.2, 1],
              y: [0, -20]
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}

        {/* Deep Space Glowing Planets/Galaxies */}
        <motion.div 
          className="position-absolute rounded-circle"
          style={{ width: '40vmax', height: '40vmax', background: 'radial-gradient(circle, rgba(0,242,254,0.15) 0%, rgba(0,0,0,0) 70%)', top: '-10%', left: '-10%', filter: 'blur(40px)' }}
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className="position-absolute rounded-circle"
          style={{ width: '60vmax', height: '60vmax', background: 'radial-gradient(circle, rgba(138,43,226,0.1) 0%, rgba(0,0,0,0) 70%)', bottom: '-20%', right: '-10%', filter: 'blur(50px)' }}
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />

        {/* Central Logo & Progress Container */}
        <motion.div
          animate={isComplete ? { scale: 15, opacity: 0, rotateZ: 45 } : { scale: 1, opacity: 1, rotateZ: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="d-flex flex-column align-items-center z-3"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 3D Spinning Logo */}
          <motion.div
            className="mb-5 position-relative"
            style={{ width: '150px', height: '150px' }}
            initial={{ rotateY: -180, opacity: 0, z: -500 }}
            animate={{ rotateY: 0, opacity: 1, z: 0 }}
            transition={{ type: "spring", stiffness: 50, damping: 20, duration: 2 }}
          >
            <motion.div
              animate={{ rotateY: 360, y: [0, -15, 0] }}
              transition={{ rotateY: { duration: 6, repeat: Infinity, ease: "linear" }, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
              style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
            >
              <Image 
                src="/images/logo.png" 
                alt="ABWcurious Logo" 
                fill 
                className="object-fit-contain drop-shadow-glow" 
                style={{ filter: 'drop-shadow(0 0 20px rgba(0,242,254,0.8))' }}
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center w-100"
          >
            <h3 className="fw-bold mb-3" style={{ color: '#ffffff', letterSpacing: '6px', textTransform: 'uppercase', textShadow: '0 0 15px rgba(0,242,254,0.6)' }}>
              ABWCURIOUS
            </h3>
            
            <div className="d-flex align-items-center justify-content-center gap-3">
              <div 
                className="overflow-hidden rounded-pill" 
                style={{ width: '250px', height: '4px', background: 'rgba(255,255,255,0.1)', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}
              >
                <motion.div
                  style={{ height: '100%', background: 'linear-gradient(90deg, transparent, #00f2fe, #fff)', boxShadow: '0 0 15px #00f2fe' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <span className="fw-bold" style={{ color: '#00f2fe', minWidth: '45px', textAlign: 'right', textShadow: '0 0 10px #00f2fe' }}>
                {Math.floor(progress)}%
              </span>
            </div>
          </motion.div>
        </motion.div>

      </motion.div>
    </AnimatePresence>
  );
}
