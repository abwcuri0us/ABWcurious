'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  FileText,
  CalendarDays,
  Briefcase,
  Mail,
  Clock,
  Globe,
  Eye,
  Activity,
  Zap,
  ArrowUpRight,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardUser {
  name: string | null;
  email: string;
  avatar: string | null;
  role?: string;
}

interface OverviewData {
  totalUsers: number;
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  totalEvents: number;
  activeCareers: number;
  newContacts: number;
  newsletterSubscribers: number;
  recentActivity: {
    id: string;
    type: 'contact' | 'blog' | 'event';
    text: string;
    time: string;
  }[];
}

export default function OverviewPanel({ user }: { user: DashboardUser }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/overview', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch overview data');
      }
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load overview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const stats = data
    ? [
        { title: 'Total Users', value: data.totalUsers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: 'Blog Posts', value: data.totalBlogs, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Events', value: data.totalEvents, icon: CalendarDays, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Active Careers', value: data.activeCareers, icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { title: 'New Contacts', value: data.newContacts, icon: Mail, color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { title: 'Newsletter', value: data.newsletterSubscribers, icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
      ]
    : [];

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const activityTypeIcon: Record<string, React.ElementType> = {
    contact: Mail,
    blog: FileText,
    event: CalendarDays,
  };

  const activityTypeColor: Record<string, string> = {
    contact: 'bg-pink-500',
    blog: 'bg-blue-500',
    event: 'bg-emerald-500',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
          Welcome back, {user.name || user.email.split('@')[0]}!
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s an overview of your ABWcurious platform
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-1">Failed to load dashboard</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchOverview} variant="outline" size="sm">Retry</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Blog Stats */}
          {data && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{data.publishedBlogs}</p>
                    <p className="text-xs text-muted-foreground">Published Posts</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{data.draftBlogs}</p>
                    <p className="text-xs text-muted-foreground">Draft Posts</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Activity */}
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <div className="p-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recent Activity
              </h3>
            </div>
            <CardContent className="p-4">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {data.recentActivity.map((activity) => {
                    const Icon = activityTypeIcon[activity.type] || Activity;
                    const dotColor = activityTypeColor[activity.type] || 'bg-primary';
                    return (
                      <div key={activity.id + activity.type} className="flex items-center gap-3 py-1">
                        <div className={`h-2 w-2 rounded-full ${dotColor} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{activity.text}</p>
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.time)}</p>
                        </div>
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
