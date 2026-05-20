'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Activity,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wrench,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface StatusItem {
  id: string;
  service: string;
  status: string;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

interface StatusPanelProps {
  token: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  operational: {
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
    label: 'Operational',
  },
  degraded: {
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: AlertTriangle,
    label: 'Degraded',
  },
  outage: {
    color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    icon: XCircle,
    label: 'Outage',
  },
  maintenance: {
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: Wrench,
    label: 'Maintenance',
  },
};

const emptyForm = {
  service: '',
  status: 'operational' as string,
  message: '',
};

export default function StatusPanel({ token }: StatusPanelProps) {
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchStatuses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStatuses(data.data);
      }
    } catch {
      toast.error('Failed to fetch status updates.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (status: StatusItem) => {
    setForm({
      service: status.service,
      status: status.status,
      message: status.message || '',
    });
    setEditingId(status.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.service.trim()) {
      toast.error('Service name is required.');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/status';
      const method = editingId ? 'PATCH' : 'POST';
      const body = editingId
        ? { id: editingId, ...form }
        : form;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'Status updated.' : 'Status created.');
        setDialogOpen(false);
        fetchStatuses();
      } else {
        toast.error(data.error || 'Failed to save status.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this status entry?')) return;
    try {
      const res = await fetch(`/api/admin/status?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Status deleted.');
        fetchStatuses();
      } else {
        toast.error(data.error || 'Failed to delete status.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  // Compute summary stats
  const stats = {
    operational: statuses.filter((s) => s.status === 'operational').length,
    degraded: statuses.filter((s) => s.status === 'degraded').length,
    outage: statuses.filter((s) => s.status === 'outage').length,
    maintenance: statuses.filter((s) => s.status === 'maintenance').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            Status Page
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor service health and manage status updates
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Status
        </Button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = stats[key as keyof typeof stats] || 0;
          return (
            <Card key={key} className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.color.split(' ').slice(0, 1).join(' ')}`}>
                  <Icon className={`h-5 w-5 ${config.color.split(' ')[1]}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : statuses.length === 0 ? (
        <div className="text-center py-16">
          <Activity className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No status entries yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">Service</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Message</TableHead>
                <TableHead className="font-semibold">Updated</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.map((status) => {
                const config = statusConfig[status.status] || statusConfig.operational;
                const StatusIcon = config.icon;
                return (
                  <TableRow key={status.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-medium">{status.service}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`flex items-center gap-1.5 w-fit ${config.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                      {status.message || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(status.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(status)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(status.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {editingId ? 'Edit Status' : 'Create Status Update'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Service Name *</Label>
              <Input
                value={form.service}
                onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                placeholder="e.g., Web Application, API Gateway"
                className="bg-secondary/50 border-border h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger className="w-full bg-secondary/50 border-border h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Operational
                    </span>
                  </SelectItem>
                  <SelectItem value="degraded">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Degraded
                    </span>
                  </SelectItem>
                  <SelectItem value="outage">
                    <span className="flex items-center gap-2">
                      <XCircle className="h-3.5 w-3.5 text-red-500" /> Outage
                    </span>
                  </SelectItem>
                  <SelectItem value="maintenance">
                    <span className="flex items-center gap-2">
                      <Wrench className="h-3.5 w-3.5 text-blue-500" /> Maintenance
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Message</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Status update message..."
                rows={3}
                className="bg-secondary/50 border-border resize-none"
              />
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
    </div>
  );
}
