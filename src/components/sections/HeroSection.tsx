"use client";

import React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Shield, Brain, Rocket, ArrowRight, Zap, Globe } from "lucide-react";

/* ──────────── Animation Variants ──────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const floatCardVariants = {
  hidden: { opacity: 0, y: 60, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      delay: 1.2 + i * 0.2,
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

/* ──────────── Data ──────────── */

const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "20+", label: "Technologies" },
  { value: "100+", label: "Security Modules" },
  { value: "1000+", label: "Learners Trained" },
];

const floatingCards = [
  { icon: Shield, label: "Cyber Defense", desc: "Military-grade protection", position: "top-[18%] left-[5%] lg:left-[8%]" },
  { icon: Brain, label: "AI Powered", desc: "Intelligent automation", position: "top-[30%] right-[5%] lg:right-[8%]" },
  { icon: Rocket, label: "Innovation", desc: "Future-ready solutions", position: "bottom-[22%] left-[5%] lg:left-[10%]" },
];

/* ──────────── Morphing Shape Component ──────────── */

function MorphingShape() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.05, 0.95, 1.02, 1],
          rotate: [0, 3, -3, 1, 0],
          borderRadius: ["40% 60% 60% 40% / 60% 30% 70% 40%", "60% 40% 30% 70% / 40% 60% 60% 40%", "30% 70% 50% 50% / 50% 40% 60% 60%", "50% 50% 40% 60% / 60% 50% 50% 40%", "40% 60% 60% 40% / 60% 30% 70% 40%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: 'clamp(300px, 40vw, 600px)',
          height: 'clamp(300px, 40vw, 600px)',
          background: 'radial-gradient(ellipse at center, var(--glow-color) 0%, rgba(0, 102, 255, 0.04) 40%, transparent 70%)',
          filter: 'blur(40px)',
          opacity: 0.6,
          willChange: 'transform',
        }}
      />
    </div>
  );
}

/* ──────────── Animated Orbit Ring ──────────── */

function MiniOrbit() {
  const dots = [
    { top: '14px', left: '74px' },
    { top: '73.4px', left: '-5.4px' },
    { top: '73.4px', left: '153.4px' },
  ];

  return (
    <div className="hidden lg:block absolute top-1/2 right-[15%] -translate-y-1/2 pointer-events-none" aria-hidden="true">
      <div
        className="relative w-40 h-40 animate-spin-slow"
        style={{ willChange: 'transform' }}
      >
        <div className="absolute inset-0 rounded-full border border-primary/8" />
        {dots.map((dot, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-primary/40"
            style={{ top: dot.top, left: dot.left, animation: `orbit-dot-pulse 2s ease-in-out infinite ${i * 0.6}s` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────── Component ──────────── */

export default function HeroSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Parallax: translate background layers as the user scrolls past the hero.
  // Uses `transform: translateY()` only (GPU-friendly, no layout thrash).
  // Disabled under prefers-reduced-motion.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 120]);
  const bgYDeep = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 60]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 lg:pt-24"
      style={{ contain: "layout style paint" }}
    >
      {/* ── Background layers (parallax-wrapped, GPU-friendly) ── */}

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY, willChange: "transform" }}
        aria-hidden="true"
      >
        <MorphingShape />
        <MiniOrbit />
      </motion.div>

      {/* Radial depth overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 45%, var(--glow-color) 0%, rgba(0,102,255,0.03) 35%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Gradient vignette edges */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, var(--background) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── Main content ── */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="mb-8">
          <span className="glass-card inline-flex items-center gap-2 px-5 py-2.5 text-sm text-primary font-medium tracking-wide">
            <Globe className="w-4 h-4" />
            Cybersecurity • AI • Education • Innovation
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="leading-[1.1] mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            Shaping A Better World With
          </span>
          <span className="block text-gradient-holographic text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mt-2 mb-2">
            Technology
          </span>
          <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground/80">
            &amp; Future-Ready Solutions
          </span>
        </motion.h1>

        {/* Subheadline with typing animation */}
        <motion.div
          variants={fadeUp}
          className="max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          <p className="text-base sm:text-lg md:text-xl text-foreground/80">
            Empowering businesses and individuals through{' '}
            <span className="text-gradient-animated font-semibold">
              Cybersecurity
            </span>{' '}
            <span className="text-foreground/40">•</span>{' '}
            <span className="text-gradient-animated font-semibold" style={{ animationDelay: '0.5s' }}>
              Digital Solutions
            </span>{' '}
            <span className="text-foreground/40">•</span>{' '}
            <span className="text-gradient-animated font-semibold" style={{ animationDelay: '1s' }}>
              Learning & Careers
            </span>
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14"
        >
          <motion.a
            href="#products"
            className="btn-glow group relative inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold px-8 py-3.5 rounded-xl text-base"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Explore Solutions
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.a>

          <motion.a
            href="#contact"
            className="glass-card group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-foreground font-medium transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_var(--glow-color)]"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Zap className="w-4 h-4 text-primary" />
            Get Started
          </motion.a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className={`glass-card px-5 py-4 text-center group cursor-default hover:border-primary/20 transition-all duration-500 relative ${i < stats.length - 1 ? 'md:after:absolute md:after:right-0 md:after:top-1/2 md:after:-translate-y-1/2 md:after:h-8 md:after:w-px md:after:bg-border' : ''}`}
              variants={scaleUp}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-gradient-cyan text-2xl sm:text-3xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {stat.value}
              </div>
              <div className="text-foreground/70 text-xs sm:text-sm mt-1 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          variants={fadeUp}
          className="mt-10 flex items-center justify-center gap-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-xs sm:text-sm text-foreground/60">
            Trusted by enterprises &amp; startups worldwide
          </span>
        </motion.div>
      </motion.div>

      {/* ── Floating cards (desktop only) ── */}
      {floatingCards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            className={`hidden xl:flex absolute z-10 ${card.position} glass-card px-5 py-4 items-center gap-3 group cursor-default`}
            style={{ animationDelay: `${i * 1.2}s` }}
            custom={i}
            variants={floatCardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.08, y: -4 }}
          >
            <div className="rounded-lg p-2.5 bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground whitespace-nowrap block">
                {card.label}
              </span>
              <span className="text-xs text-foreground/70 whitespace-nowrap">
                {card.desc}
              </span>
            </div>
          </motion.div>
        );
      })}



      {/* Bottom fade to next section */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 z-[2]"
        style={{
          background: "linear-gradient(to top, var(--background), transparent)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
