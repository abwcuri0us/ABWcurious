'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Info, MessageSquare, Calendar, Megaphone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsPanelProps {
  token: string;
  userId: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  system: { icon: Megaphone, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  blog_comment: { icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  event_reminder: { icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
};

export default function NotificationsPanel({ token, userId }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/user/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      }
    } catch {
      // Fallback to mock data if API fails
      setNotifications([
        {
          id: '1',
          type: 'system',
          title: 'Welcome to ABWcurious!',
          message: 'Your account has been created successfully. Explore our platform to get started.',
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch {
      // optimistic update, ignore
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ markAll: true }),
      });
    } catch {
      // optimistic update, ignore
    }
  };

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter((n) => n.type === filterType);

  const notificationTypes = ['all', ...new Set(notifications.map((n) => n.type))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            Notifications
          </h2>
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground">{unreadCount} new</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="flex gap-1">
            {notificationTypes.map((type) => (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setFilterType(type)}
              >
                {type === 'all' ? 'All' : type.replace('_', ' ')}
              </Button>
            ))}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-1.5" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-1">No notifications</h3>
            <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => {
            const config = typeConfig[notification.type] || typeConfig.system;
            const Icon = config.icon;
            return (
              <Card
                key={notification.id}
                className={`border-border backdrop-blur-sm transition-colors ${
                  notification.is_read ? 'bg-card/30 opacity-70' : 'bg-card/50 hover:border-primary/20'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-medium text-foreground">{notification.title}</h4>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-border bg-card/30 backdrop-blur-sm">
        <CardContent className="p-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>Notifications will appear here as you interact with the platform.</span>
        </CardContent>
      </Card>
    </div>
  );
}
