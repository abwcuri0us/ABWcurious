'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Handshake,
  Loader2,
  Trash2,
  Eye,
  Filter,
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
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface PartnershipItem {
  id: string;
  user_id: string;
  organization_name: string;
  partnership_type: string;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user?: { name: string | null; email: string } | null;
}

interface PartnershipsPanelProps {
  token: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  active: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  inactive: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
};

const typeColors: Record<string, string> = {
  strategic: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  technology: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  marketing: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  educational: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  financial: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
};

export default function PartnershipsPanel({ token }: PartnershipsPanelProps) {
  const [partnerships, setPartnerships] = useState<PartnershipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailOpen, setDetailOpen] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchPartnerships = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/partnerships', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPartnerships(data.data);
      }
    } catch {
      toast.error('Failed to fetch partnerships.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPartnerships();
  }, [fetchPartnerships]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/admin/partnerships', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Partnership ${newStatus}.`);
        fetchPartnerships();
      } else {
        toast.error(data.error || 'Failed to update partnership.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partnership request?')) return;
    try {
      const res = await fetch(`/api/admin/partnerships?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Partnership deleted.');
        fetchPartnerships();
      } else {
        toast.error(data.error || 'Failed to delete partnership.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  const filteredPartnerships = partnerships.filter((p) =>
    statusFilter === 'all' ? true : p.status === statusFilter
  );

  // Stats
  const stats = {
    total: partnerships.length,
    pending: partnerships.filter((p) => p.status === 'pending').length,
    approved: partnerships.filter((p) => p.status === 'approved').length,
    active: partnerships.filter((p) => p.status === 'active').length,
    rejected: partnerships.filter((p) => p.status === 'rejected').length,
  };

  const selectedPartnership = partnerships.find((p) => p.id === detailOpen);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            Partnerships
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage partnership requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium">Total</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-amber-500 font-medium">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-emerald-500 font-medium">Approved</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.approved}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-blue-500 font-medium">Active</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.active}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px] bg-secondary/50 border-border h-10">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPartnerships.length === 0 ? (
        <div className="text-center py-16">
          <Handshake className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No partnership requests found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">Organization</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Type</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Submitted By</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Date</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartnerships.map((partnership) => (
                <TableRow key={partnership.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium">{partnership.organization_name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className={typeColors[partnership.partnership_type] || typeColors.other}>
                      {partnership.partnership_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {partnership.user?.name || partnership.user?.email || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={partnership.status}
                      onValueChange={(v) => handleStatusChange(partnership.id, v)}
                      disabled={updating === partnership.id}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        {updating === partnership.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                    {new Date(partnership.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDetailOpen(partnership.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(partnership.id)}
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

      {/* Detail Dialog */}
      <Dialog open={!!detailOpen} onOpenChange={() => setDetailOpen(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" />
              Partnership Details
            </DialogTitle>
          </DialogHeader>
          {selectedPartnership && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Organization</p>
                  <p className="text-sm font-medium mt-0.5">{selectedPartnership.organization_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Partnership Type</p>
                  <Badge variant="outline" className={`${typeColors[selectedPartnership.partnership_type] || typeColors.other} mt-1`}>
                    {selectedPartnership.partnership_type}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Submitted By</p>
                  <p className="text-sm font-medium mt-0.5">{selectedPartnership.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{selectedPartnership.user?.email || selectedPartnership.user_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Status</p>
                  <Badge variant="outline" className={statusColors[selectedPartnership.status] || ''} >
                    {selectedPartnership.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Message</p>
                <div className="mt-1 p-3 rounded-lg bg-secondary/30 text-sm">
                  {selectedPartnership.message || 'No message provided.'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Submitted</p>
                  <p className="text-sm mt-0.5">
                    {new Date(selectedPartnership.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Last Updated</p>
                  <p className="text-sm mt-0.5">
                    {new Date(selectedPartnership.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {/* Quick Actions */}
              <div className="flex gap-2 pt-2 border-t border-border">
                {selectedPartnership.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => { handleStatusChange(selectedPartnership.id, 'approved'); setDetailOpen(null); }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { handleStatusChange(selectedPartnership.id, 'rejected'); setDetailOpen(null); }}
                      className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                    >
                      Reject
                    </Button>
                  </>
                )}
                {selectedPartnership.status === 'approved' && (
                  <Button
                    onClick={() => { handleStatusChange(selectedPartnership.id, 'active'); setDetailOpen(null); }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Activate Partnership
                  </Button>
                )}
                {selectedPartnership.status === 'active' && (
                  <Button
                    variant="outline"
                    onClick={() => { handleStatusChange(selectedPartnership.id, 'inactive'); setDetailOpen(null); }}
                    className="flex-1"
                  >
                    Deactivate
                  </Button>
                )}
                {(selectedPartnership.status === 'rejected' || selectedPartnership.status === 'inactive') && (
                  <Button
                    onClick={() => { handleStatusChange(selectedPartnership.id, 'pending'); setDetailOpen(null); }}
                    className="flex-1"
                  >
                    Reopen Request
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
