"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Filter,
  LogIn,
  Loader2,
  Video,
  Wrench,
  GraduationCap,
  Mic2,
  Heart,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

/* ──────────── Types ──────────── */

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  end_date: string | null;
  location: string;
  type: string;
  capacity: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: "registered" | "attended" | "cancelled" | "no-show";
  created_at: string;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    type: string;
  } | null;
}

/* ──────────── Constants ──────────── */

const EVENT_TYPES = [
  { key: "all", label: "All" },
  { key: "webinar", label: "Webinars" },
  { key: "workshop", label: "Workshops" },
  { key: "training", label: "Training" },
  { key: "conference", label: "Conferences" },
  { key: "meetup", label: "Meetups" },
];

const TYPE_CONFIG: Record<string, { color: string; icon: React.ElementType; gradient: string }> = {
  webinar: {
    color: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    icon: Video,
    gradient: "from-cyan-500 to-cyan-700",
  },
  workshop: {
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Wrench,
    gradient: "from-amber-500 to-amber-700",
  },
  training: {
    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: GraduationCap,
    gradient: "from-emerald-500 to-emerald-700",
  },
  conference: {
    color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: Mic2,
    gradient: "from-purple-500 to-purple-700",
  },
  meetup: {
    color: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: Heart,
    gradient: "from-rose-500 to-rose-700",
  },
};

const REG_STATUS_COLORS: Record<string, string> = {
  registered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  attended: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  cancelled: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  "no-show": "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
};

/* ──────────── Animation Variants ──────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ──────────── Helpers ──────────── */

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isVirtual(location: string): boolean {
  const lower = location.toLowerCase();
  return lower.includes("online") || lower.includes("virtual") || lower.includes("zoom") || lower.includes("teams");
}

/* ──────────── Component ──────────── */

export default function EventsPage() {
  const { user, token } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [regsLoading, setRegsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Registration modal
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [registering, setRegistering] = useState(false);

  // Login prompt
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  // ── Fetch events ──
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success) setEvents(data.data || []);
    } catch {
      toast.error("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch user registrations ──
  const fetchRegistrations = useCallback(async () => {
    if (!token) return;
    setRegsLoading(true);
    try {
      const res = await fetch("/api/events/register", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setRegistrations(data.data || []);
    } catch {
      // silently fail
    } finally {
      setRegsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // ── Filtered events ──
  const filteredEvents = events.filter((e) => {
    if (activeTab !== "all" && e.type !== activeTab) return false;
    return true;
  });

  // ── Check if already registered ──
  const isRegistered = (eventId: string) =>
    registrations.some((r) => r.event_id === eventId && r.status !== "cancelled");

  // ── Get registered count for display ──
  const getRegisteredCount = (event: EventItem): string | null => {
    if (!event.capacity) return null;
    const count = registrations.filter(
      (r) => r.event_id === event.id && r.status !== "cancelled"
    ).length;
    // We don't have global registration count, so show capacity
    return `${Math.max(count, 0)}/${event.capacity}`;
  };

  // ── Handle register click ──
  const handleRegisterClick = (event: EventItem) => {
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    if (isRegistered(event.id)) {
      toast.info("You're already registered for this event.");
      return;
    }
    setSelectedEvent(event);
    setRegModalOpen(true);
  };

  // ── Submit registration ──
  const handleConfirmRegister = async () => {
    if (!selectedEvent || !token) return;
    setRegistering(true);
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ event_id: selectedEvent.id }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("You're registered!");
        setRegModalOpen(false);
        fetchRegistrations();
      } else {
        toast.error(data.error || "Failed to register.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 gradient-radial-cyan pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp}>
            <span
              className="inline-block text-primary text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-4"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Events & Learning
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-foreground"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <span className="text-gradient-cyan">Events & Learning</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-foreground/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
          >
            Expand your knowledge through webinars, workshops, and training
            sessions. Stay ahead with ABWcurious events.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Tab Filters ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 -mt-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="glass-card p-3 sm:p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {EVENT_TYPES.map((tab) => {
                const Icon = tab.key !== "all" ? TYPE_CONFIG[tab.key]?.icon : Calendar;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      activeTab === tab.key
                        ? "bg-primary/15 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Events Grid ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card animate-pulse overflow-hidden">
                  <div className="h-36 bg-foreground/5" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-28 rounded bg-foreground/5" />
                    <div className="h-5 w-3/4 rounded bg-foreground/5" />
                    <div className="h-3 w-1/2 rounded bg-foreground/5" />
                    <div className="h-9 w-32 rounded-lg bg-foreground/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <motion.div
              className="glass-card p-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No events found
              </h3>
              <p className="text-muted-foreground text-sm">
                {events.length === 0
                  ? "There are no upcoming events at the moment. Stay tuned!"
                  : "Try selecting a different category."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredEvents.map((event) => {
                const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.webinar;
                const TypeIcon = config.icon;
                const virtual = isVirtual(event.location);
                const registered = isRegistered(event.id);

                return (
                  <motion.div key={event.id} variants={cardVariants}>
                    <Card className="glass-card overflow-hidden hover:border-primary/20 transition-all duration-500 group">
                      {/* Banner / Gradient placeholder */}
                      <div
                        className="relative h-36 overflow-hidden"
                        style={{
                          background: event.image_url
                            ? undefined
                            : `linear-gradient(135deg, var(--glow-color), rgba(0, 102, 255, 0.1))`,
                        }}
                      >
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TypeIcon className="w-12 h-12 text-primary/30" />
                          </div>
                        )}

                        {/* Type badge overlay */}
                        <div className="absolute top-3 left-3">
                          <Badge
                            variant="outline"
                            className={`text-xs ${config.color}`}
                          >
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {event.type}
                          </Badge>
                        </div>

                        {/* Virtual badge */}
                        {virtual && (
                          <div className="absolute top-3 right-3">
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            >
                              <Globe className="w-3 h-3 mr-1" />
                              Online
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-5">
                        {/* Date & Time */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(event.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(event.date)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2"
                          style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                          {event.title}
                        </h3>

                        {/* Description */}
                        <p className="text-foreground/80 text-sm leading-relaxed mb-3 line-clamp-2">
                          {event.description}
                        </p>

                        {/* Location & Capacity */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {virtual ? "Online" : event.location}
                          </span>
                          {event.capacity && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {getRegisteredCount(event) || `${event.capacity} spots`} available
                            </span>
                          )}
                        </div>

                        {/* Register button */}
                        <Button
                          onClick={() => handleRegisterClick(event)}
                          disabled={registered}
                          className={`w-full font-semibold text-sm py-2.5 rounded-xl transition-all duration-300 ${
                            registered
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-[0_0_20px_var(--glow-color)]"
                          }`}
                        >
                          {registered ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Registered
                            </>
                          ) : (
                            "Register Now"
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── My Registrations ── */}
      {user && (
        <section className="relative px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2
                className="text-2xl sm:text-3xl font-bold text-foreground mb-6"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                <span className="text-gradient-cyan">My Registrations</span>
              </h2>

              {regsLoading ? (
                <div className="glass-card p-6 animate-pulse space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-foreground/5" />
                  ))}
                </div>
              ) : registrations.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Calendar className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">
                    You haven&apos;t registered for any events yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {registrations.map((reg) => {
                    const config = TYPE_CONFIG[reg.event?.type || "webinar"];
                    const RegIcon = config?.icon || Calendar;
                    return (
                      <div
                        key={reg.id}
                        className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <RegIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {reg.event?.title || "Unknown Event"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {reg.event?.date && formatDate(reg.event.date)}
                              {reg.event?.location && ` • ${reg.event.location}`}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize shrink-0 ${REG_STATUS_COLORS[reg.status] || ""}`}
                        >
                          {reg.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Registration Confirmation Modal ── */}
      <Dialog open={regModalOpen} onOpenChange={setRegModalOpen}>
        <DialogContent className="glass-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle
              className="text-foreground"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Confirm Registration
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You&apos;re about to register for this event.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 mt-2">
              <div className="glass-card p-4 space-y-2">
                <h4 className="text-base font-semibold text-foreground">
                  {selectedEvent.title}
                </h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedEvent.date)} at {formatTime(selectedEvent.date)}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {isVirtual(selectedEvent.location) ? "Online" : selectedEvent.location}
                  </p>
                  {selectedEvent.capacity && (
                    <p className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Capacity: {selectedEvent.capacity} attendees
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleConfirmRegister}
                disabled={registering}
                className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-2.5 rounded-xl hover:shadow-[0_0_20px_var(--glow-color)] transition-all duration-300"
              >
                {registering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Confirm Registration"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Login Prompt Dialog ── */}
      <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
        <DialogContent className="glass-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle
              className="text-foreground"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Login Required
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Please log in to register for events.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button
              onClick={() => {
                setLoginPromptOpen(false);
                window.dispatchEvent(
                  new CustomEvent("abwcurious:open-auth", { detail: { mode: "login" } })
                );
              }}
              className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-2.5 rounded-xl"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login to Register
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
