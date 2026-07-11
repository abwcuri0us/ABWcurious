'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, MapPin, Video, Users, Play, Clock,
  ExternalLink, Mic, Wrench, Briefcase, Globe, RefreshCw,
  X, ChevronDown, ChevronUp, Timer
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/date-utils';

/* ─── Types ────────────────────────────────────── */
interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string;
  coverImage: string | null;
  eventType: string;
  location: string | null;
  eventDate: string;
  endDate: string | null;
  registrationUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  created_at: string;
  updated_at: string;
}

/* ─── Constants ────────────────────────────────── */
const typeConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  webinar: { color: 'bg-primary/10 text-primary border-primary/20', icon: Mic, label: 'Webinar' },
  workshop: { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: Wrench, label: 'Workshop' },
  conference: { color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20', icon: Globe, label: 'Conference' },
  meetup: { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: Users, label: 'Meetup' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── Helpers ──────────────────────────────────── */
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

/* ─── Component ────────────────────────────────── */

function getCountdown(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return 'Started';
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr).getTime() > Date.now();
}

/* ─── Countdown Timer Component ─── */
function CountdownTimer({ date }: { date: string }) {
  const [countdown, setCountdown] = useState(getCountdown(date));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(date));
    }, 60000);
    return () => clearInterval(interval);
  }, [date]);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Timer className="w-4 h-4 text-primary" />
      <span className="font-mono font-medium text-primary">{countdown}</span>
    </div>
  );
}

/* ─── Main Component ─── */
export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('limit', '50');
        if (eventTypeFilter !== 'all') params.set('eventType', eventTypeFilter);

        const res = await fetch(`/api/events?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch events');
        const json = await res.json();
        if (!cancelled) setEvents(json.data || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [eventTypeFilter, retryKey]);

  const upcomingEvents = events.filter((e) => isUpcoming(e.eventDate));
  const pastEvents = events.filter((e) => !isUpcoming(e.eventDate));

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
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Webinars & <span className="text-gradient-cyan">Events</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Join our expert-led webinars, workshops, and masterclasses. Learn the latest in cybersecurity, AI, and technology from the ABWcurious team.
          </p>
        </motion.div>

        {/* Event Type Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {['all', 'webinar', 'workshop', 'conference', 'meetup'].map((type) => {
            const cfg = typeConfig[type];
            return (
              <button
                key={type}
                onClick={() => setEventTypeFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize flex items-center gap-2 ${
                  eventTypeFilter === type
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'glass-card text-foreground/70 hover:text-foreground hover:bg-primary/10'
                }`}
                aria-pressed={eventTypeFilter === type}
              >
                {cfg?.icon && <cfg.icon className="w-3.5 h-3.5" />}
                {type === 'all' ? 'All Events' : cfg?.label || type}
              </button>
            );
          })}
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="space-y-6 mb-20">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-6 sm:p-8 flex flex-col gap-4">
                <div className="flex gap-3"><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-24" /></div>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-4"><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-36" /></div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="glass-card p-10 text-center mb-12">
            <X className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-foreground/70 font-medium mb-2">Failed to load events</p>
            <p className="text-foreground/50 text-sm mb-4">{error}</p>
            <Button variant="outline" onClick={() => setRetryKey((k) => k + 1)} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && events.length === 0 && (
          <div className="glass-card p-10 text-center mb-12">
            <Calendar className="w-10 h-10 text-foreground/30 mx-auto mb-3" />
            <p className="text-foreground/70 font-medium mb-2">No events scheduled</p>
            <p className="text-foreground/50 text-sm">Check back soon for upcoming webinars, workshops, and more.</p>
          </div>
        )}

        {/* Upcoming Events */}
        {!loading && !error && upcomingEvents.length > 0 && (
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
              <Calendar className="w-7 h-7 text-primary" />
              Upcoming Events
              <Badge className="bg-primary/10 text-primary border-0 ml-2">{upcomingEvents.length}</Badge>
            </motion.h2>

            <div className="space-y-6">
              {upcomingEvents.map((event) => {
                const cfg = typeConfig[event.eventType] || typeConfig.webinar;
                const isExpanded = expandedId === event.id;
                return (
                  <motion.div key={event.id} variants={itemVariants}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : event.id)}
                      className="block w-full text-left group"
                    >
                      <div className="glass-card p-6 sm:p-8 hover:glow-cyan transition-all duration-300">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          <div className="flex-1">
                            {event.coverImage && (
                              <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                                <Image src={event.coverImage} alt={event.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 672px" />
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge className={`${cfg.color} text-xs`}>
                                <cfg.icon className="w-3 h-3 mr-1" /> {cfg.label}
                              </Badge>
                              <CountdownTimer date={event.eventDate} />
                            </div>
                            <h3
                              className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors"
                              style={{ fontFamily: 'var(--font-space-grotesk)' }}
                            >
                              {event.title}
                            </h3>
                            <p className="text-sm text-foreground/70 mb-4 max-w-2xl">{event.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/60">
                              <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(event.eventDate)}</span>
                              <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatTime(event.eventDate)}</span>
                              {event.location && (
                                <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.location}</span>
                              )}
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                          {event.registrationUrl && (
                            <div className="shrink-0">
                              <a
                                href={event.registrationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90">
                                  <ExternalLink className="w-4 h-4 mr-2" /> Register
                                </Button>
                              </a>
                            </div>
                          )}
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
                            {event.content}
                          </div>
                          {event.registrationUrl && (
                            <div className="mt-6 pt-4 border-t border-border">
                              <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                                <Button size="lg" className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                                  <ExternalLink className="w-4 h-4" /> Register Now
                                </Button>
                              </a>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Past Events */}
        {!loading && !error && pastEvents.length > 0 && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-3xl font-bold text-foreground mb-8 flex items-center gap-3"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <Video className="w-7 h-7 text-primary" />
              Past Events
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => {
                const cfg = typeConfig[event.eventType] || typeConfig.webinar;
                const isExpanded = expandedId === event.id;
                return (
                  <motion.div key={event.id} variants={itemVariants}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : event.id)}
                      className="block w-full text-left group h-full"
                    >
                      <div className="glass-card p-5 sm:p-6 hover:glow-cyan transition-all duration-300 flex flex-col h-full">
                        {event.coverImage && (
                          <div className="relative w-full h-36 rounded-lg overflow-hidden mb-3 opacity-80">
                            <Image src={event.coverImage} alt={event.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={`${cfg.color} text-xs`}>{cfg.label}</Badge>
                          <Badge variant="outline" className="text-xs text-foreground/50 border-foreground/20">Completed</Badge>
                        </div>
                        <h3
                          className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors"
                          style={{ fontFamily: 'var(--font-space-grotesk)' }}
                        >
                          {event.title}
                        </h3>
                        <p className="text-sm text-foreground/60 mb-4 line-clamp-2 flex-1">{event.description}</p>
                        <div className="flex items-center justify-between text-xs text-foreground/50">
                          <span>{formatDate(event.eventDate)}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />}
                        </div>
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="glass-card p-6 mt-2 overflow-hidden"
                        >
                          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/80 leading-relaxed">
                            {event.content}
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 text-center"
        >
          <div className="glass-card p-8 sm:p-10 glow-cyan">
            <Users className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2
              className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Want to host a session with us?
            </h2>
            <p className="text-foreground/70 mb-6 max-w-md mx-auto">
              We&apos;re always looking for industry experts and thought leaders to collaborate on webinars and workshops.
            </p>
            <a href="mailto:info@abwcurious.com">
              <Button size="lg" variant="outline" className="btn-glow border-primary/30 hover:bg-primary/10 text-primary">
                Get in Touch
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
