"use client";

import React from "react";

interface FuturisticGridProps {
  className?: string;
  opacity?: number;
}

export default function FuturisticGrid({
  className = "",
  opacity = 0.4,
}: FuturisticGridProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Radial fade overlay - grid fades out towards edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, var(--background) 60%, var(--background) 100%)",
          opacity: 0.7,
          zIndex: 2,
        }}
      />

      {/* Grid lines with perspective */}
      <div
        className="absolute inset-0 animate-grid-pulse"
        style={{
          opacity,
          backgroundImage: `
            linear-gradient(var(--grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: "perspective(800px) rotateX(50deg)",
          transformOrigin: "center top",
          minHeight: "150%",
          top: "-20%",
        }}
      />

      {/* Horizontal glow lines */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: "30%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, var(--glow-color), rgba(0, 102, 255, 0.1), var(--glow-color), transparent)",
          opacity: opacity * 0.6,
          zIndex: 1,
        }}
      />
      <div
        className="absolute left-0 right-0"
        style={{
          top: "60%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, var(--glow-color), transparent)",
          opacity: opacity * 0.4,
          zIndex: 1,
        }}
      />

      {/* Center vertical glow line */}
      <div
        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: "1px",
          background:
            "linear-gradient(180deg, transparent, var(--glow-color), rgba(0, 102, 255, 0.08), var(--glow-color), transparent)",
          opacity: opacity * 0.5,
          zIndex: 1,
        }}
      />

      {/* Horizon glow */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: "55%",
          height: "120px",
          background:
            "radial-gradient(ellipse at center, var(--glow-color) 0%, transparent 70%)",
          opacity: 0.6,
          zIndex: 1,
        }}
      />
    </div>
  );
}
