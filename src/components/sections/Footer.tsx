'use client';

import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  Mail,
  Loader2,
  MapPin,
  Phone,
  ArrowUp,
  ExternalLink,
} from 'lucide-react';

/* X (formerly Twitter) Logo SVG */
function XLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import LegalPageModal, { LegalPageType } from '@/components/LegalPageModal';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const socialLinks = [
  { icon: Github, href: 'https://github.com/orgs/ABWcurious-Pvt-Ltd', label: 'GitHub', hoverColor: '#8b949e' },
  { icon: Linkedin, href: 'https://www.linkedin.com/company/abwcurious', label: 'LinkedIn', hoverColor: '#0A66C2' },
  { icon: Instagram, href: 'https://www.instagram.com/abwcurious', label: 'Instagram', hoverColor: '#E4405F' },
  { icon: Youtube, href: 'https://www.youtube.com/@ABWcurious', label: 'YouTube', hoverColor: '#FF0000' },
  { icon: Facebook, href: 'https://www.facebook.com/people/ABWcurious/61579618321899/', label: 'Facebook', hoverColor: '#1877F2' },
  { icon: XLogo, href: 'https://x.com/abwcurious', label: 'X', hoverColor: 'var(--x-hover-color)' },
];

const quickLinks = [
  { label: 'About', href: '#about' },
  { label: 'Products', href: '#products' },
  { label: 'Services', href: '#services' },
  { label: 'Cybersecurity', href: '#cybersecurity' },
  { label: 'Tech Stack', href: '#tech-stack' },
  { label: 'Contact', href: '#contact' },
];

const serviceLinks = [
  { label: 'AI and Machine Learning', href: '#services' },
  { label: 'Electronic Security', href: '#services' },
  { label: 'Cyber Security', href: '#cybersecurity' },
  { label: 'Website Development', href: '#services' },
  { label: 'Application Development', href: '#services' },
  { label: 'IT Supports', href: '#services' },
  { label: 'Digital Marketing', href: '#services' },
  { label: 'AMC', href: '#services' },
  { label: 'Hiring & Career Guidance', href: '#services' },
];

const researchCareerLinks = [
  {
    label: 'Join Our Team',
    href: 'https://docs.google.com/forms/d/e/1FAIpQLSd6d_0Rpq0mt6UKqt9oM9eMwvoaGBZkbTpGlXshFBHFGc6G-Q/viewform?usp=dialog',
    external: true,
  },
  { label: 'Research', href: '#about', external: false },
  { label: 'Internships', href: '#about', external: false },
  { label: 'Innovation Programs', href: '#about', external: false },
];

const legalLinks: { label: string; type: LegalPageType }[] = [
  { label: 'Terms & Conditions', type: 'terms' },
  { label: 'Privacy Policy', type: 'privacy' },
  { label: 'Cookie Policy', type: 'cookies' },
  { label: 'Disclaimer', type: 'disclaimer' },
  { label: 'Refund Policy', type: 'refund' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Footer() {
  const [email, setEmail] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalType, setLegalType] = useState<LegalPageType>('terms');

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSubLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success('Subscribed! Welcome to the ABWcurious newsletter.');
        setEmail('');
      } else if (res.status === 409) {
        toast.info('This email is already subscribed.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubLoading(false);
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSocialHoverColor = (label: string) => {
    if (label === 'X') {
      // In dark mode use white, in light mode use black
      const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      return isDark ? '#FFFFFF' : '#000000';
    }
    return socialLinks.find((s) => s.label === label)?.hoverColor ?? '';
  };

  const currentYear = new Date().getFullYear();
  const foundingYear = 2023;
  const yearDisplay = currentYear === foundingYear ? `${foundingYear}` : `${foundingYear}\u2013${currentYear}`;

  return (
    <footer className="relative bg-background mt-auto">
      {/* Glowing line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />

      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

      {/* ======== Top Section — 4-column grid ======== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* ---- Column 1: Brand ---- */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo.svg"
                alt="ABWcurious Logo"
                width={160}
                height={160}
                className="h-32 w-32 object-contain"
                loading="lazy"
                unoptimized
              />
            </div>
            <p className="text-foreground/70 text-sm leading-relaxed mb-4">
              Shaping a better world through technology, education, and
              innovation.
            </p>
            <div className="flex items-start gap-2 text-foreground/70 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary/60" />
              <span>S-07-05, Haware's Centurion Mall, Nerul East, Sector 19A, Nerul, Navi Mumbai, Maharashtra 400706</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/70 text-sm">
              <Phone className="w-4 h-4 text-primary/60" />
              <a href="tel:+919930338504" className="hover:text-primary transition-colors">+91 9930338504</a>
            </div>
          </div>

          {/* ---- Column 2: Quick Links ---- */}
          <div>
            <h4
              className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-foreground/70 text-sm hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- Column 3: Services (now clickable) ---- */}
          <div>
            <h4
              className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Services
            </h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    onClick={(e) => handleLinkClick(e, s.href)}
                    className="text-foreground/70 text-sm hover:text-primary transition-colors duration-300"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- Column 4: Research & Careers + Newsletter ---- */}
          <div>
            <h4
              className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Research &amp; Careers
            </h4>
            <ul className="space-y-2.5 mb-5">
              {researchCareerLinks.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/70 text-sm hover:text-primary transition-colors duration-300 inline-flex items-center gap-1.5"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="text-foreground/70 text-sm hover:text-primary transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            {/* Newsletter subsection */}
            <div>
              <h5
                className="text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Stay Updated
              </h5>
              <p className="text-foreground/70 text-sm leading-relaxed mb-3">
                Get the latest insights on cybersecurity, AI, and technology
                trends.
              </p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/50 border-border focus:border-primary/50 rounded-xl h-9 text-sm"
                  />
                  <Button
                    type="submit"
                    disabled={subLoading}
                    className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold px-4 rounded-xl hover:shadow-[0_0_20px_var(--glow-color)] transition-all duration-300 flex-shrink-0 h-9"
                    style={{ boxShadow: '0 0 10px var(--glow-color)' }}
                  >
                    {subLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>

              <p className="text-foreground/60 text-xs mt-2">
                We respect your privacy.
              </p>
            </div>
          </div>
        </div>

        {/* ======== Social Links Bar ======== */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {socialLinks.map((s) => {
              const isHovered = hoveredSocial === s.label;
              const hoverColor = getSocialHoverColor(s.label);
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  onMouseEnter={() => setHoveredSocial(s.label)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center transition-all duration-300"
                  style={{
                    color: isHovered ? hoverColor : undefined,
                    borderColor: isHovered ? `${hoverColor}33` : undefined,
                  }}
                >
                  <s.icon className="w-4.5 h-4.5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* ======== Bottom Bar ======== */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col items-center gap-3">
            {/* Copyright line */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
              <p className="text-foreground/60 text-xs text-center sm:text-left">
                &copy; {yearDisplay} ABWcurious Pvt Ltd. All rights reserved.
              </p>
              <p className="text-foreground/60 text-xs text-center sm:text-right">
                Designed with 💙 for the future
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mt-1">
              {legalLinks.map((link, idx) => (
                <React.Fragment key={link.label}>
                  {idx > 0 && (
                    <span className="text-foreground/30 text-xs">·</span>
                  )}
                  <button
                    onClick={() => { setLegalType(link.type); setLegalOpen(true); }}
                    className="text-foreground/50 text-xs hover:text-foreground/80 transition-colors duration-300"
                  >
                    {link.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ======== Animated branding ======== */}
        <div className="mt-8 text-center relative">
          <motion.p
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-xs font-medium tracking-[0.3em] text-primary/30 uppercase"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Building the future
          </motion.p>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl glass flex items-center justify-center text-foreground/60 hover:text-primary hover:border-primary/20 transition-all duration-300"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legal Page Modal */}
      <LegalPageModal isOpen={legalOpen} onClose={() => setLegalOpen(false)} type={legalType} />
    </footer>
  );
}
