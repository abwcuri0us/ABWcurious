'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';

/**
 * AnimatedBackground — Premium AI company living background
 * 
 * Features:
 * - Theme-aware colors (cyan/blue for dark, teal/blue for light)
 * - Floating particles with glow halos
 * - Glowing mesh gradient orbs
 * - Network connection lines between nearby particles
 * - Periodic shooting star / comet trails
 * - Mouse interaction — particles gently repel from cursor
 * - 60 FPS, GPU-friendly, responsive
 */

interface ParticleData {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  haloRadius: number;
}

interface OrbData {
  x: number;
  y: number;
  radius: number;
  hue: number;
  speedX: number;
  speedY: number;
  pulse: number;
  pulseSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
  hue: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const { resolvedTheme } = useTheme();
  const themeRef = useRef(resolvedTheme);

  // Keep themeRef in sync
  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: ParticleData[] = [];
    let orbs: OrbData[] = [];
    let shootingStars: ShootingStar[] = [];
    let frameCount = 0;

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Theme-aware color helpers
    const getColors = () => {
      const isDark = themeRef.current === 'dark';
      return {
        particleColor: isDark ? [0, 240, 255] : [8, 145, 178],
        lineColor: isDark ? [0, 240, 255] : [8, 145, 178],
        orbColors: isDark
          ? [
              { h: 187, s: 100, l: 50, a: 0.06 }, // cyan
              { h: 220, s: 100, l: 50, a: 0.04 }, // blue
              { h: 270, s: 80, l: 55, a: 0.03 },  // purple
              { h: 200, s: 90, l: 45, a: 0.05 },  // deep blue
            ]
          : [
              { h: 187, s: 70, l: 50, a: 0.04 },  // teal
              { h: 220, s: 80, l: 55, a: 0.03 },  // blue
              { h: 160, s: 60, l: 50, a: 0.02 },  // green-teal
              { h: 250, s: 60, l: 60, a: 0.02 },  // purple
            ],
        starColor: isDark ? [0, 240, 255] : [8, 145, 178],
        bgOpacity: isDark ? 0.03 : 0.02,
        particleOpacityMul: isDark ? 1 : 0.6,
        lineOpacityMul: isDark ? 1 : 0.5,
        haloOpacityMul: isDark ? 1 : 0.3,
      };
    };

    // Initialize particles
    const w = window.innerWidth;
    const h = window.innerHeight;
    const particleCount = Math.min(90, Math.floor((w * h) / 12000));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        opacity: Math.random() * 0.5 + 0.2,
        haloRadius: Math.random() * 8 + 4,
      });
    }

    // Initialize orbs
    for (let i = 0; i < 6; i++) {
      orbs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 180 + 120,
        hue: i,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.008 + 0.003,
      });
    }

    // Spawn a shooting star periodically
    const spawnShootingStar = () => {
      const side = Math.random();
      let x: number, y: number, angle: number;
      
      if (side < 0.5) {
        // From top
        x = Math.random() * w;
        y = -20;
        angle = Math.PI * 0.25 + Math.random() * Math.PI * 0.3;
      } else {
        // From right
        x = w + 20;
        y = Math.random() * h * 0.5;
        angle = Math.PI * 0.6 + Math.random() * Math.PI * 0.3;
      }

      shootingStars.push({
        x,
        y,
        length: Math.random() * 80 + 60,
        speed: Math.random() * 4 + 3,
        angle,
        opacity: 0,
        life: 0,
        maxLife: Math.random() * 60 + 40,
        hue: Math.random() > 0.5 ? 187 : 220,
      });
    };

    // Animation loop
    const animate = () => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const colors = getColors();
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, cw, ch);

      // Subtle gradient mesh background
      const bgGrad = ctx.createLinearGradient(0, 0, cw, ch);
      const [r, g, b] = colors.particleColor;
      bgGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${colors.bgOpacity})`);
      bgGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${colors.bgOpacity * 0.7})`);
      bgGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${colors.bgOpacity})`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, cw, ch);

      // Draw orbs
      for (const orb of orbs) {
        orb.x += orb.speedX;
        orb.y += orb.speedY;
        orb.pulse += orb.pulseSpeed;

        if (orb.x < -orb.radius) orb.x = cw + orb.radius;
        if (orb.x > cw + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = ch + orb.radius;
        if (orb.y > ch + orb.radius) orb.y = -orb.radius;

        const pulseFactor = Math.sin(orb.pulse) * 0.25 + 0.8;
        const currentRadius = orb.radius * pulseFactor;
        const orbColor = colors.orbColors[orb.hue % colors.orbColors.length];

        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, currentRadius
        );
        gradient.addColorStop(0, `hsla(${orbColor.h}, ${orbColor.s}%, ${orbColor.l}%, ${orbColor.a})`);
        gradient.addColorStop(0.5, `hsla(${orbColor.h}, ${orbColor.s}%, ${orbColor.l}%, ${orbColor.a * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Update and draw particles + connections
      const mouseRepelRadius = 120;
      const mouseRepelForce = 0.8;

      for (const p of particles) {
        // Mouse repel
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRepelRadius && dist > 0) {
          const force = (1 - dist / mouseRepelRadius) * mouseRepelForce;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < 0) p.x = cw;
        if (p.x > cw) p.x = 0;
        if (p.y < 0) p.y = ch;
        if (p.y > ch) p.y = 0;
      }

      // Draw connections (check every 3rd frame for perf)
      if (frameCount % 2 === 0) {
        const maxDist = 140;
        const [lr, lg, lb] = colors.lineColor;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distSq = dx * dx + dy * dy;
            if (distSq < maxDist * maxDist) {
              const distance = Math.sqrt(distSq);
              const opacity = (1 - distance / maxDist) * 0.15 * colors.lineOpacityMul;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(${lr}, ${lg}, ${lb}, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      // Draw particles with glow halos
      const [pr, pg, pb] = colors.particleColor;
      for (const p of particles) {
        // Halo glow
        const haloGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.haloRadius);
        haloGrad.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, ${p.opacity * 0.15 * colors.haloOpacityMul})`);
        haloGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.haloRadius, 0, Math.PI * 2);
        ctx.fillStyle = haloGrad;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${p.opacity * colors.particleOpacityMul})`;
        ctx.fill();
      }

      // Shooting stars
      if (frameCount % 180 === 0 && shootingStars.length < 3) {
        spawnShootingStar();
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.life++;

        // Fade in/out
        if (star.life < 10) {
          star.opacity = star.life / 10;
        } else if (star.life > star.maxLife - 15) {
          star.opacity = (star.maxLife - star.life) / 15;
        } else {
          star.opacity = 1;
        }

        if (star.life >= star.maxLife) {
          shootingStars.splice(i, 1);
          continue;
        }

        // Move
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;

        // Draw trail
        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        const starGrad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        const [sr, sg, sb] = colors.starColor;
        starGrad.addColorStop(0, `rgba(${sr}, ${sg}, ${sb}, 0)`);
        starGrad.addColorStop(0.6, `rgba(${sr}, ${sg}, ${sb}, ${star.opacity * 0.3})`);
        starGrad.addColorStop(1, `rgba(${sr}, ${sg}, ${sb}, ${star.opacity * 0.8})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = starGrad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Head glow
        const headGrad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 6);
        headGrad.addColorStop(0, `rgba(255, 255, 255, ${star.opacity * 0.8})`);
        headGrad.addColorStop(0.5, `rgba(${sr}, ${sg}, ${sb}, ${star.opacity * 0.4})`);
        headGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(star.x, star.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = headGrad;
        ctx.fill();
      }

      frameCount++;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: resolvedTheme === 'dark' ? 0.7 : 0.5 }}
      aria-hidden="true"
    />
  );
}