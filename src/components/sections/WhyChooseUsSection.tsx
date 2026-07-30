'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, Cpu, Shield, Users, Rocket, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();

          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const stats = [
  {
    value: 50,
    label: 'Projects Delivered',
    description: 'Enterprise projects successfully deployed across diverse industries.',
    icon: FolderKanban,
  },
  {
    value: 20,
    label: 'Technologies',
    description: 'Mastery over cutting-edge technologies and frameworks.',
    icon: Cpu,
  },
  {
    value: 100,
    label: 'Security Modules',
    description: 'Proprietary security modules protecting critical infrastructure.',
    icon: Shield,
  },
  {
    value: 1000,
    label: 'Learners Trained',
    description: 'Professionals and students empowered through our education platforms.',
    icon: Users,
  },
];

const achievements = [
  {
    title: 'Enterprise-Grade',
    description: 'Battle-tested solutions trusted by organizations of all sizes',
    icon: Rocket,
  },
  {
    title: 'AI-Powered',
    description: 'Intelligent systems that learn, adapt, and evolve with your needs',
    icon: Brain,
  },
  {
    title: 'Future-Ready',
    description: 'Scalable architecture designed for tomorrow\'s challenges',
    icon: Zap,
  },
];

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({ value, label, description, icon: Icon }: (typeof stats)[0]) {
  const { count, ref } = useCountUp(value, value >= 1000 ? 2500 : 2000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className="glass-card p-5 sm:p-6 relative group hover:border-primary/20 transition-all duration-500"
    >
      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
          <Icon className="w-6 h-6" />
        </div>

        {/* Number */}
        <div ref={ref} className="mb-2">
          <span
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gradient-cyan"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            {count.toLocaleString()}
          </span>
          <span
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary/60 ml-1"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            +
          </span>
        </div>

        {/* Label */}
        <h3
          className="text-lg font-semibold text-foreground mb-2"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {label}
        </h3>

        {/* Description */}
        <p className="text-foreground/80 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Achievement Card                                                   */
/* ------------------------------------------------------------------ */
function AchievementCard({
  title,
  description,
  icon: Icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="glass-card p-5 sm:p-6 relative group overflow-hidden hover:border-primary/20 transition-all duration-500"
    >
      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
          <Icon className="w-5 h-5" />
        </div>
        <h3
          className="text-lg font-semibold text-foreground mb-2"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {title}
        </h3>
        <p className="text-foreground/80 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Section                                                       */
/* ------------------------------------------------------------------ */
export default function WhyChooseUsSection() {
  const handleGetStarted = useCallback(() => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <section id="why-us" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="section-divider absolute top-0 left-0 right-0" />

      {/* Subtle radial glow background */}
      <div className="absolute inset-0 gradient-radial-cyan pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ---- Section Header ---- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="inline-block text-sm font-semibold tracking-[0.2em] text-primary mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            WHY ABWCURIOUS
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            The Numbers That Define{' '}
            <span className="text-gradient-cyan">Our Excellence</span>
          </h2>
        </motion.div>

        {/* ---- Stats Grid ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* ---- Achievement Cards ---- */}
        <div className="mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xl font-semibold text-center mb-8 text-foreground"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            What Sets Us <span className="text-gradient-cyan">Apart</span>
          </motion.h3>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-6 overflow-x-auto pb-4 md:overflow-visible md:grid md:grid-cols-3 md:pb-0 scrollbar-thin">
            {achievements.map((ach, i) => (
              <AchievementCard key={ach.title} {...ach} index={i} />
            ))}
          </div>
        </div>

        {/* ---- CTA ---- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-foreground/80 text-lg mb-6">
            Ready to experience the <span className="text-primary font-medium">ABWcurious</span> difference?
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={handleGetStarted}
              className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:shadow-[0_0_30px_var(--glow-color)] transition-all duration-300"
              style={{ boxShadow: '0 0 15px var(--glow-color)' }}
            >
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
