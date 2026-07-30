'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wrench,
  RefreshCw,
  Clock,
  Loader2,
  Activity,
  Server,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/* ──────────── Types ──────────── */

type StatusType = 'operational' | 'degraded' | 'outage' | 'maintenance';

interface ServiceStatus {
  id: string;
  service_name: string;
  status: StatusType;
  message: string | null;
  updated_at: string;
  created_at: string;
}

interface StatusData {
  overall: StatusType;
  services: ServiceStatus[];
  lastChecked: string;
}

/* ──────────── Helpers ──────────── */

const STATUS_CONFIG: Record<
  StatusType,
  { label: string; color: string; bgColor: string; borderColor: string; icon: typeof CheckCircle2 }
> = {
  operational: {
    label: 'Operational',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
  degraded: {
    label: 'Degraded',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    icon: AlertTriangle,
  },
  outage: {
    label: 'Outage',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    icon: XCircle,
  },
  maintenance: {
    label: 'Maintenance',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    icon: Wrench,
  },
};

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ──────────── Animation Variants ──────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

/* ──────────── Overall Status Indicator ──────────── */

function OverallStatus({ status }: { status: StatusType }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const messages: Record<StatusType, string> = {
    operational: 'All Systems Operational',
    degraded: 'Some Systems Degraded',
    outage: 'Service Outage Detected',
    maintenance: 'Scheduled Maintenance In Progress',
  };

  const descriptions: Record<StatusType, string> = {
    operational: 'All ABWcurious services are running normally.',
    degraded: 'Some services may be experiencing slower response times.',
    outage: 'We are aware of the issue and working to resolve it.',
    maintenance: 'Scheduled maintenance is currently underway.',
  };

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${config.bgColor} mb-6`}
      >
        <Icon className={`h-10 w-10 ${config.color}`} />
      </div>
      <h2
        className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {messages[status]}
      </h2>
      <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
        {descriptions[status]}
      </p>
    </motion.div>
  );
}

/* ──────────── Service Row Component ──────────── */

function ServiceRow({ service }: { service: ServiceStatus }) {
  const config = STATUS_CONFIG[service.status as StatusType];
  const Icon = config.icon;

  return (
    <motion.div
      className="flex items-center justify-between p-4 sm:p-5 rounded-xl glass-card border border-border/40 hover:border-primary/10 transition-all duration-200"
      variants={fadeUp}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-4.5 w-4.5 ${config.color}`} />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate">{service.service_name}</h4>
          {service.message && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{service.message}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <Badge
          className={`${config.bgColor} ${config.color} ${config.borderColor} border text-xs font-medium`}
        >
          {config.label}
        </Badge>
        <span className="text-xs text-muted-foreground hidden sm:inline whitespace-nowrap">
          {formatTimeAgo(service.updated_at)}
        </span>
      </div>
    </motion.div>
  );
}

/* ──────────── Main Status Page ──────────── */

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const res = await fetch('/api/status');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setLastRefresh(new Date().toISOString());
      } else {
        setError(result.error || 'Failed to fetch status.');
        if (!isRefresh) toast.error('Failed to load service status.');
      }
    } catch {
      setError('Network error. Please try again.');
      if (!isRefresh) toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="relative pt-28 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 gradient-radial-cyan opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <motion.div
          className="relative max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <span className="glass-card inline-flex items-center gap-2 px-4 py-2 text-sm text-primary font-medium mb-6">
              <Activity className="w-4 h-4" />
              System Status
            </span>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Service <span className="text-gradient-cyan">Status</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Real-time status and uptime information for all ABWcurious services and infrastructure.
            </p>
          </div>

          {/* Overall Status */}
          {data && <OverallStatus status={data.overall as StatusType} />}
        </motion.div>
      </section>

      {/* Service List */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Checking service status...</span>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="text-center py-20">
              <XCircle className="h-12 w-12 text-red-500/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load status</h3>
              <p className="text-muted-foreground text-sm mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => fetchStatus()}
                className="border-border"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && data && data.services.length === 0 && (
            <div className="text-center py-20">
              <Server className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No services tracked</h3>
              <p className="text-muted-foreground text-sm">
                Service status information will appear here once configured.
              </p>
            </div>
          )}

          {/* Service List */}
          {!loading && !error && data && data.services.length > 0 && (
            <motion.div
              className="space-y-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              key={lastRefresh}
            >
              {data.services.map((service) => (
                <ServiceRow key={service.id} service={service} />
              ))}
            </motion.div>
          )}

          {/* Last Checked + Manual Refresh */}
          <div className="flex items-center justify-between mt-8 px-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {lastRefresh
                ? `Last checked: ${formatDateTime(lastRefresh)}`
                : 'Checking...'}
              <span className="text-muted-foreground/50">(auto-refreshes every 60s)</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
              className="text-xs text-muted-foreground hover:text-foreground h-8"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Legend */}
          <div className="mt-8 p-4 rounded-xl glass-card border border-border/40">
            <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3">
              Status Legend
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span className="text-xs text-muted-foreground">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
