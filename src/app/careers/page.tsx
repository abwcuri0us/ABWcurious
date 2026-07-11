'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Clock, Briefcase, Rocket, BookOpen,
  Heart, TrendingUp, Users, Zap, Search, RefreshCw, X,
  ChevronDown, ChevronUp, Globe, GraduationCap, ExternalLink,
  Building2
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/date-utils';

/* ─── Types ────────────────────────────────────── */
interface CareerItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  location: string;
  jobType: string;
  department: string;
  experience: string;
  salary: string | null;
  isRemote: boolean;
  isActive: boolean;
  postedAt: string;
  closedAt: string | null;
  created_at: string;
  updated_at: string;
}

/* ─── Constants ────────────────────────────────── */
const APPLY_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd6d_0Rpq0mt6UKqt9oM9eMwvoaGBZkbTpGlXshFBHFGc6G-Q/viewform?usp=dialog';

const departmentColors: Record<string, string> = {
  Security: 'bg-red-500/10 text-red-600 dark:text-red-400',
  Engineering: 'bg-primary/10 text-primary',
  'AI & Research': 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Marketing: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Design: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  Infrastructure: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

const jobTypeIcons: Record<string, React.ElementType> = {
  'Full-time': Clock,
  'Part-time': Clock,
  'Internship': GraduationCap,
  'Contract': Briefcase,
};

const benefits = [
  { icon: Rocket, title: 'Innovation Culture', description: 'Work on cutting-edge projects in cybersecurity, AI, and emerging technologies that shape the future.' },
  { icon: BookOpen, title: 'Learning Opportunities', description: 'Access to certifications, workshops, conferences, and a dedicated learning budget to grow your skills.' },
  { icon: Clock, title: 'Flexible Work', description: 'Enjoy remote work options, flexible hours, and a healthy work-life balance that suits your lifestyle.' },
  { icon: Heart, title: 'Health Benefits', description: 'Comprehensive health insurance, wellness programs, and mental health support for you and your family.' },
  { icon: TrendingUp, title: 'Career Growth', description: 'Clear career paths, mentorship programs, and regular performance reviews to accelerate your growth.' },
  { icon: Users, title: 'Collaborative Team', description: 'Join a passionate, diverse team that values open communication, teamwork, and mutual respect.' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── Helpers ──────────────────────────────────── */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

/* ─── Component ────────────────────────────────── */
export default function CareersPage() {
  const [careers, setCareers] = useState<CareerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('limit', '50');
        if (deptFilter !== 'all') params.set('department', deptFilter);
        if (searchQuery.trim()) params.set('search', searchQuery.trim());

        const res = await fetch(`/api/careers?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch careers');
        const json = await res.json();
        if (!cancelled) setCareers(json.data || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [deptFilter, searchQuery, retryKey]);

  const departments = ['all', ...Array.from(new Set(careers.map((c) => c.department)))];

  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <a href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>

        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.svg" alt="ABWcurious Logo" width={40} height={40} className="h-10 w-10 object-contain" unoptimized />
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            <span className="text-gradient-cyan">ABW</span>
            <span className="text-foreground">curious</span>
          </span>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Join the <span className="text-gradient-cyan">ABWcurious</span> Team
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            We&apos;re building the future of cybersecurity and AI. Looking for passionate minds who want to make a real impact.
            Explore our open positions and start your journey with us.
          </p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                type="text"
                placeholder="Search positions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setDeptFilter(dept)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  deptFilter === dept
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'glass-card text-foreground/70 hover:text-foreground hover:bg-primary/10'
                }`}
                aria-pressed={deptFilter === dept}
              >
                {dept === 'all' ? 'All Departments' : dept}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 sm:gap-6 mb-20">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-6 flex flex-col gap-3">
                <div className="flex gap-2"><Skeleton className="h-6 w-40" /><Skeleton className="h-6 w-20" /></div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-20" /></div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="glass-card p-10 text-center mb-12">
            <X className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-foreground/70 font-medium mb-2">Failed to load positions</p>
            <p className="text-foreground/50 text-sm mb-4">{error}</p>
            <Button variant="outline" onClick={() => setRetryKey((k) => k + 1)} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        )}

        {/* Open Positions */}
        {!loading && !error && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="mb-20"
          >
            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl font-bold text-foreground mb-8 flex items-center gap-3"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <Zap className="w-7 h-7 text-primary" />
              Open Positions
              {careers.length > 0 && (
                <Badge className="bg-primary/10 text-primary border-0 ml-2">{careers.length}</Badge>
              )}
            </motion.h2>

            {careers.length === 0 && (
              <div className="glass-card p-10 text-center">
                <Briefcase className="w-10 h-10 text-foreground/30 mx-auto mb-3" />
                <p className="text-foreground/70 font-medium mb-2">No open positions right now</p>
                <p className="text-foreground/50 text-sm mb-4">We&apos;re always growing. Submit your resume and we&apos;ll reach out when a role opens.</p>
                <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                  <Button className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                    <ExternalLink className="w-4 h-4" /> Send Resume
                  </Button>
                </a>
              </div>
            )}

            <div className="grid gap-4 sm:gap-6">
              {careers.map((job) => {
                const isExpanded = expandedId === job.id;
                const TypeIcon = jobTypeIcons[job.jobType] || Briefcase;
                return (
                  <motion.div
                    key={job.id}
                    variants={itemVariants}
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : job.id)}
                      className="block w-full text-left group"
                    >
                      <div className="glass-card p-5 sm:p-6 hover:glow-cyan transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3
                                className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors"
                                style={{ fontFamily: 'var(--font-space-grotesk)' }}
                              >
                                {job.title}
                              </h3>
                              <Badge className={`${departmentColors[job.department] || 'bg-foreground/10 text-foreground/70'} text-xs border-0`}>
                                {job.department}
                              </Badge>
                              <Badge variant="outline" className="text-xs text-foreground/60 border-foreground/20">
                                <TypeIcon className="w-3 h-3 mr-1" /> {job.jobType}
                              </Badge>
                              {job.isRemote && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs border-0">
                                  <Globe className="w-3 h-3 mr-1" /> Remote
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground/70 mb-3 line-clamp-2">{job.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/60">
                              <span className="inline-flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {job.department}</span>
                              <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                              <span className="inline-flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {job.experience}</span>
                              <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Posted {timeAgo(job.postedAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" />}
                          </div>
                        </div>
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="glass-card p-6 sm:p-8 mt-2 overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                <BookOpen className="w-4 h-4 text-primary" /> Description
                              </h4>
                              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/80 leading-relaxed">
                                {job.description}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                                <Zap className="w-4 h-4 text-primary" /> Requirements
                              </h4>
                              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/80 leading-relaxed">
                                {job.requirements}
                              </div>
                            </div>
                          </div>
                          {job.salary && (
                            <div className="mt-4 text-sm text-foreground/60">
                              <strong className="text-foreground/80">Compensation:</strong> {job.salary}
                            </div>
                          )}
                          <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-3 text-xs text-foreground/50">
                              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                              <span className="inline-flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.jobType}</span>
                              <span className="inline-flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {job.experience}</span>
                              {job.isRemote && <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3" /> Remote-friendly</span>}
                            </div>
                            <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
                              <Button className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                                <ExternalLink className="w-4 h-4" /> Apply Now
                              </Button>
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Internship Program */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="glass-card p-8 sm:p-10 glow-cyan text-center">
            <GraduationCap className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2
              className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Internship <span className="text-gradient-cyan">Program</span>
            </h2>
            <p className="text-foreground/70 mb-6 max-w-lg mx-auto">
              Kick-start your career with hands-on experience in cybersecurity, AI, and full-stack development. We offer mentorship-driven internships for passionate learners.
            </p>
            <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <ExternalLink className="w-4 h-4" /> Apply for Internship
              </Button>
            </a>
          </div>
        </motion.section>

        {/* Why Join */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-center"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Why Join <span className="text-gradient-cyan">ABWcurious</span>?
          </motion.h2>
          <motion.p variants={itemVariants} className="text-foreground/60 text-center mb-10 max-w-xl mx-auto">
            We believe great work happens when talented people are empowered, supported, and inspired.
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
                className="glass-card p-6 hover:glow-cyan transition-all duration-300 group text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {benefit.title}
                </h3>
                <p className="text-sm text-foreground/70">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="glass-card p-8 sm:p-10 glow-cyan">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Don&apos;t see the right role?
            </h2>
            <p className="text-foreground/70 mb-6 max-w-md mx-auto">
              We&apos;re always looking for talented people. Send us your resume and let us know how you can contribute.
            </p>
            <a href={APPLY_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90">
                Send Your Resume
              </Button>
            </a>
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <a href="/" className="text-primary hover:underline text-sm">Return to ABWcurious.com</a>
        </div>
      </div>
    </div>
  );
}
