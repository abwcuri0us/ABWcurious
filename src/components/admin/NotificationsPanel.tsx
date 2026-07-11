'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Loader2,
  Send,
  Search,
  Trash2,
  Users,
  User,
  Shield,
  Mail,
  MailCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  user_id: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationsPanelProps {
  token: string;
}

const typeColors: Record<string, string> = {
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  error: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  announcement: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
};

export default function NotificationsPanel({ token }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(true);

  // Delivery stats after broadcast/role send
  const [deliveryStats, setDeliveryStats] = useState<{
    totalUsers: number;
    notificationsCreated: number;
    emailsSent: number;
    emailErrors: { email: string; error: string }[];
  } | null>(null);

  // Form state
  const [targetType, setTargetType] = useState<string>('all');
  const [targetUserId, setTargetUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<string>('info');
  const [link, setLink] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; email: string }[]>([]);
  const [searching, setSearching] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch {
      toast.error('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSearchUsers = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults((data.data || []).slice(0, 5));
      }
    } catch {
      // ignore search errors
    } finally {
      setSearching(false);
    }
  }, [token]);

  const handleSend = async () => {
    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }
    if (!message.trim()) {
      toast.error('Message is required.');
      return;
    }

    setSending(true);
    try {
      const body: Record<string, unknown> = {
        title,
        message,
        type,
        link: link || undefined,
      };

      if (targetType === 'individual') {
        if (!targetUserId) {
          toast.error('Please select a user.');
          setSending(false);
          return;
        }
        body.user_id = targetUserId;
      } else if (targetType === 'all') {
        body.broadcast = true;
        body.send_email = sendEmail;
      } else if (targetType === 'admins') {
        body.target_type = 'role';
        body.role = 'admin';
        body.send_email = sendEmail;
      } else if (targetType === 'users') {
        body.target_type = 'role';
        body.role = 'user';
        body.send_email = sendEmail;
      }

      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        // Show delivery stats if available (broadcast/role)
        if (data.stats) {
          setDeliveryStats(data.stats);
          toast.success(data.message || 'Broadcast sent successfully.');
        } else {
          setDeliveryStats(null);
          toast.success('Notification sent successfully.');
        }
        setTitle('');
        setMessage('');
        setLink('');
        setTargetUserId('');
        setSearchQuery('');
        setSearchResults([]);
        fetchNotifications();
      } else {
        toast.error(data.error || 'Failed to send notification.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Notification deleted.');
        fetchNotifications();
      } else {
        toast.error(data.error || 'Failed to delete notification.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
          Notifications
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Send notifications to users and manage notification history
        </p>
      </div>

      {/* Delivery Stats Card */}
      {deliveryStats && (
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MailCheck className="h-4 w-4 text-primary" />
              Delivery Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <p className="text-2xl font-bold text-foreground">{deliveryStats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{deliveryStats.notificationsCreated}</p>
                </div>
                <p className="text-xs text-muted-foreground">Notifications Created</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <p className="text-2xl font-bold text-primary">{deliveryStats.emailsSent}</p>
                </div>
                <p className="text-xs text-muted-foreground">Emails Sent</p>
              </div>
            </div>
            {deliveryStats.emailErrors.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    {deliveryStats.emailErrors.length} email error{deliveryStats.emailErrors.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="max-h-24 overflow-y-auto scrollbar-thin space-y-1">
                  {deliveryStats.emailErrors.map((err, i) => (
                    <p key={i} className="text-[10px] text-muted-foreground truncate">
                      {err.email}: {err.error}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end mt-3">
              <Button variant="ghost" size="sm" onClick={() => setDeliveryStats(null)} className="h-7 text-xs text-muted-foreground">
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Send className="h-4 w-4 text-primary" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Target */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Target</Label>
              <Select value={targetType} onValueChange={(v) => { setTargetType(v); setTargetUserId(''); setSearchQuery(''); setSearchResults([]); }}>
                <SelectTrigger className="w-full bg-secondary/50 border-border h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> All Users (Broadcast)</span>
                  </SelectItem>
                  <SelectItem value="individual">
                    <span className="flex items-center gap-2"><User className="h-3.5 w-3.5" /> Individual User</span>
                  </SelectItem>
                  <SelectItem value="admins">
                    <span className="flex items-center gap-2"><Shield className="h-3.5 w-3.5" /> All Admins</span>
                  </SelectItem>
                  <SelectItem value="users">
                    <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> All Users (Role)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Individual user search */}
            {targetType === 'individual' && (
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Search User</Label>
                <div className="relative">
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    placeholder="Search by name or email..."
                    className="bg-secondary/50 border-border h-11 pr-8"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {searching && (
                  <p className="text-xs text-muted-foreground mt-1">Searching...</p>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-border rounded-lg overflow-hidden">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setTargetUserId(user.id);
                          setSearchQuery(user.name || user.email);
                          setSearchResults([]);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-secondary/50 transition-colors flex items-center gap-2 text-sm"
                      >
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name || 'Unnamed'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {targetUserId && (
                  <Badge variant="outline" className="mt-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    User selected
                  </Badge>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title..."
                className="bg-secondary/50 border-border h-11"
              />
            </div>

            {/* Message */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Message *</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Notification message..."
                rows={3}
                className="bg-secondary/50 border-border resize-none"
              />
            </div>

            {/* Type and Link */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full bg-secondary/50 border-border h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Link (optional)</Label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="bg-secondary/50 border-border h-11"
                />
              </div>
            </div>

            {/* Send Email Toggle - only for broadcast/role targets */}
            {targetType !== 'individual' && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                <Checkbox
                  id="send-email"
                  checked={sendEmail}
                  onCheckedChange={(checked) => setSendEmail(checked === true)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <Label htmlFor="send-email" className="text-sm font-medium cursor-pointer">
                    Send email notification to users
                  </Label>
                </div>
              </div>
            )}

            <Button
              onClick={handleSend}
              disabled={sending}
              className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
            >
              {sending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Send Notification</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Sent Notifications History */}
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications sent yet.</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto scrollbar-thin">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                      <TableHead className="font-semibold text-xs">Title</TableHead>
                      <TableHead className="font-semibold text-xs">Type</TableHead>
                      <TableHead className="font-semibold text-xs">Target</TableHead>
                      <TableHead className="font-semibold text-xs">Date</TableHead>
                      <TableHead className="font-semibold text-xs">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((n) => (
                      <TableRow key={n.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-medium text-sm max-w-[120px] truncate">
                          {n.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${typeColors[n.type] || ''}`}>
                            {n.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {n.user_id ? 'Individual' : 'Broadcast'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(n.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(n.id)}
                            disabled={deletingId === n.id}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          >
                            {deletingId === n.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
