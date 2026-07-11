'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Shield, Building2, Award, CheckCircle2, BadgeCheck } from 'lucide-react';

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
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const badgeReveal = {
  hidden: { opacity: 0, y: 24, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ──────────── Badge Data ──────────── */

interface RecognitionBadge {
  id: string;
  label: string;
  sublabel: string;
  description: string;
  logoSrc: string;
}

const badges: RecognitionBadge[] = [
  {
    id: 'startup-india',
    label: 'Startup India',
    sublabel: 'DPIIT Recognized',
    description:
      'Recognized under the Startup India initiative by the Department for Promotion of Industry and Internal Trade.',
    logoSrc: '/gov-startup-india.png',
  },
  {
    id: 'msme-udyam',
    label: 'MSME / Udyam',
    sublabel: 'Udyam Registered',
    description:
      'Registered under the Ministry of Micro, Small & Medium Enterprises, Government of India.',
    logoSrc: '/gov-msme-udyam.png',
  },
  {
    id: 'mca-registered',
    label: 'MCA Registered',
    sublabel: 'Company Incorporated',
    description:
      'Incorporated as a Private Limited Company under the Ministry of Corporate Affairs, Government of India.',
    logoSrc: '/gov-mca.png',
  },
];

/* ──────────── Component ──────────── */

export default function GovernmentRecognitionSection() {
  return (
    <section
      id="recognition"
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Section divider at top */}
      <div className="section-divider absolute top-0 left-0 right-0" />

      {/* Background glow orbs */}
      <div
        className="section-glow-orb absolute -top-32 -left-32 w-96 h-96"
        style={{
          background: 'radial-gradient(circle, var(--glow-color), transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div
        className="section-glow-orb absolute -bottom-32 -right-32 w-80 h-80"
        style={{
          background:
            'radial-gradient(circle, rgba(0,102,255,0.08), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ── Section Header ── */}
        <motion.div
          className="text-center mb-16 sm:mb-20"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.p
            variants={fadeUp}
            className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-4"
          >
            Trusted &amp; Verified
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5"
            style={{ fontFamily: 'var(--font-sora)' }}
          >
            Government Recognitions{' '}
            <span className="text-gradient-cyan">&amp; Compliance</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-foreground/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Building next-generation technology solutions as a Government of
            India recognized startup under the Startup India initiative.
          </motion.p>
        </motion.div>

        {/* ── Trust Badges Row ── */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12 mb-16 sm:mb-20"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {badges.map((badge, index) => {
            return (
              <React.Fragment key={badge.id}>
                <motion.div
                  variants={badgeReveal}
                  className="group relative flex flex-col items-center"
                >
                  {/* Badge Card */}
                  <div
                    className="relative w-[140px] h-[160px] sm:w-[150px] sm:h-[170px] lg:w-[160px] lg:h-[180px] glass-card flex flex-col items-center justify-center p-4 transition-all duration-500 hover:scale-[1.05] hover:border-primary/20 cursor-default"
                    style={{ willChange: 'transform' }}
                  >
                    {/* Subtle gradient border on hover */}
                    <div
                      className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        padding: '1px',
                        background:
                          'linear-gradient(135deg, var(--glow-color), rgba(0,102,255,0.2), rgba(124,58,237,0.15), var(--glow-color))',
                        WebkitMask:
                          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }}
                    />

                    {/* Real Logo Image */}
                    <div
                      className="relative mb-3 rounded-lg p-3 transition-all duration-300 group-hover:drop-shadow-[0_0_12px_var(--glow-color)]"
                      style={{ backgroundColor: '#ffffff' }}
                    >
                      <Image
                        src={badge.logoSrc}
                        alt={`${badge.label} logo`}
                        width={56}
                        height={56}
                        className="w-12 h-12 sm:w-14 sm:h-14 object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    {/* Badge Label */}
                    <p
                      className="text-sm font-semibold text-foreground text-center leading-tight mb-0.5"
                      style={{ fontFamily: 'var(--font-sora)' }}
                    >
                      {badge.label}
                    </p>
                    <p className="text-xs text-foreground/60 text-center">
                      {badge.sublabel}
                    </p>

                    {/* Verified indicator */}
                    <div className="absolute top-2.5 right-2.5">
                      <BadgeCheck className="w-4 h-4 text-primary/40 group-hover:text-primary/80 transition-colors duration-300" />
                    </div>
                  </div>
                </motion.div>

                {/* Divider between badges (not after last) */}
                {index < badges.length - 1 && (
                  <motion.div
                    variants={fadeUp}
                    className="hidden sm:block w-px h-24 self-center shrink-0"
                    style={{
                      background:
                        'linear-gradient(180deg, transparent, var(--glass-border), var(--glow-color), var(--glass-border), transparent)',
                    }}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </motion.div>

        {/* ── Compliance Statement Card ── */}
        <motion.div
          className="max-w-3xl mx-auto"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="glass-card relative p-6 sm:p-8 overflow-hidden hover:border-primary/20 transition-all duration-500">
            {/* Gradient border overlay */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                padding: '1px',
                background:
                  'linear-gradient(135deg, var(--glow-color), rgba(0,102,255,0.15), rgba(124,58,237,0.1), var(--glow-color))',
                WebkitMask:
                  'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              {/* Icon cluster */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="rounded-xl p-2.5 bg-primary/10">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="rounded-xl p-2 bg-primary/10">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="rounded-xl p-1.5 bg-primary/10">
                  <Award className="w-4 h-4 text-primary" />
                </div>
              </div>

              {/* Statement text */}
              <div className="flex-1">
                <p
                  className="text-foreground/90 text-sm sm:text-base leading-relaxed mb-3"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  A{' '}
                  <span className="text-primary font-semibold">
                    DPIIT-recognized
                  </span>{' '}
                  startup registered under{' '}
                  <span className="text-primary font-semibold">MCA</span> and{' '}
                  <span className="text-primary font-semibold">
                    MSME/Udyam
                  </span>
                  , Government of India.
                </p>

                {/* Verification pills */}
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <span
                      key={badge.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/8 text-primary/90 border border-primary/10"
                    >
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      {badge.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
