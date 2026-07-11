'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Loader2, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

const typeColors: Record<string, string> = {
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  announcement: 'bg-purple-500',
};

export default function NotificationBell() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=10', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const notifs = data.data || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: Notification) => !n.is_read).length);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial fetch and polling
  useEffect(() => {
    if (!token) return;
     
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationIds: [id] }),
      });
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationIds: unreadIds }),
      });
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.is_read) {
      handleMarkAsRead(notif.id);
    }
    if (notif.link) {
      window.open(notif.link, '_blank');
    }
    setOpen(false);
  };

  if (!user || !token) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-primary-foreground bg-primary rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-7 text-xs text-primary hover:text-primary">
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-secondary/50 ${
                    !notif.is_read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className={`h-2 w-2 rounded-full ${notif.is_read ? 'bg-transparent' : (typeColors[notif.type] || 'bg-primary')}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${notif.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {notif.title}
                        </p>
                        {notif.link && (
                          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
