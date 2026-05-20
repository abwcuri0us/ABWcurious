'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  CalendarDays,
  Loader2,
  Users as UsersIcon,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  type: string;
  registration_url: string | null;
  is_registration_open: boolean;
  max_registrations: number | null;
  created_at: string;
  updated_at: string;
}

interface Registration {
  id: string;
  user_id: string;
  created_at: string;
  user?: { name: string | null; email: string } | null;
}

interface EventsPanelProps {
  token: string;
}

const eventTypeColors: Record<string, string> = {
  webinar: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  conference: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  workshop: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  meetup: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

const emptyForm = {
  title: '',
  description: '',
  date: '',
  location: '',
  type: 'webinar' as string,
  registrationUrl: '',
  isRegistrationOpen: true,
  maxRegistrations: '',
};

export default function EventsPanel({ token }: EventsPanelProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [registrationsOpen, setRegistrationsOpen] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [newsletterEventId, setNewsletterEventId] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [sendingNewsletter, setSendingNewsletter] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch {
      toast.error('Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (event: EventItem) => {
    setForm({
      title: event.title,
      description: event.description || '',
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      location: event.location || '',
      type: event.type,
      registrationUrl: event.registration_url || '',
      isRegistrationOpen: event.is_registration_open,
      maxRegistrations: event.max_registrations?.toString() || '',
    });
    setEditingId(event.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required.');
      return;
    }
    if (!form.date) {
      toast.error('Date is required.');
      return;
    }

    setSaving(true);
    try {
      const body = {
        ...(editingId ? { id: editingId } : {}),
        title: form.title,
        description: form.description || undefined,
        date: new Date(form.date).toISOString(),
        location: form.location || undefined,
        type: form.type,
        registration_url: form.registrationUrl || null,
        is_registration_open: form.isRegistrationOpen,
        max_registrations: form.maxRegistrations ? parseInt(form.maxRegistrations) : null,
      };

      const res = await fetch('/api/admin/events', {
        method: editingId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'Event updated.' : 'Event created.');
        setDialogOpen(false);
        fetchEvents();
      } else {
        toast.error(data.error || 'Failed to save event.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Event deleted.');
        fetchEvents();
      } else {
        toast.error(data.error || 'Failed to delete event.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    setLoadingRegs(true);
    try {
      const res = await fetch(`/api/admin/events/registrations?eventId=${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data);
      }
    } catch {
      toast.error('Failed to load registrations.');
    } finally {
      setLoadingRegs(false);
    }
  };

  const openRegistrations = (eventId: string) => {
    setRegistrationsOpen(eventId);
    fetchRegistrations(eventId);
  };

  const openNewsletter = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    setNewsletterEventId(eventId);
    setNewsletterMessage(`New event: ${event?.title || ''} - ${event?.date ? new Date(event.date).toLocaleDateString() : ''}. Register now!`);
    setNewsletterOpen(true);
  };

  const handleSendNewsletter = async () => {
    if (!newsletterMessage.trim()) {
      toast.error('Message cannot be empty.');
      return;
    }
    setSendingNewsletter(true);
    try {
      const res = await fetch('/api/admin/newsletters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newsletterMessage, eventId: newsletterEventId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Notification sent to all users.');
        setNewsletterOpen(false);
      } else {
        toast.error(data.error || 'Failed to send notification.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setSendingNewsletter(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            Events & Webinars
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage upcoming events and webinars
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No events yet. Create your first event!</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Date</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Location</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Registration</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={eventTypeColors[event.type] || ''}>
                      {event.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {event.location || '—'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant={event.is_registration_open ? 'default' : 'secondary'} className={event.is_registration_open ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'}>
                      {event.is_registration_open ? 'Open' : 'Closed'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openRegistrations(event.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        title="View registrations"
                      >
                        <UsersIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openNewsletter(event.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-amber-500"
                        title="Send notification"
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(event)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              {editingId ? 'Edit Event' : 'Create Event'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Event title"
                className="bg-secondary/50 border-border h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Event description..."
                rows={3}
                className="bg-secondary/50 border-border resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="bg-secondary/50 border-border h-11"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                >
                  <SelectTrigger className="w-full bg-secondary/50 border-border h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Virtual / City, Country"
                className="bg-secondary/50 border-border h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Registration URL</Label>
              <Input
                value={form.registrationUrl}
                onChange={(e) => setForm((f) => ({ ...f, registrationUrl: e.target.value }))}
                placeholder="https://..."
                className="bg-secondary/50 border-border h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.isRegistrationOpen}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isRegistrationOpen: v }))}
                />
                <Label className="text-sm font-medium">Registration Open</Label>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Max Registrations</Label>
                <Input
                  type="number"
                  value={form.maxRegistrations}
                  onChange={(e) => setForm((f) => ({ ...f, maxRegistrations: e.target.value }))}
                  placeholder="Unlimited"
                  className="bg-secondary/50 border-border h-11"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
            >
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Plus className="h-4 w-4 mr-2" /> {editingId ? 'Update' : 'Create'}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Registrations Dialog */}
      <Dialog open={!!registrationsOpen} onOpenChange={() => setRegistrationsOpen(null)}>
        <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              Registered Users
            </DialogTitle>
          </DialogHeader>
          {loadingRegs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : registrations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No registrations yet.</p>
          ) : (
            <div className="space-y-2">
              {registrations.map((reg) => (
                <div key={reg.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {(reg.user?.name || reg.user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{reg.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate">{reg.user?.email || reg.user_id}</p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto shrink-0">
                    {new Date(reg.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Newsletter/Notification Dialog */}
      <Dialog open={newsletterOpen} onOpenChange={setNewsletterOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Send Notification
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will create a notification for all users about this event.
          </p>
          <Textarea
            value={newsletterMessage}
            onChange={(e) => setNewsletterMessage(e.target.value)}
            rows={3}
            className="bg-secondary/50 border-border resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewsletterOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSendNewsletter}
              disabled={sendingNewsletter}
              className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
            >
              {sendingNewsletter ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : <><Bell className="h-4 w-4 mr-2" /> Send</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
