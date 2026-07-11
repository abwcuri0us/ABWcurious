"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Download, ArrowRight } from "lucide-react";

/* ──────────── Animation Variants ──────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

/* ──────────── Component ──────────── */

export default function BrochureSection() {
  return (
    <section
      id="brochure"
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8"
    >
      {/* Section divider at top */}
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="max-w-7xl mx-auto">
        {/* ── Section Header ── */}
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
            Learn More
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Download Our{" "}
            <span className="text-gradient-cyan">Brochure</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-foreground/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Get a comprehensive overview of ABWcurious — our services,
            cybersecurity solutions, AI capabilities, education platforms, and
            the impact we&apos;re building across industries.
          </motion.p>
        </motion.div>

        {/* ── Brochure Download Card ── */}
        <motion.div
          className="max-w-2xl mx-auto"
          variants={scaleUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.a
            href="/ABWcurious-Brochure.pdf"
            download
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-8 sm:p-10 transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.08)]">
              {/* Decorative gradient blob */}
              <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* File icon with animated ring */}
                <div className="relative shrink-0">
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-primary/10"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ margin: "-8px" }}
                  />
                  <div className="relative rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 p-5 sm:p-6">
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                  </div>
                </div>

                {/* Text content */}
                <div className="flex-1 text-center sm:text-left">
                  <h3
                    className="text-xl sm:text-2xl font-bold text-foreground mb-2"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    ABWcurious Company Brochure
                  </h3>
                  <p className="text-foreground/70 text-sm sm:text-base leading-relaxed">
                    Discover our full suite of cybersecurity, AI, and education
                    solutions in detail. PDF format — ready for sharing.
                  </p>
                </div>

                {/* Download button indicator */}
                <div className="shrink-0 flex items-center gap-2 text-primary font-semibold text-sm sm:text-base group-hover:gap-3 transition-all duration-300">
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            </div>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}