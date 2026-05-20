"use client";

import React, { useRef, useEffect, useSyncExternalStore } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface ParticleBackgroundProps {
  particleCount?: number;
  maxDistance?: number;
  speed?: number;
  className?: string;
}

function useIsDesktop() {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia("(min-width: 768px)");
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false, // server snapshot — assume not desktop
  );
}

export default function ParticleBackground({
  particleCount,
  maxDistance = 140,
  speed = 0.25,
  className = "",
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (!isDesktop) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Reduced particle count: 25 on desktop (was 40)
    const count = particleCount || 25;
    let animationId = 0;
    let particles: Particle[] = [];

    // Cache colors to avoid repeated DOM reads
    let isDark = document.documentElement.classList.contains("dark");
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const initParticles = (width: number, height: number) => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    let width = 0;
    let height = 0;
    let running = true;

    // Pre-compute squared max distance for efficient distance checks
    const maxDistSq = maxDistance * maxDistance;

    const draw = () => {
      if (!running) return;

      ctx.clearRect(0, 0, width, height);

      // Pre-compute color base once per frame
      const colorBase = isDark ? "0, 240, 255" : "8, 145, 178";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorBase}, ${p.opacity})`;
        ctx.fill();

        // Use squared distance checks only — no sqrt needed
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;

          // Squared-distance check (no sqrt)
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSq) {
            // Approximate opacity using squared distance ratio
            // (1 - distSq/maxDistSq) gives a smoother curve than sqrt-based
            const lineOpacity = (1 - distSq / maxDistSq) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${colorBase}, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      // Cap devicePixelRatio at 1.5 for performance on high-DPI screens
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      ctx.scale(dpr, dpr);

      width = displayWidth;
      height = displayHeight;
      initParticles(width, height);
    };

    handleResize();
    animationId = requestAnimationFrame(draw);

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      running = false;
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isDesktop, particleCount, maxDistance, speed]);

  // Don't render on mobile
  if (!isDesktop) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        willChange: "transform",
      }}
      aria-hidden="true"
    />
  );
}
