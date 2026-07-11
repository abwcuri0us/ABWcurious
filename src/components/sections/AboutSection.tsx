"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Shield,
  GraduationCap,
  Brain,
  Layers,
  Cpu,
  Target,
  Eye,
} from "lucide-react";

/* ──────────── Animation Variants ──────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const timelineReveal = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ──────────── Data ──────────── */

const coreValues = [
  {
    icon: Lightbulb,
    label: "Innovation",
    desc: "Pioneering breakthrough solutions that redefine what's possible.",
  },
  {
    icon: Shield,
    label: "Cybersecurity",
    desc: "Building resilient digital fortresses for modern enterprises.",
  },
  {
    icon: GraduationCap,
    label: "Education",
    desc: "Democratizing knowledge through next-gen learning platforms.",
  },
  {
    icon: Brain,
    label: "AI Systems",
    desc: "Harnessing artificial intelligence for smarter outcomes.",
  },
  {
    icon: Layers,
    label: "Scalability",
    desc: "Designing solutions that grow seamlessly with your ambitions.",
  },
  {
    icon: Cpu,
    label: "Future Tech",
    desc: "Investing in emerging technologies that shape tomorrow.",
  },
];

const milestones = [
  { label: "Founded", desc: "ABWcurious established in Navi Mumbai" },
  { label: "First Product", desc: "Launched CyberIntelligence360" },
  { label: "Education", desc: "StudySpark and TheCodeArena launched" },
  { label: "Growing", desc: "Expanding globally with enterprise clients" },
  { label: "Future", desc: "Next-generation AI & security solutions" },
];

/* ──────────── Component ──────────── */

export default function AboutSection() {
  return (
    <section id="about" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      {/* Section divider at top */}
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="max-w-7xl mx-auto">
        {/* ── Section header ── */}
        <motion.div
          className="text-center mb-16"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p
            variants={fadeUp}
            className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-4"
          >
            Who We Are
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Building The Future,{" "}
            <span className="text-gradient-cyan">One Innovation</span> At A
            Time
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-foreground/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            ABWcurious Pvt. Ltd. is a technology-driven company on a mission to
            shape a better world through cybersecurity, artificial intelligence,
            education, and scalable digital solutions.
          </motion.p>
        </motion.div>

        {/* ── Row 1: Mission & Vision side by side ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Mission */}
          <motion.div
            variants={cardReveal}
            className="glass-card p-5 sm:p-6 relative overflow-hidden group hover:border-primary/20 transition-all duration-500"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl p-3 bg-primary/10 shrink-0">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3
                  className="text-xl font-bold mb-2 text-foreground"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Our Mission
                </h3>
                <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">
                  To empower businesses and individuals with cutting-edge
                  cybersecurity, AI-driven solutions, and transformative
                  education — making advanced technology accessible, reliable,
                  and future-ready for everyone.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            variants={cardReveal}
            className="glass-card p-5 sm:p-6 relative overflow-hidden group hover:border-primary/20 transition-all duration-500"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl p-3 bg-primary/10 shrink-0">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3
                  className="text-xl font-bold mb-2 text-foreground"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Our Vision
                </h3>
                <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">
                  To become a global leader in technology innovation — creating
                  a world where cybersecurity is impenetrable, AI augments
                  human potential, and education knows no boundaries.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Row 2: Core Values Grid ── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-20"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {coreValues.map((value) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.label}
                variants={cardReveal}
                className="glass-card p-4 sm:p-5 group cursor-default transition-all duration-300 hover:border-primary/20 hover:scale-[1.03]"
              >
                <div className="rounded-lg p-2 bg-primary/10 w-fit mb-3 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h4
                  className="text-sm font-semibold text-foreground mb-1.5"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {value.label}
                </h4>
                <p className="text-foreground/70 text-xs leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>


      </div>
    </section>
  );
}
