'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Briefcase,
  Loader2,
  FileCheck,
  Eye,
  ExternalLink,
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

interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string | null;
  salary_range: string | null;
  is_active: boolean;
  application_count?: number;
  created_at: string;
  updated_at: string;
}

interface CareerApplicant {
  id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  resume_url: string | null;
  cover_letter: string | null;
  status: string;
  created_at: string;
  profile?: { id: string; name: string | null; email: string | null } | null;
}

interface CareersPanelProps {
  token: string;
}

const careerTypeColors: Record<string, string> = {
  'full-time': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'part-time': 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  internship: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  contract: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

const emptyForm = {
  title: '',
  department: '',
  location: '',
  type: 'full-time' as string,
  description: '',
  requirements: '',
  salary_range: '',
  is_active: true,
};

export default function CareersPanel({ token }: CareersPanelProps) {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [applicantsOpen, setApplicantsOpen] = useState(false);
  const [applicantsCareer, setApplicantsCareer] = useState<Career | null>(null);
  const [applicants, setApplicants] = useState<CareerApplicant[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  const fetchCareers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/careers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCareers(data.data || []);
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
      salary_range: career.salary_range || '',
      is_active: career.is_active,
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
      const body = {
        ...(editingId ? { id: editingId } : {}),
        title: form.title,
        department: form.department,
        location: form.location,
        type: form.type,
        description: form.description,
        requirements: form.requirements || undefined,
        salary_range: form.salary_range || undefined,
        is_active: form.is_active,
      };

      const res = await fetch('/api/admin/careers', {
        method: editingId ? 'PATCH' : 'POST',
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
        body: JSON.stringify({ id: career.id, is_active: !career.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(career.is_active ? 'Career deactivated.' : 'Career activated.');
        fetchCareers();
      } else {
        toast.error(data.error || 'Failed to update career.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  const openApplicants = async (career: Career) => {
    setApplicantsCareer(career);
    setApplicantsOpen(true);
    setApplicants([]);
    setApplicantsLoading(true);
    try {
      const res = await fetch(`/api/admin/applications?career_id=${career.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setApplicants(data.data || []);
      } else {
        toast.error(data.error || 'Failed to fetch applicants.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setApplicantsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Salary</TableHead>
                <TableHead className="font-semibold">Applications</TableHead>
                <TableHead className="font-semibold">Active</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {careers.map((career) => (
                <TableRow key={career.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium">{career.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{career.department}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{career.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={careerTypeColors[career.type] || ''}>
                      {career.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {career.salary_range || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{career.application_count ?? 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={career.is_active}
                      onCheckedChange={() => handleToggleActive(career)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openApplicants(career)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        title="View applicants"
                        aria-label="View applicants"
                      >
                        <Eye className="h-4 w-4" />
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
            <DialogDescription className="sr-only">
              {editingId ? 'Edit an existing career listing.' : 'Create a new career listing.'}
            </DialogDescription>
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
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Salary Range</Label>
                <Input
                  value={form.salary_range}
                  onChange={(e) => setForm((f) => ({ ...f, salary_range: e.target.value }))}
                  placeholder="₹10L - ₹20L"
                  className="bg-secondary/50 border-border h-11"
                />
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

      {/* View Applicants Dialog */}
      <Dialog open={applicantsOpen} onOpenChange={setApplicantsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Applicants
            </DialogTitle>
            <DialogDescription className="sr-only">
              View applicants for this career listing.
            </DialogDescription>
          </DialogHeader>
          {applicantsCareer && (
            <div className="text-sm text-muted-foreground -mt-2 mb-2">
              <span className="font-medium text-foreground">{applicantsCareer.title}</span>
              {' — '}
              {applicantsCareer.department}
              {applicantsCareer.location && ` · ${applicantsCareer.location}`}
            </div>
          )}
          {applicantsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No applications yet for this listing.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Resume</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Applied</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.map((a) => (
                    <TableRow key={a.id} className="hover:bg-secondary/20">
                      <TableCell className="font-medium">
                        {a.profile?.name || a.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.profile?.email || a.email || '—'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {a.resume_url ? (
                          <a
                            href={a.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            Resume <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {new Date(a.created_at).toLocaleDateString('en-US', {
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
            <Button variant="outline" onClick={() => setApplicantsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
