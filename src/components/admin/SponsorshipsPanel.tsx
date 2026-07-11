'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Loader2,
  CheckCircle2,
  XCircle,
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Sponsorship {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  sponsorship_level: string;
  event_name: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

interface SponsorshipsPanelProps {
  token: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

const levelColors: Record<string, string> = {
  platinum: 'bg-slate-300/20 text-slate-700 dark:text-slate-200 border-slate-400/30',
  gold: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  silver: 'bg-gray-400/10 text-gray-600 dark:text-gray-300 border-gray-400/20',
  bronze: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
};

export default function SponsorshipsPanel({ token }: SponsorshipsPanelProps) {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; id: string; action: 'approved' | 'rejected' }>({ open: false, id: '', action: 'approved' });
  const [processing, setProcessing] = useState(false);
  const [viewItem, setViewItem] = useState<Sponsorship | null>(null);

  const fetchSponsorships = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (levelFilter !== 'all') params.set('level', levelFilter);
      const res = await fetch(`/api/admin/sponsorships?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSponsorships(data.data || []);
      }
    } catch {
      toast.error('Failed to fetch sponsorships.');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, levelFilter]);

  useEffect(() => {
    fetchSponsorships();
  }, [fetchSponsorships]);

  const handleAction = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/sponsorships', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: confirmDialog.id,
          status: confirmDialog.action,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Sponsorship ${confirmDialog.action} successfully.`);
        fetchSponsorships();
      } else {
        toast.error(data.error || 'Failed to update sponsorship.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setProcessing(false);
      setConfirmDialog({ open: false, id: '', action: 'approved' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            Sponsorships
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage sponsorship applications
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 text-sm bg-secondary/50 border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[130px] h-9 text-sm bg-secondary/50 border-border">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sponsorships.length === 0 ? (
        <div className="text-center py-16">
          <Award className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No sponsorship applications found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Level</TableHead>
                <TableHead className="font-semibold">Event</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sponsorships.map((s) => (
                <TableRow key={s.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium">{s.company_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.contact_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={levelColors[s.sponsorship_level] || ''}>
                      {s.sponsorship_level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.event_name || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[s.status] || ''}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewItem(s)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {s.status === 'pending' ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDialog({ open: true, id: s.id, action: 'approved' })}
                            className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDialog({ open: true, id: s.id, action: 'rejected' })}
                            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
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
            <DialogTitle>Sponsorship Details</DialogTitle>
            <DialogDescription className="sr-only">View sponsorship application details.</DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Company</p>
                  <p className="font-medium">{viewItem.company_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Contact</p>
                  <p className="font-medium">{viewItem.contact_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{viewItem.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewItem.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <Badge variant="outline" className={levelColors[viewItem.sponsorship_level] || ''}>
                    {viewItem.sponsorship_level}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusColors[viewItem.status] || ''}>
                    {viewItem.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Event</p>
                  <p className="font-medium">{viewItem.event_name || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">{new Date(viewItem.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {viewItem.message && (
                <div>
                  <p className="text-muted-foreground">Message</p>
                  <p className="mt-1 whitespace-pre-wrap bg-secondary/30 rounded-lg p-3">{viewItem.message}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === 'approved' ? 'Approve Sponsorship' : 'Reject Sponsorship'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmDialog.action === 'approved' ? 'approve' : 'reject'} this sponsorship application?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing}
              className={confirmDialog.action === 'approved'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'}
            >
              {processing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                confirmDialog.action === 'approved' ? 'Approve' : 'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
