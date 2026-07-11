'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquareWarning,
  Loader2,
  Trash2,
  Star,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface FeedbackItem {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  rating: number | null;
  status: string;
  created_at: string;
}

interface FeedbackPanelProps {
  token: string;
}

const statusColors: Record<string, string> = {
  open: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  new: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  read: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  in_progress: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  resolved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  closed: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
};

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-muted-foreground">No rating</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

export default function FeedbackPanel({ token }: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; subject: string } | null>(null);
  const [viewItem, setViewItem] = useState<FeedbackItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<FeedbackItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/feedback', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(data.data || []);
      }
    } catch {
      toast.error('Failed to fetch feedback.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Feedback status updated.');
        fetchFeedback();
      } else {
        toast.error(data.error || 'Failed to update status.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReply = async () => {
    if (!replyTarget || !replyText.trim()) {
      toast.error('Reply text is required.');
      return;
    }
    setReplying(true);
    try {
      // Mark as read when replying
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: replyTarget.id, status: replyTarget.status === 'new' ? 'read' : replyTarget.status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Feedback marked as read.');
        setReplyOpen(false);
        setReplyTarget(null);
        setReplyText('');
        fetchFeedback();
      } else {
        toast.error(data.error || 'Failed to update feedback.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteDialogOpen(false);
    try {
      const res = await fetch(`/api/admin/feedback?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Feedback deleted.');
        fetchFeedback();
      } else {
        toast.error(data.error || 'Failed to delete feedback.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = feedback.filter((f) => {
    const matchesSearch =
      !search ||
      (f.subject && f.subject.toLowerCase().includes(search.toLowerCase())) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const newCount = feedback.filter((f) => f.status === 'new').length;
  const avgRating = feedback.length > 0
    ? (feedback.reduce((acc, f) => acc + (f.rating || 0), 0) / feedback.filter((f) => f.rating).length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
          Feedback
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review and respond to user feedback
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquareWarning className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{feedback.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MessageSquareWarning className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{newCount}</p>
              <p className="text-xs text-muted-foreground">New</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgRating}</p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <MessageSquareWarning className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{feedback.filter((f) => f.status === 'resolved').length}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject, message, name, email..."
            className="pl-9 bg-secondary/50 border-border h-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px] bg-secondary/50 border-border h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquareWarning className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No feedback found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">Subject</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">From</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Rating</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {item.subject || item.message.slice(0, 40) + '...'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs">{item.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <StarRating rating={item.rating} />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.status}
                      onValueChange={(value) => handleStatusUpdate(item.id, value)}
                      disabled={updatingId === item.id}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewItem(item)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        aria-label="View details"
                        title="View details"
                      >
                        <MessageSquareWarning className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setReplyTarget(item); setReplyText(''); setReplyOpen(true); }}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        aria-label="Reply"
                        title="Reply"
                      >
                        <MessageSquareWarning className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setDeleteTarget({ id: item.id, subject: item.subject || item.message.slice(0, 30) }); setDeleteDialogOpen(true); }}
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

      {/* View Details Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(open) => { if (!open) setViewItem(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareWarning className="h-5 w-5 text-primary" />
              Feedback Details
            </DialogTitle>
            <DialogDescription className="sr-only">View feedback details.</DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 py-2">
              <div className="space-y-2 bg-secondary/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className={`text-xs ${statusColors[viewItem.status] || ''}`}>
                    {viewItem.status}
                  </Badge>
                  <StarRating rating={viewItem.rating} />
                </div>
                {viewItem.subject && <p className="font-medium text-foreground">{viewItem.subject}</p>}
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewItem.message}</p>
                <p className="text-xs text-muted-foreground">From: {viewItem.name} ({viewItem.email})</p>
                <p className="text-xs text-muted-foreground">
                  Submitted: {new Date(viewItem.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareWarning className="h-5 w-5 text-primary" />
              Respond to Feedback
            </DialogTitle>
            <DialogDescription className="sr-only">
              Respond to user feedback and update status.
            </DialogDescription>
          </DialogHeader>
          {replyTarget && (
            <div className="space-y-4 py-2">
              <div className="space-y-2 bg-secondary/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className={`text-xs ${statusColors[replyTarget.status] || ''}`}>
                    {replyTarget.status}
                  </Badge>
                  <StarRating rating={replyTarget.rating} />
                </div>
                {replyTarget.subject && <p className="font-medium text-foreground text-sm">{replyTarget.subject}</p>}
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{replyTarget.message}</p>
                <p className="text-xs text-muted-foreground">From: {replyTarget.name} ({replyTarget.email})</p>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Internal Notes</Label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Add internal notes about this feedback..."
                  rows={4}
                  className="bg-secondary/50 border-border resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleStatusUpdate(replyTarget.id, 'read')}
                  disabled={replyTarget.status === 'read' || replying}
                  variant="outline"
                  size="sm"
                >
                  Mark as Read
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(replyTarget.id, 'resolved')}
                  disabled={replyTarget.status === 'resolved' || replying}
                  variant="outline"
                  size="sm"
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  Mark Resolved
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feedback? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
