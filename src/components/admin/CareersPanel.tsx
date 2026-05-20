'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Briefcase,
  Loader2,
  Users as UsersIcon,
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

interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Application {
  id: string;
  user_id: string;
  resume_url: string | null;
  cover_letter: string | null;
  status: string;
  created_at: string;
  user?: { name: string | null; email: string } | null;
}

interface CareersPanelProps {
  token: string;
}

const careerTypeColors: Record<string, string> = {
  'full-time': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'part-time': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  internship: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  contract: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

const applicationStatusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  reviewed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  shortlisted: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

const emptyForm = {
  title: '',
  department: '',
  location: '',
  type: 'full-time' as string,
  description: '',
  requirements: '',
  isActive: true,
};

export default function CareersPanel({ token }: CareersPanelProps) {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [applicationsOpen, setApplicationsOpen] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  const fetchCareers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/careers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCareers(data.data);
      }
    } catch {
      toast.error('Failed to fetch careers.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCareers();
  }, [fetchCareers]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (career: Career) => {
    setForm({
      title: career.title,
      department: career.department,
      location: career.location,
      type: career.type,
      description: career.description,
      requirements: career.requirements || '',
      isActive: career.isActive,
    });
    setEditingId(career.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.department.trim() || !form.location.trim() || !form.description.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/careers';
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
        toast.success(editingId ? 'Career updated.' : 'Career created.');
        setDialogOpen(false);
        fetchCareers();
      } else {
        toast.error(data.error || 'Failed to save career.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this career listing?')) return;
    try {
      const res = await fetch(`/api/admin/careers?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Career deleted.');
        fetchCareers();
      } else {
        toast.error(data.error || 'Failed to delete career.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  const handleToggleActive = async (career: Career) => {
    try {
      const res = await fetch('/api/admin/careers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: career.id, is_active: !career.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(career.isActive ? 'Career deactivated.' : 'Career activated.');
        fetchCareers();
      } else {
        toast.error(data.error || 'Failed to update career.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  const fetchApplications = async (careerId: string) => {
    setLoadingApps(true);
    try {
      const res = await fetch(`/api/admin/careers/applications?careerId=${careerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.data);
      }
    } catch {
      toast.error('Failed to load applications.');
    } finally {
      setLoadingApps(false);
    }
  };

  const openApplications = (careerId: string) => {
    setApplicationsOpen(careerId);
    fetchApplications(careerId);
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/careers/applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Application status updated.');
        if (applicationsOpen) fetchApplications(applicationsOpen);
      } else {
        toast.error(data.error || 'Failed to update status.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            Careers
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage job listings and career opportunities
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Listing
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : careers.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No career listings yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Department</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Location</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Active</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {careers.map((career) => (
                <TableRow key={career.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium">{career.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">{career.department}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{career.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={careerTypeColors[career.type] || ''}>
                      {career.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={career.isActive}
                      onCheckedChange={() => handleToggleActive(career)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openApplications(career.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        title="View applications"
                      >
                        <UsersIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(career)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(career.id)}
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
              <Briefcase className="h-5 w-5 text-primary" />
              {editingId ? 'Edit Career Listing' : 'Create Career Listing'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Senior Developer"
                className="bg-secondary/50 border-border h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Department *</Label>
                <Input
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  placeholder="Engineering"
                  className="bg-secondary/50 border-border h-11"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Location *</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Mumbai, India"
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
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                />
                <Label className="text-sm font-medium">Active</Label>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Job description..."
                rows={4}
                className="bg-secondary/50 border-border resize-none"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Requirements</Label>
              <Textarea
                value={form.requirements}
                onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                placeholder="List requirements..."
                rows={3}
                className="bg-secondary/50 border-border resize-none"
              />
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

      {/* Applications Dialog */}
      <Dialog open={!!applicationsOpen} onOpenChange={() => setApplicationsOpen(null)}>
        <DialogContent className="sm:max-w-lg max-h-[75vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              Applications
            </DialogTitle>
          </DialogHeader>
          {loadingApps ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                    {(app.user?.name || app.user?.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{app.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate">{app.user?.email || app.user_id}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Applied: {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Select
                    value={app.status}
                    onValueChange={(v) => handleUpdateApplicationStatus(app.id, v)}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
