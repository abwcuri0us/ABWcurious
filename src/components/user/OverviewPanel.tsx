'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, CalendarDays, Briefcase, Bell, Eye, Clock, ArrowUpRight } from 'lucide-react';

interface OverviewPanelProps {
  user: { name: string | null; email: string; role?: string };
  token: string;
  userId: string;
  onNavigate?: (section: string) => void; // Accepts UserSection values like 'blogs', 'events', etc.
}

export default function OverviewPanel({ user, token, userId, onNavigate }: OverviewPanelProps) {
  const [blogCount, setBlogCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [careerCount, setCareerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [blogsRes, eventsRes, careersRes] = await Promise.all([
          fetch('/api/user/blogs', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
          fetch('/api/user/events', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
          fetch('/api/user/careers', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        ]);

        if (blogsRes?.ok) {
          const data = await blogsRes.json();
          setBlogCount(data.data?.length || 0);
        }
        if (eventsRes?.ok) {
          const data = await eventsRes.json();
          setEventCount(data.data?.events?.length || 0);
        }
        if (careersRes?.ok) {
          const data = await careersRes.json();
          setCareerCount(data.data?.careers?.length || 0);
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
    { title: 'My Blog Posts', value: loading ? '...' : String(blogCount), icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', section: 'blogs' },
    { title: 'Upcoming Events', value: loading ? '...' : String(eventCount), icon: CalendarDays, color: 'text-emerald-500', bg: 'bg-emerald-500/10', section: 'events' },
    { title: 'Open Positions', value: loading ? '...' : String(careerCount), icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-500/10', section: 'careers' },
    { title: 'Notifications', value: '0', icon: Bell, color: 'text-purple-500', bg: 'bg-purple-500/10', section: 'notifications' },
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              { text: 'Write your first blog post', time: '—', type: 'blog' },
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
              { icon: FileText, label: 'Write a Blog Post', section: 'blogs' },
              { icon: CalendarDays, label: 'Browse Events', section: 'events' },
              { icon: Briefcase, label: 'View Careers', section: 'careers' },
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
