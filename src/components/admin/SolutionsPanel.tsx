'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Lightbulb,
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

interface SolutionItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  user?: { name: string | null; email: string } | null;
}

interface SolutionsPanelProps {
  token: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'in-progress': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

const typeColors: Record<string, string> = {
  consulting: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  development: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  training: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
  audit: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  support: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
};

export default function SolutionsPanel({ token }: SolutionsPanelProps) {
  const [solutions, setSolutions] = useState<SolutionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailOpen, setDetailOpen] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchSolutions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/solutions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSolutions(data.data);
      }
    } catch {
      toast.error('Failed to fetch solutions.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/admin/solutions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Solution marked as ${newStatus}.`);
        fetchSolutions();
      } else {
        toast.error(data.error || 'Failed to update solution.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this solution request?')) return;
    try {
      const res = await fetch(`/api/admin/solutions?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Solution deleted.');
        fetchSolutions();
      } else {
        toast.error(data.error || 'Failed to delete solution.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  const filteredSolutions = solutions.filter((s) =>
    statusFilter === 'all' ? true : s.status === statusFilter
  );

  // Stats
  const stats = {
    total: solutions.length,
    pending: solutions.filter((s) => s.status === 'pending').length,
    inProgress: solutions.filter((s) => s.status === 'in-progress').length,
    completed: solutions.filter((s) => s.status === 'completed').length,
    cancelled: solutions.filter((s) => s.status === 'cancelled').length,
  };

  const selectedSolution = solutions.find((s) => s.id === detailOpen);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            Service Offerings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage solution/service requests
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
          <p className="text-xs text-blue-500 font-medium">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-emerald-500 font-medium">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completed}</p>
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
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSolutions.length === 0 ? (
        <div className="text-center py-16">
          <Lightbulb className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No solution requests found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Type</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Requested By</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Date</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSolutions.map((solution) => (
                <TableRow key={solution.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="truncate">{solution.title}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className={typeColors[solution.type] || typeColors.other}>
                      {solution.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {solution.user?.name || solution.user?.email || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={solution.status}
                      onValueChange={(v) => handleStatusChange(solution.id, v)}
                      disabled={updating === solution.id}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        {updating === solution.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                    {new Date(solution.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDetailOpen(solution.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(solution.id)}
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
              <Lightbulb className="h-5 w-5 text-primary" />
              Solution Details
            </DialogTitle>
          </DialogHeader>
          {selectedSolution && (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Title</p>
                <p className="text-sm font-medium mt-0.5">{selectedSolution.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Type</p>
                  <Badge variant="outline" className={`${typeColors[selectedSolution.type] || typeColors.other} mt-1`}>
                    {selectedSolution.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Status</p>
                  <Badge variant="outline" className={statusColors[selectedSolution.status] || ''}>
                    {selectedSolution.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Requested By</p>
                <p className="text-sm font-medium mt-0.5">{selectedSolution.user?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{selectedSolution.user?.email || selectedSolution.user_id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Description</p>
                <div className="mt-1 p-3 rounded-lg bg-secondary/30 text-sm">
                  {selectedSolution.description || 'No description provided.'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Submitted</p>
                  <p className="text-sm mt-0.5">
                    {new Date(selectedSolution.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Last Updated</p>
                  <p className="text-sm mt-0.5">
                    {new Date(selectedSolution.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {/* Quick Actions */}
              <div className="flex gap-2 pt-2 border-t border-border">
                {selectedSolution.status === 'pending' && (
                  <Button
                    onClick={() => { handleStatusChange(selectedSolution.id, 'in-progress'); setDetailOpen(null); }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Start Working
                  </Button>
                )}
                {selectedSolution.status === 'in-progress' && (
                  <>
                    <Button
                      onClick={() => { handleStatusChange(selectedSolution.id, 'completed'); setDetailOpen(null); }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Mark Completed
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { handleStatusChange(selectedSolution.id, 'cancelled'); setDetailOpen(null); }}
                      className="flex-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {selectedSolution.status === 'completed' && (
                  <Button
                    onClick={() => { handleStatusChange(selectedSolution.id, 'pending'); setDetailOpen(null); }}
                    className="flex-1"
                  >
                    Reopen
                  </Button>
                )}
                {selectedSolution.status === 'cancelled' && (
                  <Button
                    onClick={() => { handleStatusChange(selectedSolution.id, 'pending'); setDetailOpen(null); }}
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
