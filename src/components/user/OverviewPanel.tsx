'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Briefcase, Bell, Eye, Clock, ArrowUpRight, Lightbulb, Heart, Handshake, Star } from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth-fetch';

interface OverviewPanelProps {
  user: { name: string | null; email: string; role?: string };
  token: string;
  userId: string;
  onNavigate?: (section: string) => void;
}

export default function OverviewPanel({ user, token, userId, onNavigate }: OverviewPanelProps) {
  const [eventCount, setEventCount] = useState(0);
  const [solutionCount, setSolutionCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [eventsRes, solutionsRes, notificationsRes] = await Promise.all([
          fetch('/api/user/events', { headers: getAuthHeaders(token) }).catch(() => null),
          fetch('/api/user/solutions', { headers: getAuthHeaders(token) }).catch(() => null),
          fetch('/api/user/notifications', { headers: getAuthHeaders(token) }).catch(() => null),
        ]);

        if (eventsRes?.ok) {
          const data = await eventsRes.json();
          setEventCount(data.data?.registrations?.length || 0);
        }
        if (solutionsRes?.ok) {
          const data = await solutionsRes.json();
          setSolutionCount(data.data?.orders?.length || 0);
        }
        if (notificationsRes?.ok) {
          const data = await notificationsRes.json();
          setNotificationCount(data.unreadCount || 0);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [token, userId]);

  const quickStats = [
    { title: 'Events Registered', value: loading ? '...' : String(eventCount), icon: CalendarDays, color: 'text-emerald-500', bg: 'bg-emerald-500/10', section: 'events' },
    { title: 'Solutions Requested', value: loading ? '...' : String(solutionCount), icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10', section: 'solutions' },
    { title: 'Notifications', value: loading ? '...' : String(notificationCount), icon: Bell, color: 'text-purple-500', bg: 'bg-purple-500/10', section: 'notifications' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
          Welcome, {user.name || user.email.split('@')[0]}!
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your personal dashboard at ABWcurious
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors cursor-pointer"
              onClick={() => onNavigate?.(stat.section)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <div className="p-4 border-b border-border">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Activity
            </h3>
          </div>
          <CardContent className="p-4 space-y-3">
            {[
              { text: 'Welcome to your dashboard!', time: 'Just now', type: 'system' },
              { text: 'Explore our solutions and services', time: '—', type: 'info' },
              { text: 'Check out upcoming events', time: '—', type: 'event' },
              { text: 'View open career positions', time: '—', type: 'career' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <div className="p-4 border-b border-border">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Quick Links
            </h3>
          </div>
          <CardContent className="p-4 space-y-4">
            {[
              { icon: CalendarDays, label: 'Browse Events', section: 'events' },
              { icon: Lightbulb, label: 'Browse Solutions', section: 'solutions' },
              { icon: Briefcase, label: 'View Careers', section: 'careers' },
              { icon: Handshake, label: 'Partner With Us', section: 'partnership' },
              { icon: Heart, label: 'Sponsor Us', section: 'sponsorship' },
              { icon: Star, label: 'Leave Feedback', section: 'feedback' },
              { icon: Bell, label: 'Check Notifications', section: 'notifications' },
            ].map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.section}
                  className="flex items-center justify-between w-full text-left hover:bg-secondary/30 rounded-lg px-2 py-1 transition-colors"
                  onClick={() => onNavigate?.(link.section)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{link.label}</span>
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-primary" />
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
