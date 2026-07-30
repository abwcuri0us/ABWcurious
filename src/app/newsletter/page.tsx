'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mail, Calendar, ArrowRight, Inbox,
  RefreshCw, X, BookOpen, Hash, Clock, ExternalLink,
  ChevronDown, ChevronUp
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/date-utils';

/* ─── Types ────────────────────────────────────── */
interface NewsletterIssue {
  id: string;
  title: string;
  slug: string;
  content: string;
  issueNumber: number;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  created_at: string;
  updated_at: string;
}

/* ─── Constants ────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── Component ────────────────────────────────── */
export default function NewsletterPage() {
  const [issues, setIssues] = useState<NewsletterIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('limit', '50');
        if (searchQuery.trim()) params.set('search', searchQuery.trim());

        const res = await fetch(`/api/newsletter-issues?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch newsletter issues');
        const json = await res.json();
        if (!cancelled) setIssues(json.data || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [searchQuery, retryKey]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubscribed(true);
      setEmail('');
      setSubscribeError(null);
      setTimeout(() => setSubscribed(false), 4000);
    } catch {
      setSubscribeError('Failed to subscribe. Please try again later.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Newsletter <span className="text-gradient-cyan">Archive</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Browse our past newsletters covering cybersecurity insights, AI advancements, development best practices, and company updates.
          </p>
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6 sm:p-8 glow-cyan mb-12"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Inbox className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Subscribe to Our Newsletter
              </h2>
              <p className="text-sm text-foreground/60 mb-4">
                Get monthly security updates, tech insights, and exclusive content delivered to your inbox.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-background/50 border-border"
                />
                <Button type="submit" disabled={subscribing} className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 gap-2">
                  <Mail className="w-4 h-4" /> {subscribing ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
              {subscribed && (
                <p className="text-emerald-500 text-sm mt-3">You&apos;re subscribed! Check your inbox for a welcome email.</p>
              )}
              {subscribeError && (
                <p className="text-red-500 text-sm mt-3">{subscribeError}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="Search newsletters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md bg-background/50 border-border"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4 mb-20">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-6 flex gap-4">
                <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="glass-card p-10 text-center mb-12">
            <X className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-foreground/70 font-medium mb-2">Failed to load newsletters</p>
            <p className="text-foreground/50 text-sm mb-4">{error}</p>
            <Button variant="outline" onClick={() => setRetryKey((k) => k + 1)} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && issues.length === 0 && (
          <div className="glass-card p-10 text-center mb-12">
            <Mail className="w-10 h-10 text-foreground/30 mx-auto mb-3" />
            <p className="text-foreground/70 font-medium mb-2">No newsletters published yet</p>
            <p className="text-foreground/50 text-sm">Subscribe above and you&apos;ll receive our first issue when it&apos;s ready.</p>
          </div>
        )}

        {/* Archive */}
        {!loading && !error && issues.length > 0 && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <h2
              className="text-2xl sm:text-3xl font-bold text-foreground mb-8 flex items-center gap-3"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <Calendar className="w-7 h-7 text-primary" />
              Past Issues
            </h2>

            <div className="space-y-4 mb-20">
              {issues.map((issue) => {
                const isExpanded = expandedId === issue.id;
                return (
                  <motion.div key={issue.id} variants={itemVariants}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                      className="block w-full text-left group"
                    >
                      <div className="glass-card p-5 sm:p-6 hover:glow-cyan transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          {/* Issue thumbnail */}
                          {issue.coverImage ? (
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0">
                              <Image src={issue.coverImage} alt={issue.title} fill className="object-cover" sizes="80px" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <BookOpen className="w-7 h-7 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge className="bg-primary/10 text-primary border-0 text-xs">
                                <Hash className="w-3 h-3 mr-0.5" /> Issue #{issue.issueNumber}
                              </Badge>
                              <span className="text-xs text-foreground/50 inline-flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(issue.publishedAt || issue.created_at)}
                              </span>
                            </div>
                            <h3
                              className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2"
                              style={{ fontFamily: 'var(--font-space-grotesk)' }}
                            >
                              {issue.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-foreground/50">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {Math.max(1, Math.ceil(issue.content.split(/\s+/).length / 200))} min read
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-primary" />
                              ) : (
                                <span className="inline-flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Read <ArrowRight className="w-3 h-3" />
                                </span>
                              )}
                            </div>
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
                          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/80 leading-relaxed">
                            {issue.content}
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

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-foreground/50 text-sm mb-2">
            Missed an issue? All newsletters are archived here for easy access.
          </p>
          <p className="text-foreground/50 text-sm">
            Have questions or suggestions? Reach out at{' '}
            <a href="mailto:info@abwcurious.com" className="text-primary hover:underline">info@abwcurious.com</a>
          </p>
        </motion.div>

        <div className="mt-10 text-center">
          <a href="/" className="text-primary hover:underline text-sm">Return to ABWcurious.com</a>
        </div>
      </div>
    </div>
  );
}
