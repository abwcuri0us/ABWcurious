'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  CalendarDays,
  Loader2,
  Users,
  Eye,
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  end_date: string | null;
  location: string | null;
  type: string;
  capacity: number | null;
  image_url: string | null;
  registration_url: string | null;
  is_active: boolean;
  registration_count?: number;
  created_at: string;
  updated_at: string;
}

interface EventParticipant {
  id: string;
  user_id: string | null;
  status: string;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  profile?: { id: string; name: string | null; email: string | null } | null;
}

interface EventsPanelProps {
  token: string;
}

const eventTypeColors: Record<string, string> = {
  webinar: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  conference: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  workshop: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  meetup: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  training: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

const emptyForm = {
  title: '',
  description: '',
  date: '',
  end_date: '',
  location: '',
  type: 'webinar' as string,
  capacity: '',
  registration_url: '',
  image_url: '',
  is_active: true,
};

export default function EventsPanel({ token }: EventsPanelProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [participantsEvent, setParticipantsEvent] = useState<EventItem | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data || []);
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
      end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
      location: event.location || '',
      type: event.type,
      capacity: event.capacity ? String(event.capacity) : '',
      registration_url: event.registration_url || '',
      image_url: event.image_url || '',
      is_active: event.is_active,
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
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
        location: form.location || undefined,
        type: form.type,
        capacity: form.capacity ? parseInt(form.capacity, 10) : undefined,
        registration_url: form.registration_url || undefined,
        image_url: form.image_url || undefined,
        is_active: form.is_active,
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

  const handleToggleActive = async (event: EventItem) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: event.id, is_active: !event.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(event.is_active ? 'Event deactivated.' : 'Event activated.');
        fetchEvents();
      } else {
        toast.error(data.error || 'Failed to update event.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  const openParticipants = async (event: EventItem) => {
    setParticipantsEvent(event);
    setParticipantsOpen(true);
    setParticipants([]);
    setParticipantsLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations?event_id=${event.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setParticipants(data.data || []);
      } else {
        toast.error(data.error || 'Failed to fetch participants.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setParticipantsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Registrations</TableHead>
                <TableHead className="font-semibold">Active</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={eventTypeColors[event.type] || ''}>
                      {event.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {event.location || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">
                        {event.registration_count ?? 0}
                      </span>
                      {event.capacity && (
                        <span className="text-muted-foreground">/ {event.capacity}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={event.is_active}
                      onCheckedChange={() => handleToggleActive(event)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openParticipants(event)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        title="View participants"
                        aria-label="View participants"
                      >
                        <Eye className="h-4 w-4" />
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
            <DialogDescription className="sr-only">
              {editingId ? 'Edit an existing event.' : 'Create a new event.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Title *</Label>
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
                <Label className="text-sm font-medium mb-1.5 block">Start Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="bg-secondary/50 border-border h-11"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                  className="bg-secondary/50 border-border h-11"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Capacity</Label>
                <Input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  placeholder="Max attendees"
                  className="bg-secondary/50 border-border h-11"
                />
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
                value={form.registration_url}
                onChange={(e) => setForm((f) => ({ ...f, registration_url: e.target.value }))}
                placeholder="https://..."
                className="bg-secondary/50 border-border h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Image URL</Label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://..."
                className="bg-secondary/50 border-border h-11"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
              <Label className="text-sm font-medium">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" /> {editingId ? 'Update' : 'Create'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Participants Dialog */}
      <Dialog open={participantsOpen} onOpenChange={setParticipantsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Participants
            </DialogTitle>
            <DialogDescription className="sr-only">
              View registered participants for this event.
            </DialogDescription>
          </DialogHeader>
          {participantsEvent && (
            <div className="text-sm text-muted-foreground -mt-2 mb-2">
              <span className="font-medium text-foreground">{participantsEvent.title}</span>
              {' — '}
              {new Date(participantsEvent.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              {participantsEvent.location && ` · ${participantsEvent.location}`}
            </div>
          )}
          {participantsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No registrations yet for this event.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Phone</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((p) => (
                    <TableRow key={p.id} className="hover:bg-secondary/20">
                      <TableCell className="font-medium">
                        {p.profile?.name || p.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.profile?.email || p.email || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                        {p.phone || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {new Date(p.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setParticipantsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
