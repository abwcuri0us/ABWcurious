'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TicketCheck,
  Loader2,
  Filter,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  created_at: string;
  event: { id: string; title: string; date: string; location: string | null; type: string } | null;
  profile: { id: string; name: string | null; email: string } | null;
}

interface RegistrationsPanelProps {
  token: string;
}

const statusColors: Record<string, string> = {
  registered: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  attended: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

export default function RegistrationsPanel({ token }: RegistrationsPanelProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<Registration | null>(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/registrations?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data || []);
      }
    } catch {
      toast.error('Failed to fetch registrations.');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Registration status updated.');
        fetchRegistrations();
      } else {
        toast.error(data.error || 'Failed to update registration.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            Event Registrations
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage event registrations and attendance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-sm bg-secondary/50 border-border">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="registered">Registered</SelectItem>
              <SelectItem value="attended">Attended</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-16">
          <TicketCheck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No event registrations found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Event</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Registered</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => (
                <TableRow key={reg.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium">
                    {reg.profile?.name || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {reg.profile?.email || '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {reg.event?.title || 'Unknown Event'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[reg.status] || ''}>
                      {reg.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(reg.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewItem(reg)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        value={reg.status}
                        onValueChange={(value) => handleUpdateStatus(reg.id, value)}
                        disabled={updatingId === reg.id}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="registered">Registered</SelectItem>
                          <SelectItem value="attended">Attended</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(open) => { if (!open) setViewItem(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TicketCheck className="h-5 w-5 text-primary" />
              Registration Details
            </DialogTitle>
            <DialogDescription className="sr-only">View registration details.</DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">User</p>
                  <p className="font-medium">{viewItem.profile?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{viewItem.profile?.email || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Event</p>
                  <p className="font-medium">{viewItem.event?.title || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Event Date</p>
                  <p className="font-medium">
                    {viewItem.event?.date ? new Date(viewItem.event.date).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{viewItem.event?.location || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusColors[viewItem.status] || ''}>
                    {viewItem.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Registered</p>
                  <p className="font-medium">{new Date(viewItem.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
