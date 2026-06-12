'use client';

import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Sparkles,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const contactDetails = [
  {
    icon: Mail,
    label: 'Email',
    value: 'info@abwcurious.com',
    href: 'mailto:info@abwcurious.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 9930338504',
    href: 'tel:+919930338504',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'S-07-05, Haware's Centurion Mall,Nerul East, Sector 19A, Nerul, Navi Mumbai, Maharashtra 400706',
    href: undefined,
  },
];

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const socialLinks = [
  { icon: Github, href: 'https://github.com/orgs/ABWcurious-Pvt-Ltd', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/company/abwcurious', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://www.instagram.com/abwcurious', label: 'Instagram' },
  { icon: Youtube, href: 'https://www.youtube.com/@ABWcurious', label: 'YouTube' },
  { icon: Facebook, href: 'https://www.facebook.com/people/ABWcurious/61579618321899/', label: 'Facebook' },
  { icon: XIcon, href: 'https://x.com/abwcurious', label: 'X / Twitter' },
];

const internshipFormUrl =
  'https://docs.google.com/forms/d/e/1FAIpQLSd6d_0Rpq0mt6UKqt9oM9eMwvoaGBZkbTpGlXshFBHFGc6G-Q/viewform';

/* ------------------------------------------------------------------ */
/*  Form state type                                                    */
/* ------------------------------------------------------------------ */
interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function ContactSection() {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Please enter your name (at least 2 characters).');
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!form.subject.trim() || form.subject.trim().length < 3) {
      toast.error('Please enter a subject (at least 3 characters).');
      return;
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      toast.error('Please enter a message (at least 10 characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="contact" aria-label="Contact" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="section-divider absolute top-0 left-0 right-0" />

      {/* Background glow */}
      <div className="absolute inset-0 gradient-radial-cyan pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ---- Header ---- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <span
            className="inline-block text-sm font-semibold tracking-[0.2em] text-primary mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            GET IN TOUCH
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Let&apos;s Build Something{' '}
            <span className="text-gradient-cyan">Extraordinary</span>
          </h2>
        </motion.div>

        {/* ---- Two Column Layout ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* ======== LEFT COLUMN ======== */}
          <div className="space-y-6">
            {/* Subtitle */}
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              variants={fadeUp}
              className="text-foreground/80 text-lg leading-relaxed"
            >
              Ready to transform your business with cutting-edge technology? Our
              team is here to help.
            </motion.p>

            {/* Contact detail cards */}
            <div className="space-y-4">
              {contactDetails.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                  variants={fadeUp}
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      className="glass-card flex items-center gap-4 p-4 sm:p-5 group hover:border-primary/20 transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
                    >
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-foreground/60 uppercase tracking-wider mb-0.5 font-medium">
                          {item.label}
                        </p>
                        <p className="text-foreground font-medium text-sm">
                          {item.value}
                        </p>
                      </div>
                    </a>
                  ) : (
                    <div className="glass-card flex items-center gap-4 p-4 sm:p-5 group hover:border-primary/20 transition-all duration-500 rounded-2xl">
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-foreground/60 uppercase tracking-wider mb-0.5 font-medium">
                          {item.label}
                        </p>
                        <p className="text-foreground font-medium text-sm">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Internship CTA */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              variants={fadeUp}
              className="glass-card p-5 sm:p-6 relative overflow-hidden hover:border-primary/20 transition-all duration-500"
            >
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
                style={{
                  padding: "1px",
                  background:
                    "linear-gradient(135deg, var(--glow-color), rgba(0,102,255,0.15), rgba(124,58,237,0.1), var(--glow-color))",
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3
                    className="text-lg font-semibold text-foreground"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    Join Our Internship &amp; Innovation Programs
                  </h3>
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed mb-4">
                  Explore hands-on learning opportunities in cybersecurity, AI,
                  full-stack development, and more. Build real-world skills with
                  mentorship from industry experts.
                </p>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <a href={internshipFormUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:shadow-[0_0_25px_var(--glow-color)] transition-all duration-300"
                      style={{ boxShadow: '0 0 12px var(--glow-color)' }}
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Apply Now
                    </Button>
                  </a>
                </motion.div>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.55 }}
              variants={fadeUp}
            >
              <p className="text-sm text-foreground/70 mb-3 font-medium">Connect with us</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-11 h-11 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/20 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <s.icon className="w-4.5 h-4.5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ======== RIGHT COLUMN – Form ======== */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            variants={fadeUp}
          >
            <div className="glass-card p-5 sm:p-6 md:p-8 h-full">
              <h3
                className="text-xl font-semibold text-foreground mb-6"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                Send us a Message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-foreground/80 mb-1.5"
                  >
                    Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="contact-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    className="bg-secondary/50 border-border focus:border-primary/50 rounded-xl"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-foreground/80 mb-1.5"
                  >
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="bg-secondary/50 border-border focus:border-primary/50 rounded-xl"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-sm font-medium text-foreground/80 mb-1.5"
                  >
                    Phone <span className="text-foreground/60">(optional)</span>
                  </label>
                  <Input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXXXXXXX"
                    className="bg-secondary/50 border-border focus:border-primary/50 rounded-xl"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-sm font-medium text-foreground/80 mb-1.5"
                  >
                    Subject <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="contact-subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                    className="bg-secondary/50 border-border focus:border-primary/50 rounded-xl"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium text-foreground/80 mb-1.5"
                  >
                    Message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project or inquiry..."
                    required
                    rows={5}
                    className="bg-secondary/50 border-border focus:border-primary/50 rounded-xl resize-none"
                  />
                </div>

                {/* Submit */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 rounded-xl hover:shadow-[0_0_25px_var(--glow-color)] transition-all duration-300"
                    style={{ boxShadow: '0 0 12px var(--glow-color)' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
