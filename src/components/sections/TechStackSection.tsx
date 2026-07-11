"use client";

import React from "react";
import { motion, useInView } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface TechItem {
  name: string;
  // Local SVG logo path under /public. All techs now use real local SVG logos.
  logoUrl: string;
  isNextjs?: boolean;
}

const techItems: TechItem[] = [
  { name: "React", logoUrl: "/svg-logos/react.svg" },
  { name: "Next.js", logoUrl: "/svg-logos/nextjs.svg", isNextjs: true },
  { name: "Node.js", logoUrl: "/svg-logos/nodejs.svg" },
  { name: "TypeScript", logoUrl: "/svg-logos/typescript.svg" },
  { name: "JavaScript", logoUrl: "/svg-logos/javascript.svg" },
  { name: "Python", logoUrl: "/svg-logos/python.svg" },
  { name: "Rust", logoUrl: "/svg-logos/rust.svg" },
  { name: "Go", logoUrl: "/svg-logos/golang.svg" },
  { name: "C++", logoUrl: "/svg-logos/cplusplus.svg" },
  { name: "C#", logoUrl: "/svg-logos/csharp.svg" },
  { name: "Java", logoUrl: "/svg-logos/java.svg" },
  { name: "Kotlin", logoUrl: "/svg-logos/kotlin.svg" },
  { name: "Swift", logoUrl: "/svg-logos/swift.svg" },
  { name: "Ruby", logoUrl: "/svg-logos/ruby.svg" },
  { name: "PHP", logoUrl: "/svg-logos/php.svg" },
  { name: "Lua", logoUrl: "/svg-logos/lua.svg" },
  { name: "Haskell", logoUrl: "/svg-logos/haskell.svg" },
  { name: "C", logoUrl: "/svg-logos/c.svg" },
  { name: "Bun", logoUrl: "/svg-logos/bun.svg" },
  { name: "AWS", logoUrl: "/svg-logos/aws.svg" },
  { name: "Docker", logoUrl: "/svg-logos/docker.svg" },
  { name: "Kubernetes", logoUrl: "/svg-logos/kubernetes.svg" },
  { name: "MongoDB", logoUrl: "/svg-logos/mongodb.svg" },
  { name: "PostgreSQL", logoUrl: "/svg-logos/postgresql.svg" },
];

/* ------------------------------------------------------------------ */
/*  Section Component                                                  */
/* ------------------------------------------------------------------ */

export default function TechStackSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="tech-stack"
      ref={sectionRef}
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
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block text-primary text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-4">
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

        {/* ---- Tech Grid ---- */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {techItems.map((tech, i) => (
            <motion.div
              key={tech.name}
              className="tech-card glass-card p-3 sm:p-4 lg:p-5 flex flex-col items-center gap-2 sm:gap-3 group cursor-default hover:border-primary/20 transition-[transform,border-color] duration-300 relative overflow-hidden"
              style={{ willChange: "transform" }}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.04 }}
              whileHover={{
                scale: 1.08,
                y: -4,
              }}
            >
              {/* Halo / glow behind the logo on hover (box-shadow, no filter). */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow:
                    "0 0 24px 4px var(--glow-color), 0 0 8px 2px var(--glow-color)",
                  background:
                    "radial-gradient(circle, var(--glow-color) 0%, transparent 70%)",
                }}
              />
              <img
                src={tech.logoUrl}
                alt={`${tech.name} logo`}
                width={36}
                height={36}
                className={`relative w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 object-contain transition-transform duration-300 group-hover:scale-110 ${
                  tech.isNextjs ? "nextjs-logo" : ""
                }`}
                loading="lazy"
              />
              <span
                className="relative text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 text-center"
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
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
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
