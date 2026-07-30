'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Handshake,
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

interface Partnership {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  partnership_type: string;
  message: string | null;
  status: string;
  created_at: string;
}

interface PartnershipsPanelProps {
  token: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

const typeColors: Record<string, string> = {
  technology: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  strategic: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  academic: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  reseller: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
};

export default function PartnershipsPanel({ token }: PartnershipsPanelProps) {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; id: string; action: 'approved' | 'rejected' }>({ open: false, id: '', action: 'approved' });
  const [processing, setProcessing] = useState(false);
  const [viewItem, setViewItem] = useState<Partnership | null>(null);

  const fetchPartnerships = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/partnerships?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPartnerships(data.data || []);
      }
    } catch {
      toast.error('Failed to fetch partnerships.');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    fetchPartnerships();
  }, [fetchPartnerships]);

  const handleAction = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/partnerships', {
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
        toast.success(`Partnership ${confirmDialog.action} successfully.`);
        fetchPartnerships();
      } else {
        toast.error(data.error || 'Failed to update partnership.');
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
            Partnerships
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage partnership applications
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : partnerships.length === 0 ? (
        <div className="text-center py-16">
          <Handshake className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No partnership applications found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerships.map((p) => (
                <TableRow key={p.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium">{p.company_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.contact_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeColors[p.partnership_type] || ''}>
                      {p.partnership_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[p.status] || ''}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewItem(p)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {p.status === 'pending' ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDialog({ open: true, id: p.id, action: 'approved' })}
                            className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmDialog({ open: true, id: p.id, action: 'rejected' })}
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
            <DialogTitle>Partnership Details</DialogTitle>
            <DialogDescription className="sr-only">View partnership application details.</DialogDescription>
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
                  <p className="text-muted-foreground">Type</p>
                  <Badge variant="outline" className={typeColors[viewItem.partnership_type] || ''}>
                    {viewItem.partnership_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusColors[viewItem.status] || ''}>
                    {viewItem.status}
                  </Badge>
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
              {confirmDialog.action === 'approved' ? 'Approve Partnership' : 'Reject Partnership'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmDialog.action === 'approved' ? 'approve' : 'reject'} this partnership application?
              {confirmDialog.action === 'approved'
                ? ' The applicant will be notified of the approval.'
                : ' The applicant will be notified of the rejection.'}
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
