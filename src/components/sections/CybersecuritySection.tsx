"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import {
  Shield,
  Bug,
  Fingerprint,
  ShieldAlert,
  Network,
  Monitor,
  Radar,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const capabilities = [
  {
    title: "VAPT",
    icon: Bug,
    description:
      "Comprehensive vulnerability assessment and penetration testing to fortify your digital perimeter.",
  },
  {
    title: "Digital Forensics",
    icon: Fingerprint,
    description:
      "Advanced forensic investigation and evidence analysis for incident response and legal proceedings.",
  },
  {
    title: "Malware Analysis",
    icon: ShieldAlert,
    description:
      "Deep malware analysis and reverse engineering to understand and neutralize sophisticated threats.",
  },
  {
    title: "Network Security",
    icon: Network,
    description:
      "Enterprise network protection with real-time monitoring, firewalls, and intrusion detection systems.",
  },
  {
    title: "Security Audits",
    icon: Monitor,
    description:
      "Comprehensive security audits and compliance assessments to identify gaps and ensure adherence to industry standards.",
  },
  {
    title: "Threat Intelligence",
    icon: Radar,
    description:
      "Proactive threat intelligence gathering and analysis to stay ahead of emerging cyber threats.",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "< 15min", label: "Response" },
  { value: "24/7", label: "Monitoring" },
  { value: "Zero-Trust", label: "Architecture" },
];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ThreatType = "virus" | "worm" | "hacker";
type ThreatStatus = "active" | "destroying" | "destroyed";

interface Threat {
  id: number;
  angle: number;
  distance: number;
  type: ThreatType;
  status: ThreatStatus;
  spawnTime: number;
}

interface DetectionRing {
  id: number;
  time: number;
}

interface StatusMessage {
  text: string;
  type: "scan" | "detect" | "neutralize" | "secure";
  time: number;
}

/* ------------------------------------------------------------------ */
/*  Threat Visual Config                                               */
/* ------------------------------------------------------------------ */

const THREAT_CONFIG: Record<
  ThreatType,
  { bg: string; shadow: string; glow: string; label: string; symbol: string }
> = {
  virus: {
    bg: "#ff3366",
    shadow: "rgba(255,51,102,0.6)",
    glow: "rgba(255,51,102,0.3)",
    label: "VIRUS NEUTRALIZED",
    symbol: "V",
  },
  worm: {
    bg: "#ff8c00",
    shadow: "rgba(255,140,0,0.6)",
    glow: "rgba(255,140,0,0.3)",
    label: "WORM DESTROYED",
    symbol: "W",
  },
  hacker: {
    bg: "#ff4444",
    shadow: "rgba(255,68,68,0.6)",
    glow: "rgba(255,68,68,0.3)",
    label: "HACKER BLOCKED",
    symbol: "H",
  },
};

/* ------------------------------------------------------------------ */
/*  Ambient node positions (constant, decorative)                      */
/* ------------------------------------------------------------------ */

const AMBIENT_NODES = [0, 60, 120, 180, 240, 300].map((angle) => ({
  angle,
  distance: 0.48,
}));

/* ------------------------------------------------------------------ */
/*  Detection Blips - random radar blips that appear and fade          */
/* ------------------------------------------------------------------ */

interface Blip {
  id: number;
  angle: number;
  distance: number;
  createdAt: number;
  duration: number;
}

function DetectionBlips({ angleToXY }: { angleToXY: (angle: number, distance: number) => { x: number; y: number } }) {
  const [blips, setBlips] = useState<Blip[]>([]);
  const nextBlipId = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const interval = setInterval(() => {
      if (!mountedRef.current) return;
      const id = nextBlipId.current++;
      const angle = Math.random() * 360;
      const distance = 0.2 + Math.random() * 0.65;
      const duration = 800 + Math.random() * 1200;
      setBlips((prev) => [...prev, { id, angle, distance, createdAt: Date.now(), duration }]);
      setTimeout(() => {
        if (!mountedRef.current) return;
        setBlips((prev) => prev.filter((b) => b.id !== id));
      }, duration);
    }, 1200 + Math.random() * 800);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {blips.map((blip) => {
        const pos = angleToXY(blip.angle, blip.distance);
        return (
          <div
            key={`blip-${blip.id}`}
            className="absolute rounded-full"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: 4,
              height: 4,
              background: "var(--primary)",
              boxShadow: "0 0 6px var(--primary), 0 0 12px var(--glow-color)",
              animation: `blip-appear ${blip.duration}ms ease-out forwards`,
              willChange: "transform, opacity",
            }}
            aria-hidden="true"
          />
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Cyber Defense Animation                                            */
/* ------------------------------------------------------------------ */

function CyberDefenseAnimation() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [detectionRings, setDetectionRings] = useState<DetectionRing[]>([]);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({
    text: "SCANNING...",
    type: "scan",
    time: 0,
  });
  const [shieldFlash, setShieldFlash] = useState(false);
  const [sweepAngleDisplay, setSweepAngleDisplay] = useState(0);

  const startTimeRef = useRef(performance.now());
  const nextThreatId = useRef(0);
  const nextRingId = useRef(0);
  const pendingTimeouts = useRef<number[]>([]);
  const mountedRef = useRef(true);

  const SWEEP_PERIOD = 4000;
  const THREAT_SPAWN_INTERVAL = 2200;
  const MAX_ACTIVE_THREATS = 6;

  // Convert angle + normalized distance to percentage position
  const angleToXY = useCallback(
    (angle: number, distance: number) => {
      const rad = ((angle - 90) * Math.PI) / 180;
      return {
        x: 50 + distance * 50 * Math.cos(rad),
        y: 50 + distance * 50 * Math.sin(rad),
      };
    },
    []
  );

  // Update sweep angle display periodically
  useEffect(() => {
    let rafId: number;
    const update = () => {
      if (!mountedRef.current) return;
      const elapsed = performance.now() - startTimeRef.current;
      const angle = ((elapsed % SWEEP_PERIOD) / SWEEP_PERIOD) * 360;
      setSweepAngleDisplay(Math.round(angle));
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Spawn threats at intervals
  useEffect(() => {
    mountedRef.current = true;

    const spawnThreat = () => {
      if (!mountedRef.current) return;

      const elapsed = performance.now() - startTimeRef.current;
      const currentAngle = ((elapsed % SWEEP_PERIOD) / SWEEP_PERIOD) * 360;
      // Spawn at least 100° ahead of sweep so there's visible travel time
      const angle = (currentAngle + 100 + Math.random() * 220) % 360;
      // Distance from center: 0.6 to 0.9 (outer area)
      const distance = 0.6 + Math.random() * 0.3;
      const types: ThreatType[] = ["virus", "worm", "hacker"];
      const type = types[Math.floor(Math.random() * types.length)];
      const id = nextThreatId.current++;

      setThreats((prev) => {
        const activeCount = prev.filter((t) => t.status === "active").length;
        if (activeCount >= MAX_ACTIVE_THREATS) return prev;
        return [
          ...prev,
          {
            id,
            angle,
            distance,
            type,
            status: "active",
            spawnTime: performance.now(),
          },
        ];
      });

      // Calculate time until sweep reaches this threat
      const angleDiff = ((angle - currentAngle) % 360 + 360) % 360;
      const timeToDestroy = (angleDiff / 360) * SWEEP_PERIOD;

      // Set timeout to destroy when sweep passes
      const destroyTimeout = window.setTimeout(() => {
        if (!mountedRef.current) return;

        setThreats((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, status: "destroying" } : t
          )
        );

        // Create detection ring from center
        const ringId = nextRingId.current++;
        setDetectionRings((prev) => [...prev, { id: ringId, time: Date.now() }]);

        // Flash the shield
        setShieldFlash(true);
        window.setTimeout(() => {
          if (mountedRef.current) setShieldFlash(false);
        }, 300);

        // Set status to neutralize message
        const config = THREAT_CONFIG[type];
        setStatusMessage({
          text: config.label,
          type: "neutralize",
          time: Date.now(),
        });

        // After explosion animation, remove threat
        window.setTimeout(() => {
          if (!mountedRef.current) return;
          setThreats((prev) =>
            prev.map((t) =>
              t.id === id ? { ...t, status: "destroyed" } : t
            )
          );
        }, 700);

        // Return to scanning status
        window.setTimeout(() => {
          if (!mountedRef.current) return;
          setStatusMessage({
            text: "SYSTEM SECURE",
            type: "secure",
            time: Date.now(),
          });
          window.setTimeout(() => {
            if (!mountedRef.current) return;
            setStatusMessage({
              text: "SCANNING...",
              type: "scan",
              time: Date.now(),
            });
          }, 1200);
        }, 1500);
      }, timeToDestroy);

      pendingTimeouts.current.push(destroyTimeout);
    };

    // Initial spawn
    const initialDelay = window.setTimeout(spawnThreat, 600);
    pendingTimeouts.current.push(initialDelay);

    const interval = setInterval(spawnThreat, THREAT_SPAWN_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      pendingTimeouts.current.forEach((t) => window.clearTimeout(t));
      pendingTimeouts.current = [];
    };
  }, [angleToXY]);

  // Cleanup old detection rings and destroyed threats
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setDetectionRings((prev) => prev.filter((r) => now - r.time < 2000));
      setThreats((prev) => prev.filter((t) => t.status !== "destroyed"));
    }, 800);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="relative mx-auto w-72 h-72 sm:w-80 sm:h-80 md:w-[448px] md:h-[448px] select-none">
      {/* ── Inline Keyframes ── */}
      <style>{`
        @keyframes radar-sweep-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes threat-breathe {
          0%, 100% { opacity: 0.75; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes threat-pulse-ring {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        @keyframes threat-explode-main {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; filter: brightness(1); }
          20% { transform: translate(-50%, -50%) scale(1.8); opacity: 1; filter: brightness(2); }
          100% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; filter: brightness(3); }
        }
        @keyframes detection-ring-expand {
          0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        @keyframes center-ring-expand {
          0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0.7; border-width: 2px; }
          50% { opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; border-width: 0.5px; }
        }
        @keyframes shield-glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px var(--glow-color), 0 0 40px var(--glow-color),
                        inset 0 0 15px rgba(0, 240, 255, 0.05);
          }
          50% {
            box-shadow: 0 0 35px var(--glow-color), 0 0 70px var(--glow-color),
                        0 0 100px rgba(0, 240, 255, 0.05),
                        inset 0 0 25px rgba(0, 240, 255, 0.08);
          }
        }
        @keyframes shield-flash {
          0% { box-shadow: 0 0 40px var(--primary), 0 0 80px var(--primary), 0 0 120px var(--glow-color); }
          100% { box-shadow: 0 0 20px var(--glow-color), 0 0 40px var(--glow-color); }
        }
        @keyframes connection-line-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.4; }
        }
        @keyframes ambient-dot-pulse {
          0%, 100% { opacity: 0.3; box-shadow: 0 0 4px var(--glow-color); }
          50% { opacity: 0.7; box-shadow: 0 0 8px var(--glow-color), 0 0 16px var(--glow-color); }
        }
        @keyframes status-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes ring-pulse-soft {
          0%, 100% { opacity: 0.12; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.01); }
        }
        @keyframes concentric-ring-glow {
          0%, 100% { box-shadow: 0 0 4px var(--glow-color), inset 0 0 4px var(--glow-color); opacity: 0.15; }
          50% { box-shadow: 0 0 12px var(--glow-color), 0 0 24px rgba(0, 240, 255, 0.05), inset 0 0 8px var(--glow-color); opacity: 0.45; }
        }
        @keyframes blip-appear {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          30% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          60% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        }
        @keyframes sweep-glow-trail {
          0% { opacity: 0; }
          50% { opacity: 0.6; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* ── Concentric Rings with glow ── */}
      <div className="absolute inset-0" aria-hidden="true">
        {[0.3, 0.5, 0.7, 0.9].map((scale, i) => (
          <div
            key={`ring-${i}`}
            className="absolute rounded-full"
            style={{
              top: `${50 - scale * 50}%`,
              left: `${50 - scale * 50}%`,
              width: `${scale * 100}%`,
              height: `${scale * 100}%`,
              border: `${i === 3 ? 1.5 : 1}px solid var(--glow-color)`,
              animation: `concentric-ring-glow ${3 + i * 0.7}s ease-in-out ${
                i * 0.4
              }s infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Detection Blips (random appearing/fading dots) ── */}
      <DetectionBlips angleToXY={angleToXY} />

      {/* ── Crosshair Lines (SVG) ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <line
          x1="50"
          y1="5"
          x2="50"
          y2="95"
          stroke="var(--glow-color)"
          strokeWidth="0.2"
          strokeDasharray="1.5 1.5"
          opacity="0.4"
        />
        <line
          x1="5"
          y1="50"
          x2="95"
          y2="50"
          stroke="var(--glow-color)"
          strokeWidth="0.2"
          strokeDasharray="1.5 1.5"
          opacity="0.4"
        />
        <line
          x1="15"
          y1="15"
          x2="85"
          y2="85"
          stroke="var(--glow-color)"
          strokeWidth="0.15"
          strokeDasharray="1.5 2"
          opacity="0.25"
        />
        <line
          x1="85"
          y1="15"
          x2="15"
          y2="85"
          stroke="var(--glow-color)"
          strokeWidth="0.15"
          strokeDasharray="1.5 2"
          opacity="0.25"
        />
      </svg>

      {/* ── Radar Sweep (rotating conic gradient) ── */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          animation: "radar-sweep-rotate 4s linear infinite",
          willChange: "transform",
        }}
        aria-hidden="true"
      >
        {/* Sweep cone - trailing fade with enhanced gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(
              from 0deg,
              transparent 0deg,
              transparent 250deg,
              rgba(0, 240, 255, 0.02) 280deg,
              rgba(0, 240, 255, 0.05) 300deg,
              var(--glow-color) 320deg,
              rgba(0, 240, 255, 0.1) 340deg,
              rgba(0, 240, 255, 0.2) 350deg,
              rgba(0, 240, 255, 0.35) 356deg,
              rgba(0, 240, 255, 0.5) 359deg,
              transparent 360deg
            )`,
          }}
        />
        {/* Leading edge line with stronger glow */}
        <div
          className="absolute rounded-full"
          style={{
            top: "50%",
            left: "50%",
            width: "48%",
            height: "2px",
            transformOrigin: "0 50%",
            background:
              "linear-gradient(to right, var(--primary), rgba(0, 240, 255, 0.5), transparent)",
            boxShadow:
              "0 0 8px var(--primary), 0 0 16px var(--glow-color), 0 0 32px rgba(0, 240, 255, 0.1)",
          }}
        />
        {/* Sweep glow trail dot at the edge */}
        <div
          className="absolute rounded-full"
          style={{
            top: "4%",
            left: "50%",
            width: "6px",
            height: "6px",
            transform: "translate(-50%, -50%)",
            background: "var(--primary)",
            boxShadow: "0 0 12px var(--primary), 0 0 24px var(--glow-color)",
            animation: "sweep-glow-trail 0.8s ease-in-out infinite",
          }}
        />
      </div>

      {/* ── Outer rotating ring with enhanced glow ── */}
      <div
        className="absolute inset-0 rounded-full animate-spin-slow"
        style={{
          border: "1px solid rgba(0, 240, 255, 0.08)",
          boxShadow: "0 0 8px var(--glow-color), inset 0 0 8px var(--glow-color)",
          willChange: "transform",
        }}
        aria-hidden="true"
      />

      {/* ── Ambient Nodes (decorative dots on middle ring) ── */}
      {AMBIENT_NODES.map((node, i) => {
        const pos = angleToXY(node.angle, node.distance);
        return (
          <div
            key={`ambient-${i}`}
            className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary/50"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
              animation: `ambient-dot-pulse ${2.5 + i * 0.3}s ease-in-out ${
                i * 0.2
              }s infinite`,
              willChange: "opacity, box-shadow",
            }}
            aria-hidden="true"
          />
        );
      })}

      {/* ── Attack Vector Lines (from active threats to center) ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        {threats
          .filter((t) => t.status === "active")
          .map((t) => {
            const pos = angleToXY(t.angle, t.distance);
            const config = THREAT_CONFIG[t.type];
            return (
              <line
                key={`line-${t.id}`}
                x1={pos.x}
                y1={pos.y}
                x2="50"
                y2="50"
                stroke={config.bg}
                strokeWidth="0.15"
                strokeDasharray="1 2"
                style={{
                  opacity: 0.3,
                  animation:
                    "connection-line-pulse 1.5s ease-in-out infinite",
                }}
              />
            );
          })}
      </svg>

      {/* ── Threat Particles ── */}
      {threats
        .filter((t) => t.status !== "destroyed")
        .map((threat) => {
          const pos = angleToXY(threat.angle, threat.distance);
          const config = THREAT_CONFIG[threat.type];
          const isDestroying = threat.status === "destroying";

          return (
            <div key={`threat-${threat.id}`}>
              {/* Threat dot with pulse ring */}
              <div
                className="absolute rounded-full"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: isDestroying ? 22 : 12,
                  height: isDestroying ? 22 : 12,
                  transform: "translate(-50%, -50%)",
                  animation: isDestroying
                    ? "threat-explode-main 0.6s ease-out forwards"
                    : `threat-breathe ${1.2 + (threat.id % 3) * 0.3}s ease-in-out infinite`,
                  backgroundColor: config.bg,
                  boxShadow: isDestroying
                    ? `0 0 24px ${config.shadow}, 0 0 48px ${config.glow}`
                    : `0 0 8px ${config.shadow}, 0 0 16px ${config.glow}`,
                  zIndex: 15,
                  willChange: "transform, opacity",
                }}
              >
                {/* Type label */}
                <span
                  className="absolute inset-0 flex items-center justify-center font-bold text-white"
                  style={{
                    fontSize: isDestroying ? 10 : 7,
                    opacity: isDestroying ? 0 : 0.9,
                    transition: "opacity 0.15s",
                  }}
                >
                  {config.symbol}
                </span>
              </div>

              {/* Pulsing ring around active threats */}
              {!isDestroying && (
                <div
                  className="absolute rounded-full"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: 24,
                    height: 24,
                    border: `1px solid ${config.bg}`,
                    animation: `threat-pulse-ring ${1.5 + (threat.id % 2) * 0.5}s ease-out infinite`,
                    zIndex: 14,
                    willChange: "transform, opacity",
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Threat type mini-label (shown briefly when active) */}
              {threat.status === "active" && (
                <div
                  className="absolute font-mono tracking-wider"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y - 4}%`,
                    transform: "translate(-50%, -100%)",
                    fontSize: 7,
                    color: config.bg,
                    textShadow: `0 0 4px ${config.glow}`,
                    opacity: 0.7,
                    whiteSpace: "nowrap",
                    zIndex: 14,
                  }}
                >
                  {threat.type.toUpperCase()}
                </div>
              )}

              {/* Explosion ring at threat position */}
              {isDestroying && (
                <div
                  className="absolute rounded-full"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: 60,
                    height: 60,
                    border: `2px solid ${config.bg}`,
                    animation: "detection-ring-expand 0.8s ease-out forwards",
                    zIndex: 12,
                    willChange: "transform, opacity",
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}

      {/* ── Detection Rings (from center, on threat destruction) ── */}
      {detectionRings.map((ring, i) => (
        <div
          key={`det-ring-${ring.id}`}
          className="absolute rounded-full border-primary/50"
          style={{
            top: "50%",
            left: "50%",
            width: 100,
            height: 100,
            borderStyle: "solid",
            animation: `center-ring-expand 1.8s ease-out ${i * 0.1}s forwards`,
            zIndex: 5,
            willChange: "transform, opacity",
          }}
          aria-hidden="true"
        />
      ))}

      {/* ── Center Shield with enhanced glow ── */}
      <div
        className="absolute top-1/2 left-1/2 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center"
        style={{
          transform: "translate(-50%, -50%)",
          animation: shieldFlash
            ? "shield-flash 0.3s ease-out forwards"
            : "shield-glow-pulse 3s ease-in-out infinite",
          background:
            "radial-gradient(circle, var(--glow-color) 0%, rgba(0, 240, 255, 0.05) 40%, transparent 65%)",
          border: "2px solid var(--glow-color)",
          willChange: "box-shadow",
          zIndex: 20,
        }}
      >
        {/* Inner shield ring with glow */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            border: "1px solid var(--glow-color)",
            opacity: 0.5,
            boxShadow: "inset 0 0 8px var(--glow-color)",
          }}
          aria-hidden="true"
        />
        {/* Outer glow ring */}
        <div
          className="absolute -inset-1 rounded-full"
          style={{
            border: "1px solid rgba(0, 240, 255, 0.1)",
            animation: "ring-pulse-soft 2s ease-in-out infinite",
          }}
          aria-hidden="true"
        />
        <Shield
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-primary"
          style={{
            filter:
              "drop-shadow(0 0 12px var(--glow-color)) drop-shadow(0 0 24px var(--glow-color)) drop-shadow(0 0 48px rgba(0, 240, 255, 0.1))",
          }}
        />
      </div>

      {/* ── Status Indicator ── */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1">
        <div
          className="font-mono tracking-[0.2em] text-[10px] sm:text-xs font-semibold"
          style={{
            color:
              statusMessage.type === "scan"
                ? "var(--primary)"
                : statusMessage.type === "neutralize"
                ? "#ff3366"
                : statusMessage.type === "detect"
                ? "#ff8c00"
                : "#10b981",
            textShadow:
              statusMessage.type === "scan"
                ? "0 0 8px var(--glow-color)"
                : statusMessage.type === "neutralize"
                ? "0 0 8px rgba(255,51,102,0.5)"
                : statusMessage.type === "detect"
                ? "0 0 8px rgba(255,140,0,0.5)"
                : "0 0 8px rgba(16,185,129,0.5)",
            animation:
              statusMessage.type === "scan"
                ? "status-blink 2s ease-in-out infinite"
                : "none",
          }}
        >
          {statusMessage.text}
        </div>
      </div>

      {/* ── Corner threat counter ── */}
      <div
        className="absolute top-2 right-2 z-30 font-mono text-[9px] sm:text-[10px] tracking-wider text-primary/60"
        style={{ textShadow: "0 0 4px var(--glow-color)" }}
      >
        THREATS: {threats.filter((t) => t.status === "active").length}
      </div>

      {/* ── Sweep angle indicator ── */}
      <div
        className="absolute top-2 left-2 z-30 font-mono text-[9px] sm:text-[10px] tracking-wider text-primary/40"
        style={{ textShadow: "0 0 4px var(--glow-color)" }}
      >
        SCAN: {sweepAngleDisplay}°
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section Component                                                  */
/* ------------------------------------------------------------------ */

export default function CybersecuritySection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="cybersecurity"
      ref={sectionRef}
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-background"
    >
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 dot-pattern opacity-40 pointer-events-none"
        aria-hidden="true"
      />

      {/* Dual gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, rgba(255,50,80,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, var(--glow-color) 0%, transparent 50%)",
        }}
      />

      {/* Top divider */}
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ---- Header ---- */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block text-primary text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-4">
            CYBER DEFENSE
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 text-foreground"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <span className="text-gradient-cyan">Military-Grade</span>{" "}
            Cybersecurity Solutions
          </h2>
          <p className="text-foreground/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Comprehensive security posture built to protect, detect, and respond
            to the most sophisticated cyber threats targeting your organization.
          </p>
        </motion.div>

        {/* ---- Cyber Defense Animation Visual ---- */}
        <motion.div
          className="flex justify-center mb-20"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <CyberDefenseAnimation />
        </motion.div>

        {/* ---- Capabilities Grid ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-20">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.title}
                className="group glass-card p-5 sm:p-6 relative overflow-hidden hover:border-primary/20 transition-all duration-500"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                whileHover={{
                  scale: 1.02,
                }}
              >
                {/* Corner accent */}
                <div
                  className="absolute top-0 left-0 w-16 h-16 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,50,80,0.08), transparent 70%)",
                  }}
                />
                <div
                  className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    background:
                      "linear-gradient(315deg, var(--glow-color), transparent 70%)",
                  }}
                />

                <div
                  className="relative w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,50,80,0.1), var(--glow-color))",
                    border: "1px solid var(--glow-color)",
                  }}
                >
                  <Icon className="w-6 h-6 text-primary group-hover:text-foreground transition-colors duration-300" />
                </div>
                <h3
                  className="text-lg font-semibold text-foreground mb-2"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {cap.title}
                </h3>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  {cap.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ---- Stats Bar ---- */}
        <motion.div
          className="glass-card p-5 sm:p-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-2xl sm:text-3xl font-bold text-gradient-cyan mb-1"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {stat.value}
                </div>
                <div className="text-foreground/70 text-xs sm:text-sm uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ---- Trust Banner ---- */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 1 }}
        >
          <div className="inline-flex items-center gap-3 glass-card px-6 py-4">
            <Shield
              className="w-5 h-5 text-primary"
              style={{
                filter:
                  "drop-shadow(0 0 6px var(--glow-color))",
              }}
            />
            <p className="text-foreground/80 text-sm sm:text-base">
              Your security is our mission.{" "}
              <span className="text-foreground font-medium">
                Enterprise-grade protection
              </span>{" "}
              for organizations of all sizes.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
