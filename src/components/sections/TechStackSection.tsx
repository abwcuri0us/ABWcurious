"use client";

import React from "react";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface TechItem {
  name: string;
  color: string;
  icon: React.ReactNode;
}

const techItems: TechItem[] = [
  {
    name: "React",
    color: "#61DAFB",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <circle cx="12" cy="12" r="2.5" fill="#61DAFB" />
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" />
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" strokeWidth="1.2" transform="rotate(120 12 12)" />
      </svg>
    ),
  },
  {
    name: "Next.js",
    color: "#ffffff",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <rect width="24" height="24" rx="4" fill="#000" />
        <path d="M6 18V6h1.5v9.4L17.5 6H18v12h-1.5V8.6L8.5 18H6z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "Node.js",
    color: "#5FA04E",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M12 2L3.5 7v10L12 22l8.5-5V7L12 2z" stroke="#5FA04E" strokeWidth="1.2" fill="none" />
        <path d="M12 6.5l-4 2.3v4.4l4 2.3 4-2.3V8.8l-4-2.3z" fill="#5FA04E" opacity="0.3" />
        <path d="M12 6.5v9l-4-2.3V8.8l4-2.3z" fill="#5FA04E" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: "Python",
    color: "#3776AB",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M12 2C8.5 2 7 3.5 7 5.5V8h5v1H5.5C3.5 9 2 10.5 2 13s1.5 4 3.5 4H7v-2.5C7 12 9 10 11.5 10h3C16.5 10 18 8.5 18 6.5V5.5C18 3.5 16.5 2 13 2h-1z" fill="#3776AB" />
        <path d="M12 22c3.5 0 5-1.5 5-3.5V16h-5v-1h6.5c2 0 3.5-1.5 3.5-4s-1.5-4-3.5-4H17v2.5C17 14 15 16 12.5 16h-3C9.5 16 8 17.5 8 19.5v1C8 22.5 9.5 22 13 22h-1z" fill="#FFD43B" />
        <circle cx="10" cy="5" r="1" fill="#fff" />
        <circle cx="14" cy="19" r="1" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "AWS",
    color: "#FF9900",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M2 16.5c2.5 1.5 5.5 2 8 1.5 2-.4 4-1.5 5.5-3l-1-.5c-1.5 1.5-3.5 2.5-5.5 2.5-2.5 0-5-1-7-2.5l0 2z" fill="#FF9900" />
        <path d="M17 13l1.5-4.5L20 13" stroke="#FF9900" strokeWidth="1.5" fill="none" />
        <path d="M4 13c2 3 5.5 5 9.5 5 3 0 5.5-1 7.5-3" stroke="#FF9900" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    name: "Docker",
    color: "#2496ED",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <rect x="3" y="10" width="3" height="2.5" rx="0.3" fill="#2496ED" />
        <rect x="6.5" y="10" width="3" height="2.5" rx="0.3" fill="#2496ED" />
        <rect x="10" y="10" width="3" height="2.5" rx="0.3" fill="#2496ED" />
        <rect x="6.5" y="7" width="3" height="2.5" rx="0.3" fill="#2496ED" />
        <rect x="10" y="7" width="3" height="2.5" rx="0.3" fill="#2496ED" />
        <rect x="13.5" y="10" width="3" height="2.5" rx="0.3" fill="#2496ED" />
        <path d="M3 14c1 2 4 4 8 4 5 0 9-3 10-7H2.5" stroke="#2496ED" strokeWidth="1.5" fill="none" />
        <path d="M20 9c1-1 1-2 .5-3" stroke="#2496ED" strokeWidth="1.2" fill="none" />
      </svg>
    ),
  },
  {
    name: "Kubernetes",
    color: "#326CE5",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M12 3L3 8v8l9 5 9-5V8l-9-5z" stroke="#326CE5" strokeWidth="1.2" fill="none" />
        <circle cx="12" cy="12" r="2.5" stroke="#326CE5" strokeWidth="1.2" fill="none" />
        <line x1="12" y1="3" x2="12" y2="9.5" stroke="#326CE5" strokeWidth="1" />
        <line x1="4.5" y1="16" x2="10" y2="13" stroke="#326CE5" strokeWidth="1" />
        <line x1="19.5" y1="16" x2="14" y2="13" stroke="#326CE5" strokeWidth="1" />
      </svg>
    ),
  },
  {
    name: "MongoDB",
    color: "#47A248",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M12 2c-1 2-4 5-4 10 0 3 1.5 6 4 8 2.5-2 4-5 4-8 0-5-3-8-4-10z" fill="#47A248" opacity="0.3" />
        <path d="M12 2c-1 2-4 5-4 10 0 3 1.5 6 4 8V2z" fill="#47A248" opacity="0.7" />
        <path d="M12 2v18" stroke="#47A248" strokeWidth="1" />
      </svg>
    ),
  },
  {
    name: "PostgreSQL",
    color: "#4169E1",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M8 4c-3 0-4 2-4 4 0 3 2 5 3 7 .5 1 1 3 1 4h2c0-1 .5-3 1-4 1-2 3-4 3-7 0-2-1-4-4-4" stroke="#4169E1" strokeWidth="1.2" fill="none" />
        <path d="M16 4c-3 0-4 2-4 4 0 3 2 5 3 7 .5 1 1 3 1 4h2c0-1 .5-3 1-4 1-2 3-4 3-7 0-2-1-4-4-4" stroke="#336791" strokeWidth="1.2" fill="none" />
      </svg>
    ),
  },
  {
    name: "Firebase",
    color: "#FFCA28",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M5 18l4-14 3 7-3 7H5z" fill="#FFA000" />
        <path d="M9 4l3 7 5-5-2 12h-6l3-7z" fill="#FFCA28" opacity="0.8" />
        <path d="M9 18h6l-3-7-3 7z" fill="#FF8F00" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: "TensorFlow",
    color: "#FF6F00",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <path d="M12 2L4 6v4h5v8h6v-8h5V6l-8-4z" fill="#FF6F00" opacity="0.8" />
        <path d="M4 14v4l8 4 8-4v-4" stroke="#FF6F00" strokeWidth="1.2" fill="none" />
      </svg>
    ),
  },
  {
    name: "PyTorch",
    color: "#EE4C2C",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
        <circle cx="12" cy="12" r="8" stroke="#EE4C2C" strokeWidth="1.5" fill="none" />
        <path d="M12 8v8M9 11l3-3 3 3" stroke="#EE4C2C" strokeWidth="1.5" />
        <circle cx="12" cy="16" r="1.5" fill="#EE4C2C" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Section Component                                                  */
/* ------------------------------------------------------------------ */

export default function TechStackSection() {
  return (
    <section
      id="tech-stack"
      aria-label="Tech Stack"
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Subtle radial overlay */}
      <div
        className="absolute inset-0 gradient-radial-cyan pointer-events-none"
        aria-hidden="true"
      />

      {/* Top divider */}
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ---- Header ---- */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-primary text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-4">
            OUR ARSENAL
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 text-foreground"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Powered By{" "}
            <span className="text-gradient-cyan">Cutting-Edge</span> Technology
          </h2>
          <p className="text-foreground/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            We leverage the most advanced tools and frameworks to deliver
            high-performance, scalable solutions for every challenge.
          </p>
        </motion.div>

        {/* ---- Tech Grid (All Screen Sizes) ---- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
          {techItems.map((tech, i) => (
            <motion.div
              key={tech.name}
              className="glass-card p-4 sm:p-5 flex flex-col items-center gap-3 group cursor-default hover:border-primary/20 transition-all duration-300"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{
                scale: 1.06,
                y: -4,
              }}
            >
              <div className="w-12 h-12 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                {tech.icon}
              </div>
              <span
                className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* ---- Bottom Text ---- */}
        <motion.p
          className="text-center mt-16 text-foreground/70 text-sm sm:text-base"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          And{" "}
          <span className="text-gradient-cyan font-semibold">
            many more technologies
          </span>{" "}
          in our ecosystem
        </motion.p>
      </div>
    </section>
  );
}
