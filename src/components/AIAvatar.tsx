'use client';

import { useEffect, useRef, useState, useId } from 'react';

interface AIAvatarProps {
  size?: number; // default 48
  className?: string;
  enableEyeTracking?: boolean; // default true
  enableBlinking?: boolean; // default true
  excited?: boolean; // more animated state when chat is open
}

/* ------------------------------------------------------------------ */
/*  Copilot-style AI Avatar with cursor-following eyes and blinking    */
/*  Redesigned as a cute robot/assistant with dome head, visor,        */
/*  antenna, ear accents, and cyan color scheme                        */
/* ------------------------------------------------------------------ */

export default function AIAvatar({
  size = 48,
  className = '',
  enableEyeTracking = true,
  enableBlinking = true,
  excited = false,
}: AIAvatarProps) {
  const uid = useId();
  // Create unique IDs for SVG defs to avoid conflicts when multiple instances are rendered
  const bodyGradientId = `${uid}-body`;
  const bodyHighlightId = `${uid}-highlight`;
  const visorGradientId = `${uid}-visor`;
  const eyeGlowId = `${uid}-eye-glow`;
  const bodyGlowId = `${uid}-body-glow`;
  const eyeWhiteId = `${uid}-eye-white`;
  const irisGradientId = `${uid}-iris`;
  const specularId = `${uid}-specular`;
  const antennaGlowId = `${uid}-antenna-glow`;
  const earGradientId = `${uid}-ear`;
  const chinGradientId = `${uid}-chin`;

  const svgRef = useRef<SVGSVGElement>(null);
  const leftPupilRef = useRef<SVGCircleElement>(null);
  const rightPupilRef = useRef<SVGCircleElement>(null);

  const [isBlinking, setIsBlinking] = useState(false);
  const mountedRef = useRef(false);
  const rafRef = useRef<number>(0);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const lastUpdateRef = useRef(0);

  // Eye center positions in SVG coordinate space (viewBox 0 0 100 100)
  // Positioned within the visor band for the new Copilot-style design
  const LEFT_EYE_CENTER = { x: 36, y: 45 };
  const RIGHT_EYE_CENTER = { x: 64, y: 45 };
  const MAX_PUPIL_OFFSET = 3; // max px offset in SVG units

  // Mount guard for SSR - use ref instead of state to avoid lint warning
  useEffect(() => {
    mountedRef.current = true;
  }, []);

  /* ---- Blinking logic ---- */
  useEffect(() => {
    if (!enableBlinking) return;

    let blinkTimeout: ReturnType<typeof setTimeout>;

    const scheduleBlink = () => {
      // Random interval between 3-5 seconds
      const delay = 3000 + Math.random() * 2000;
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        // Blink duration ~150ms
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, delay);
    };

    scheduleBlink();

    return () => clearTimeout(blinkTimeout);
  }, [enableBlinking]);

  /* ---- Eye tracking with requestAnimationFrame ---- */
  useEffect(() => {
    if (!mountedRef.current || !enableEyeTracking) return;

    const updatePupils = () => {
      if (!svgRef.current || !leftPupilRef.current || !rightPupilRef.current) {
        rafRef.current = requestAnimationFrame(updatePupils);
        return;
      }

      const now = performance.now();
      // Throttle to ~30fps for performance
      if (now - lastUpdateRef.current < 33) {
        rafRef.current = requestAnimationFrame(updatePupils);
        return;
      }
      lastUpdateRef.current = now;

      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();

      // Calculate angle and clamp offset for each eye
      const calculateOffset = (eyeCenter: { x: number; y: number }) => {
        const eyeDx = mousePosRef.current.x - (rect.left + (eyeCenter.x / 100) * rect.width);
        const eyeDy = mousePosRef.current.y - (rect.top + (eyeCenter.y / 100) * rect.height);
        const angle = Math.atan2(eyeDy, eyeDx);
        const distance = Math.sqrt(eyeDx * eyeDx + eyeDy * eyeDy);

        // Scale the offset - more distant cursor = more offset, capped at MAX
        const normalizedDist = Math.min(distance / 150, 1);
        const offset = normalizedDist * MAX_PUPIL_OFFSET;

        return {
          x: Math.cos(angle) * offset,
          y: Math.sin(angle) * offset,
        };
      };

      const leftOffset = calculateOffset(LEFT_EYE_CENTER);
      const rightOffset = calculateOffset(RIGHT_EYE_CENTER);

      // Direct DOM manipulation for performance (avoid React re-renders)
      leftPupilRef.current.setAttribute('cx', String(LEFT_EYE_CENTER.x + leftOffset.x));
      leftPupilRef.current.setAttribute('cy', String(LEFT_EYE_CENTER.y + leftOffset.y));
      rightPupilRef.current.setAttribute('cx', String(RIGHT_EYE_CENTER.x + rightOffset.x));
      rightPupilRef.current.setAttribute('cy', String(RIGHT_EYE_CENTER.y + rightOffset.y));

      rafRef.current = requestAnimationFrame(updatePupils);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current.x = e.clientX;
      mousePosRef.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(updatePupils);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enableEyeTracking]);

  /* ---- Blink animation handler for eyelids ---- */
  const blinkTransform = isBlinking ? 'scaleY(0.08)' : 'scaleY(1)';

  return (
    <div
      className={`ai-avatar-container ${excited ? 'excited-container' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background glow */}
      <div
        className={`ai-avatar-glow ${excited ? 'breathing-glow' : ''}`}
        style={{
          position: 'absolute',
          width: size * 1.5,
          height: size * 1.5,
          borderRadius: '50%',
          background: excited
            ? 'radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, rgba(0, 240, 255, 0.08) 40%, transparent 70%)'
            : 'radial-gradient(circle, var(--glow-color, rgba(0, 240, 255, 0.15)) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(4px)',
          opacity: excited ? 0.7 : 0.6,
        }}
      />

      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={`ai-avatar-svg ${excited ? 'excited' : ''}`}
        style={{
          overflow: 'visible',
          position: 'relative',
          zIndex: 1,
        }}
        aria-label="AI Assistant Avatar"
        role="img"
      >
        <defs>
          {/* Body gradient - cyan/teal robot body */}
          <linearGradient id={bodyGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0e7490" />
            <stop offset="40%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#155e75" />
          </linearGradient>

          {/* Body highlight gradient for glossy effect */}
          <linearGradient id={bodyHighlightId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="35%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
          </linearGradient>

          {/* Visor gradient - dark, slightly tinted */}
          <linearGradient id={visorGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="50%" stopColor="#0c1a2e" />
            <stop offset="100%" stopColor="#081422" />
          </linearGradient>

          {/* Chin/lower face gradient */}
          <linearGradient id={chinGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#0e7490" />
          </linearGradient>

          {/* Ear accent gradient */}
          <linearGradient id={earGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0e7490" />
            <stop offset="100%" stopColor="#155e75" />
          </linearGradient>

          {/* Eye glow filter - cyan glow */}
          <filter id={eyeGlowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0.94
                      0 0 0 0 1
                      0 0 0 0.7 0"
              result="colorBlur"
            />
            <feMerge>
              <feMergeNode in="colorBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Antenna glow filter */}
          <filter id={antennaGlowId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0.94
                      0 0 0 0 1
                      0 0 0 0.8 0"
              result="colorBlur"
            />
            <feMerge>
              <feMergeNode in="colorBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft outer glow for body - cyan tinted */}
          <filter id={bodyGlowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0.57
                      0 0 0 0 0.7
                      0 0 0 0.3 0"
              result="colorBlur"
            />
            <feMerge>
              <feMergeNode in="colorBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Eye white gradient */}
          <radialGradient id={eyeWhiteId} cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="80%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </radialGradient>

          {/* Eye iris gradient - bright cyan */}
          <radialGradient id={irisGradientId} cx="45%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="40%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </radialGradient>

          {/* Specular highlight for glossy body */}
          <radialGradient id={specularId} cx="38%" cy="22%" r="35%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* ================================================================ */}
        {/*  ANTENNA                                                         */}
        {/* ================================================================ */}
        {/* Antenna stem */}
        <line
          x1="50" y1="18" x2="50" y2="9"
          stroke="#0891b2"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Antenna base connector */}
        <ellipse cx="50" cy="18" rx="3" ry="1.5" fill="#0e7490" />
        {/* Antenna tip - glowing orb with enhanced pulse */}
        <circle cx="50" cy="7" r="3.5" fill="#00f0ff" filter={`url(#${antennaGlowId})`}>
          <animate
            attributeName="r"
            values="3.5;4.5;3.5"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.7;1;0.7"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="50" cy="7" r="2" fill="#67e8f9">
          <animate
            attributeName="r"
            values="2;2.8;2"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="49" cy="5.5" r="0.8" fill="rgba(255,255,255,0.7)" />

        {/* ================================================================ */}
        {/*  EAR ACCENTS                                                     */}
        {/* ================================================================ */}
        {/* Left ear */}
        <rect x="15" y="38" width="7" height="18" rx="3.5" fill={`url(#${earGradientId})`} />
        <rect x="16" y="40" width="2" height="4" rx="1" fill="#22d3ee" opacity="0.5" />
        <rect x="16" y="48" width="2" height="4" rx="1" fill="#22d3ee" opacity="0.3" />

        {/* Right ear */}
        <rect x="78" y="38" width="7" height="18" rx="3.5" fill={`url(#${earGradientId})`} />
        <rect x="82" y="40" width="2" height="4" rx="1" fill="#22d3ee" opacity="0.5" />
        <rect x="82" y="48" width="2" height="4" rx="1" fill="#22d3ee" opacity="0.3" />

        {/* ================================================================ */}
        {/*  HEAD / HELMET - Dome shape with wider jaw                       */}
        {/* ================================================================ */}
        {/* Main head shape - dome top, wider at jaw */}
        <path
          d="M 24 68
             C 22 60 20 48 21 36
             C 22 26 30 18 40 16
             Q 50 14 60 16
             C 70 18 78 26 79 36
             C 80 48 78 60 76 68
             Q 50 73 24 68 Z"
          fill={`url(#${bodyGradientId})`}
          filter={`url(#${bodyGlowId})`}
        />

        {/* Glossy highlight overlay on head */}
        <path
          d="M 24 68
             C 22 60 20 48 21 36
             C 22 26 30 18 40 16
             Q 50 14 60 16
             C 70 18 78 26 79 36
             C 80 48 78 60 76 68
             Q 50 73 24 68 Z"
          fill={`url(#${bodyHighlightId})`}
        />

        {/* Specular highlight on dome */}
        <path
          d="M 24 68
             C 22 60 20 48 21 36
             C 22 26 30 18 40 16
             Q 50 14 60 16
             C 70 18 78 26 79 36
             C 80 48 78 60 76 68
             Q 50 73 24 68 Z"
          fill={`url(#${specularId})`}
        />

        {/* Head rim / edge highlight */}
        <path
          d="M 30 66
             C 28 58 26 48 27 38
             C 28 30 34 22 42 19
             Q 50 17 58 19
             C 66 22 72 30 73 38
             C 74 48 72 58 70 66"
          fill="none"
          stroke="rgba(34, 211, 238, 0.2)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* ================================================================ */}
        {/*  VISOR / FACE PLATE - Dark band across eye area                  */}
        {/* ================================================================ */}
        {/* Visor shadow behind */}
        <path
          d="M 27 36
             C 27 33 32 31 50 31
             C 68 31 73 33 73 36
             L 73 56
             C 73 59 68 61 50 61
             C 32 61 27 59 27 56 Z"
          fill="rgba(0,0,0,0.3)"
          transform="translate(0, 1)"
        />

        {/* Main visor shape */}
        <path
          d="M 27 36
             C 27 33 32 31 50 31
             C 68 31 73 33 73 36
             L 73 56
             C 73 59 68 61 50 61
             C 32 61 27 59 27 56 Z"
          fill={`url(#${visorGradientId})`}
        />

        {/* Visor top edge highlight - cyan line */}
        <path
          d="M 30 34
             C 30 32 35 30 50 30
             C 65 30 70 32 70 34"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="0.6"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Visor bottom edge highlight */}
        <path
          d="M 30 58
             C 30 60 35 62 50 62
             C 65 62 70 60 70 58"
          fill="none"
          stroke="rgba(34, 211, 238, 0.3)"
          strokeWidth="0.5"
          strokeLinecap="round"
        />

        {/* Visor inner reflection */}
        <path
          d="M 32 35
             C 32 33 38 32 50 32
             C 62 32 68 33 68 35
             L 68 42
             C 68 43 62 44 50 44
             C 38 44 32 43 32 42 Z"
          fill="rgba(255,255,255,0.03)"
        />

        {/* ================================================================ */}
        {/*  EYES - Large, expressive, with cyan glow                        */}
        {/* ================================================================ */}
        {/* ---- Left Eye ---- */}
        <g>
          {/* Eye socket shadow */}
          <ellipse cx={LEFT_EYE_CENTER.x} cy={LEFT_EYE_CENTER.y + 0.5} rx="11" ry="10.5" fill="rgba(0,0,0,0.2)" />

          {/* Eye white */}
          <ellipse cx={LEFT_EYE_CENTER.x} cy={LEFT_EYE_CENTER.y} rx="10.5" ry="10" fill={`url(#${eyeWhiteId})`} />

          {/* Iris - with cyan glow */}
          <circle cx={LEFT_EYE_CENTER.x} cy={LEFT_EYE_CENTER.y} r="6.5" fill={`url(#${irisGradientId})`} filter={`url(#${eyeGlowId})`} />

          {/* Pupil - moved by eye tracking */}
          <circle
            ref={leftPupilRef}
            cx={LEFT_EYE_CENTER.x}
            cy={LEFT_EYE_CENTER.y}
            r="3"
            fill="#0c1222"
          />

          {/* Eye highlight / sparkle - main */}
          <circle cx={LEFT_EYE_CENTER.x - 2.5} cy={LEFT_EYE_CENTER.y - 2.5} r="1.8" fill="rgba(255,255,255,0.85)" />
          {/* Eye highlight - secondary */}
          <circle cx={LEFT_EYE_CENTER.x + 2} cy={LEFT_EYE_CENTER.y + 1.5} r="0.9" fill="rgba(255,255,255,0.4)" />

          {/* Eyelid for blinking - matches visor color */}
          {enableBlinking && (
            <ellipse
              cx={LEFT_EYE_CENTER.x}
              cy={LEFT_EYE_CENTER.y}
              rx="11"
              ry="10.5"
              fill={`url(#${visorGradientId})`}
              style={{
                transform: blinkTransform,
                transformOrigin: `${LEFT_EYE_CENTER.x}px ${LEFT_EYE_CENTER.y}px`,
                transition: isBlinking ? 'transform 0.08s ease-in' : 'transform 0.05s ease-out',
              }}
            />
          )}
        </g>

        {/* ---- Right Eye ---- */}
        <g>
          {/* Eye socket shadow */}
          <ellipse cx={RIGHT_EYE_CENTER.x} cy={RIGHT_EYE_CENTER.y + 0.5} rx="11" ry="10.5" fill="rgba(0,0,0,0.2)" />

          {/* Eye white */}
          <ellipse cx={RIGHT_EYE_CENTER.x} cy={RIGHT_EYE_CENTER.y} rx="10.5" ry="10" fill={`url(#${eyeWhiteId})`} />

          {/* Iris - with cyan glow */}
          <circle cx={RIGHT_EYE_CENTER.x} cy={RIGHT_EYE_CENTER.y} r="6.5" fill={`url(#${irisGradientId})`} filter={`url(#${eyeGlowId})`} />

          {/* Pupil - moved by eye tracking */}
          <circle
            ref={rightPupilRef}
            cx={RIGHT_EYE_CENTER.x}
            cy={RIGHT_EYE_CENTER.y}
            r="3"
            fill="#0c1222"
          />

          {/* Eye highlight / sparkle - main */}
          <circle cx={RIGHT_EYE_CENTER.x - 2.5} cy={RIGHT_EYE_CENTER.y - 2.5} r="1.8" fill="rgba(255,255,255,0.85)" />
          {/* Eye highlight - secondary */}
          <circle cx={RIGHT_EYE_CENTER.x + 2} cy={RIGHT_EYE_CENTER.y + 1.5} r="0.9" fill="rgba(255,255,255,0.4)" />

          {/* Eyelid for blinking - matches visor color */}
          {enableBlinking && (
            <ellipse
              cx={RIGHT_EYE_CENTER.x}
              cy={RIGHT_EYE_CENTER.y}
              rx="11"
              ry="10.5"
              fill={`url(#${visorGradientId})`}
              style={{
                transform: blinkTransform,
                transformOrigin: `${RIGHT_EYE_CENTER.x}px ${RIGHT_EYE_CENTER.y}px`,
                transition: isBlinking ? 'transform 0.08s ease-in' : 'transform 0.05s ease-out',
              }}
            />
          )}
        </g>

        {/* ================================================================ */}
        {/*  CHIN / MOUTH AREA                                               */}
        {/* ================================================================ */}
        {/* Subtle friendly mouth curve */}
        <path
          d="M 40 60 Q 50 65 60 60"
          fill="none"
          stroke="rgba(34, 211, 238, 0.25)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* Chin accent - small chevron lines */}
        <path
          d="M 44 65 L 50 67 L 56 65"
          fill="none"
          stroke="rgba(34, 211, 238, 0.15)"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ================================================================ */}
        {/*  BODY / TORSO - Wider at bottom, connected to head               */}
        {/* ================================================================ */}
        {/* Neck connector */}
        <path
          d="M 36 68 L 34 72 L 66 72 L 64 68 Z"
          fill="#0e7490"
        />

        {/* Main body shape - tapered torso */}
        <path
          d="M 30 72
             L 24 92
             C 24 96 34 99 50 99
             C 66 99 76 96 76 92
             L 70 72 Z"
          fill={`url(#${bodyGradientId})`}
        />

        {/* Body glossy overlay */}
        <path
          d="M 30 72
             L 24 92
             C 24 96 34 99 50 99
             C 66 99 76 96 76 92
             L 70 72 Z"
          fill="rgba(255,255,255,0.06)"
        />

        {/* Chest plate accent */}
        <path
          d="M 38 76 L 36 90 C 36 93 42 95 50 95 C 58 95 64 93 64 90 L 62 76 Z"
          fill="rgba(0,0,0,0.1)"
        />

        {/* Chest core - glowing cyan circle with dramatic pulse */}
        <circle cx="50" cy="84" r="4" fill="#0c1a2e" />
        <circle cx="50" cy="84" r="2.5" fill="#22d3ee" opacity="0.6">
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="50" cy="84" r="1.2" fill="#67e8f9">
          <animate
            attributeName="r"
            values="1.2;2;1.2"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Core glow ring */}
        <circle cx="50" cy="84" r="5" fill="none" stroke="#22d3ee" strokeWidth="0.4" opacity="0.3">
          <animate
            attributeName="r"
            values="5;7;5"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.1;0.3"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Chest panel lines */}
        <line x1="42" y1="78" x2="42" y2="88" stroke="rgba(34, 211, 238, 0.12)" strokeWidth="0.4" />
        <line x1="58" y1="78" x2="58" y2="88" stroke="rgba(34, 211, 238, 0.12)" strokeWidth="0.4" />

        {/* Body side accents */}
        <path
          d="M 30 76 L 28 88"
          stroke="rgba(34, 211, 238, 0.15)"
          strokeWidth="0.5"
          strokeLinecap="round"
        />
        <path
          d="M 70 76 L 72 88"
          stroke="rgba(34, 211, 238, 0.15)"
          strokeWidth="0.5"
          strokeLinecap="round"
        />

        {/* Shoulder accent dots */}
        <circle cx="32" cy="74" r="1.2" fill="#22d3ee" opacity="0.4" />
        <circle cx="68" cy="74" r="1.2" fill="#22d3ee" opacity="0.4" />
      </svg>

      {/* Inline styles for floating animation */}
      <style>{`
        @keyframes ai-avatar-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          25% { transform: translateY(-2px) scale(1.01); }
          50% { transform: translateY(-4px) scale(1.02); }
          75% { transform: translateY(-1px) scale(1.005); }
        }

        @keyframes ai-avatar-body-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }

        @keyframes ai-avatar-antenna-glow {
          0%, 100% { opacity: 0.7; r: 3.5; }
          30% { opacity: 1; r: 4.5; }
          60% { opacity: 0.85; r: 3.8; }
        }

        @keyframes ai-avatar-core-glow {
          0%, 100% { opacity: 0.6; r: 2.5; }
          50% { opacity: 1; r: 3.2; }
        }

        @keyframes ai-avatar-excited {
          0%, 100% { transform: translateY(0px) scale(1); }
          15% { transform: translateY(-5px) scale(1.03); }
          30% { transform: translateY(-2px) scale(1.01); }
          45% { transform: translateY(-6px) scale(1.04); }
          60% { transform: translateY(-1px) scale(1); }
          75% { transform: translateY(-3px) scale(1.02); }
          90% { transform: translateY(-1px) scale(1); }
        }

        /* Breathing animation when chatbot is open */
        @keyframes ai-avatar-breathe {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.15));
          }
          35% {
            transform: scale(1.04);
            filter: drop-shadow(0 0 12px rgba(0, 240, 255, 0.35));
          }
          65% {
            transform: scale(1.02);
            filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.25));
          }
        }

        /* Container breathing glow when excited */
        @keyframes ai-avatar-container-breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        .ai-avatar-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: filter 0.3s ease;
        }

        .ai-avatar-container.excited-container {
          animation: ai-avatar-container-breathe 3s ease-in-out infinite;
        }

        .ai-avatar-glow {
          position: absolute;
          pointer-events: none;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .ai-avatar-glow.breathing-glow {
          animation: ai-avatar-glow-breathe 3s ease-in-out infinite;
        }

        @keyframes ai-avatar-glow-breathe {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.15);
          }
        }

        .ai-avatar-svg {
          overflow: visible;
          will-change: transform;
          animation: ai-avatar-float 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }

        .ai-avatar-svg.excited {
          animation: ai-avatar-breathe 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
