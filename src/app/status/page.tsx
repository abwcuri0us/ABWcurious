'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Activity, Clock, Shield, Globe, Code, BookOpen, Server, Lock,
  Search, Eye
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

/* ─── Types ────────────────────────────────────── */
interface StatusIncident {
  id: string;
  title: string;
  description: string;
  severity: string; // minor | major | critical
  service: string;
  status: string; // investigating | identified | monitoring | resolved
  startedAt: string;
  resolvedAt: string | null;
  created_at: string;
  updated_at: string;
}

/* ─── Constants ────────────────────────────────── */
type StatusType = 'operational' | 'degraded' | 'outage';

const services: { name: string; icon: React.ElementType; description: string }[] = [
  { name: 'Website', icon: Globe, description: 'Main website and landing pages' },
  { name: 'CyberIntelligence360', icon: Shield, description: 'Cybersecurity monitoring platform' },
  { name: 'TheCodeArena', icon: Code, description: 'Development and deployment platform' },
  { name: 'StudySpark', icon: BookOpen, description: 'AI-powered learning platform' },
  { name: 'API Services', icon: Server, description: 'RESTful API endpoints and integrations' },
  { name: 'Authentication', icon: Lock, description: 'User authentication and session management' },
];

const statusConfig: Record<StatusType, { label: string; color: string; dotColor: string; icon: React.ElementType }> = {
  operational: { label: 'Operational', color: 'text-emerald-500', dotColor: 'bg-emerald-500', icon: CheckCircle2 },
  degraded: { label: 'Degraded Performance', color: 'text-amber-500', dotColor: 'bg-amber-500', icon: AlertTriangle },
  outage: { label: 'Service Outage', color: 'text-red-500', dotColor: 'bg-red-500', icon: XCircle },
};

const severityConfig: Record<string, { color: string; label: string }> = {
  minor: { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', label: 'Minor' },
  major: { color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', label: 'Major' },
  critical: { color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20', label: 'Critical' },
};

const incidentStatusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  investigating: { color: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: Search, label: 'Investigating' },
  identified: { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: Eye, label: 'Identified' },
  monitoring: { color: 'bg-primary/10 text-primary', icon: Activity, label: 'Monitoring' },
  resolved: { color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: CheckCircle2, label: 'Resolved' },
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
function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* Derive service status from active incidents */
function getServiceStatus(serviceName: string, activeIncidents: StatusIncident[]): StatusType {
  const serviceIncidents = activeIncidents.filter(
    (inc) => inc.service.toLowerCase().includes(serviceName.toLowerCase()) || serviceName.toLowerCase().includes(inc.service.toLowerCase())
  );
  if (serviceIncidents.some((inc) => inc.severity === 'critical')) return 'outage';
  if (serviceIncidents.some((inc) => inc.severity === 'major')) return 'degraded';
  if (serviceIncidents.length > 0) return 'degraded';
  return 'operational';
}

/* ─── Component ────────────────────────────────── */
export default function StatusPage() {
  const [incidents, setIncidents] = useState<StatusIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', '50');

      const res = await fetch(`/api/status-incidents?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch status incidents');
      const json = await res.json();
      setIncidents(json.data || []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 60000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const activeIncidents = incidents.filter((inc) => inc.status !== 'resolved');
  const resolvedIncidents = incidents.filter((inc) => inc.status === 'resolved');

  const serviceStatuses = services.map((service) => ({
    ...service,
    status: getServiceStatus(service.name, activeIncidents),
  }));

  const allOperational = serviceStatuses.every((s) => s.status === 'operational');

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
            System <span className="text-gradient-cyan">Status</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Real-time status of ABWcurious services. We continuously monitor all systems to ensure reliability.
          </p>
        </motion.div>

        {/* Loading */}
        {loading && incidents.length === 0 && (
          <div className="space-y-6 mb-10">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        )}

        {/* Error */}
        {error && incidents.length === 0 && (
          <div className="glass-card p-10 text-center mb-10">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-foreground/70 font-medium mb-2">Failed to load status</p>
            <p className="text-foreground/50 text-sm mb-4">{error}</p>
            <Button variant="outline" onClick={fetchIncidents} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        )}

        {!error && (incidents.length > 0 || !loading) && (
          <>
            {/* Overall Status Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`glass-card p-6 sm:p-8 mb-10 text-center ${
                allOperational ? 'glow-cyan' : 'ring-2 ring-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                {allOperational ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                )}
                <h2
                  className="text-2xl sm:text-3xl font-bold text-foreground"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {allOperational ? 'All Systems Operational' : 'Some Systems Experiencing Issues'}
                </h2>
              </div>
              <p className="text-foreground/60 text-sm">
                Last checked: {lastRefresh.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </motion.div>

            {/* Active Incidents */}
            {activeIncidents.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-10"
              >
                <h2
                  className="text-xl font-bold text-foreground mb-6 flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Active Incidents
                  <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-0 ml-2">
                    {activeIncidents.length}
                  </Badge>
                </h2>
                <div className="space-y-4">
                  {activeIncidents.map((incident) => {
                    const sevConfig = severityConfig[incident.severity] || severityConfig.minor;
                    const statConfig = incidentStatusConfig[incident.status] || incidentStatusConfig.investigating;
                    const StatIcon = statConfig.icon;
                    return (
                      <div key={incident.id} className="glass-card p-5 sm:p-6 ring-1 ring-amber-500/20 hover:glow-cyan transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <h3
                            className="text-base font-semibold text-foreground"
                            style={{ fontFamily: 'var(--font-space-grotesk)' }}
                          >
                            {incident.title}
                          </h3>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={`${sevConfig.color} text-xs border`}>{sevConfig.label}</Badge>
                            <Badge className={`${statConfig.color} text-xs border-0`}>
                              <StatIcon className="w-3 h-3 mr-1" /> {statConfig.label}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/70 mb-3">{incident.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/50">
                          <span className="inline-flex items-center gap-1"><Server className="w-3 h-3" /> {incident.service}</span>
                          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Started {timeAgo(incident.startedAt)}</span>
                          <span>{formatDateTime(incident.startedAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* Services List */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="mb-10"
            >
              <motion.h2 variants={itemVariants} className="text-xl font-bold text-foreground mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                <Server className="w-5 h-5 text-primary" />
                Service Details
              </motion.h2>

              <div className="space-y-3">
                {serviceStatuses.map((service) => {
                  const config = statusConfig[service.status];
                  return (
                    <motion.div
                      key={service.name}
                      variants={itemVariants}
                      className="glass-card p-4 sm:p-5 hover:glow-cyan transition-all duration-300"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <service.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-sm sm:text-base" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                              {service.name}
                            </h3>
                            <p className="text-xs text-foreground/50 hidden sm:block">{service.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`w-2 h-2 rounded-full ${config.dotColor} ${service.status === 'operational' ? 'animate-pulse' : ''}`} />
                          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* Incident History */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card p-6 sm:p-8 mb-10"
            >
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                <Clock className="w-5 h-5 text-primary" />
                Incident History
              </h2>
              {resolvedIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="text-foreground/70 font-medium">No recent incidents</p>
                  <p className="text-foreground/50 text-sm mt-1">All systems have been running smoothly.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resolvedIncidents.map((incident) => {
                    const sevConfig = severityConfig[incident.severity] || severityConfig.minor;
                    return (
                      <div key={incident.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <h3 className="text-sm font-medium text-foreground">{incident.title}</h3>
                          <Badge className={`${sevConfig.color} text-xs border shrink-0`}>{sevConfig.label}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/50">
                          <span className="inline-flex items-center gap-1"><Server className="w-3 h-3" /> {incident.service}</span>
                          <span>Started {formatDateTime(incident.startedAt)}</span>
                          {incident.resolvedAt && <span>Resolved {formatDateTime(incident.resolvedAt)}</span>}
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs border-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.section>
          </>
        )}

        {/* Auto-refresh note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass-card p-4 flex items-center justify-center gap-2 text-foreground/50 text-xs mb-8"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Status is updated in real-time. This page auto-refreshes every 60 seconds.</span>
        </motion.div>

        <div className="text-center">
          <a href="/" className="text-primary hover:underline text-sm">Return to ABWcurious.com</a>
        </div>
      </div>
    </div>
  );
}
