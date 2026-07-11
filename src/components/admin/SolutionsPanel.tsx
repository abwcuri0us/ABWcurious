'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Solution {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  tagline: string | null;
  description: string | null;
  features: string[] | null;
  pricing: string | null;
  demo_url: string | null;
  is_active: boolean;
  // Submission-related fields
  solution_type: string | null;
  budget: string | null;
  timeline: string | null;
  status: string | null;
  email: string | null;
  phone: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface SolutionsPanelProps {
  token: string;
}

const statusColors: Record<string, string> = {
  submitted: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  in_review: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  in_progress: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

const emptyForm = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  features: '',
  pricing: '',
  demo_url: '',
  is_active: true,
};

export default function SolutionsPanel({ token }: SolutionsPanelProps) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [viewItem, setViewItem] = useState<Solution | null>(null);

  const fetchSolutions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/solutions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSolutions(data.data || []);
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

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (solution: Solution) => {
    setForm({
      name: solution.name || solution.title || '',
      slug: solution.slug || '',
      tagline: solution.tagline || '',
      description: solution.description || '',
      features: Array.isArray(solution.features) ? solution.features.join(', ') : '',
      pricing: solution.pricing || '',
      demo_url: solution.demo_url || '',
      is_active: solution.is_active,
    });
    setEditingId(solution.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required.');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('Slug is required.');
      return;
    }

    setSaving(true);
    try {
      const featuresArray = form.features
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const body = {
        ...(editingId ? { id: editingId } : {}),
        name: form.name,
        slug: form.slug,
        tagline: form.tagline || undefined,
        description: form.description || undefined,
        features: featuresArray.length > 0 ? featuresArray : undefined,
        pricing: form.pricing || undefined,
        demo_url: form.demo_url || undefined,
        is_active: form.is_active,
      };

      const res = await fetch('/api/admin/solutions', {
        method: editingId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'Solution updated.' : 'Solution created.');
        setDialogOpen(false);
        fetchSolutions();
      } else {
        toast.error(data.error || 'Failed to save solution.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this solution?')) return;
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

  const handleToggleActive = async (solution: Solution) => {
    try {
      const res = await fetch('/api/admin/solutions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: solution.id, is_active: !solution.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(solution.is_active ? 'Solution deactivated.' : 'Solution activated.');
        fetchSolutions();
      } else {
        toast.error(data.error || 'Failed to update solution.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            Solutions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage solution catalog and review user-submitted solution requests
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Solution
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : solutions.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No solutions yet. Create your first solution!</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Type</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Budget</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Timeline</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Active</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solutions.map((solution) => (
                <TableRow key={solution.id} className="hover:bg-secondary/20 transition-colors">
                  <TableCell className="font-medium">
                    {solution.name || solution.title || 'Untitled'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {solution.solution_type ? (
                      <Badge variant="outline" className="text-xs capitalize">
                        {solution.solution_type.replace(/_/g, ' ')}
                      </Badge>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                    {solution.budget || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                    {solution.timeline || '—'}
                  </TableCell>
                  <TableCell>
                    {solution.status ? (
                      <Badge variant="outline" className={`text-xs capitalize ${statusColors[solution.status] || ''}`}>
                        {solution.status.replace(/_/g, ' ')}
                      </Badge>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={solution.is_active}
                      onCheckedChange={() => handleToggleActive(solution)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewItem(solution)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="View details"
                        aria-label="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {solution.demo_url && (
                        <a
                          href={solution.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                          title="Open demo URL"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(solution)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Edit3 className="h-4 w-4" />
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {editingId ? 'Edit Solution' : 'Create Solution'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingId ? 'Edit an existing solution in the catalog.' : 'Add a new solution to the catalog.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="StudySpark"
                  className="bg-secondary/50 border-border h-11"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="studyspark"
                  className="bg-secondary/50 border-border h-11"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Tagline</Label>
              <Input
                value={form.tagline}
                onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                placeholder="AI-powered learning platform"
                className="bg-secondary/50 border-border h-11"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the solution..."
                rows={3}
                className="bg-secondary/50 border-border resize-none"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Features (comma-separated)</Label>
              <Input
                value={form.features}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                placeholder="Feature 1, Feature 2, Feature 3"
                className="bg-secondary/50 border-border h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Pricing</Label>
                <Input
                  value={form.pricing}
                  onChange={(e) => setForm((f) => ({ ...f, pricing: e.target.value }))}
                  placeholder="Free / $9.99/mo"
                  className="bg-secondary/50 border-border h-11"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Demo URL</Label>
                <Input
                  value={form.demo_url}
                  onChange={(e) => setForm((f) => ({ ...f, demo_url: e.target.value }))}
                  placeholder="https://demo.example.com"
                  className="bg-secondary/50 border-border h-11"
                />
              </div>
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

      {/* View Details Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(open) => { if (!open) setViewItem(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Solution Details
            </DialogTitle>
            <DialogDescription className="sr-only">View solution submission details.</DialogDescription>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{viewItem.name || viewItem.title || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Slug</p>
                  <p className="font-medium">{viewItem.slug || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{viewItem.solution_type?.replace(/_/g, ' ') || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  {viewItem.status ? (
                    <Badge variant="outline" className={`text-xs capitalize ${statusColors[viewItem.status] || ''}`}>
                      {viewItem.status.replace(/_/g, ' ')}
                    </Badge>
                  ) : '—'}
                </div>
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-medium">{viewItem.budget || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Timeline</p>
                  <p className="font-medium">{viewItem.timeline || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{viewItem.email || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewItem.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Active</p>
                  <Badge variant="outline" className="text-xs">
                    {viewItem.is_active ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">{new Date(viewItem.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {viewItem.tagline && (
                <div>
                  <p className="text-muted-foreground">Tagline</p>
                  <p className="font-medium">{viewItem.tagline}</p>
                </div>
              )}
              {viewItem.description && (
                <div>
                  <p className="text-muted-foreground">Description</p>
                  <p className="mt-1 whitespace-pre-wrap bg-secondary/30 rounded-lg p-3">{viewItem.description}</p>
                </div>
              )}
              {Array.isArray(viewItem.features) && viewItem.features.length > 0 && (
                <div>
                  <p className="text-muted-foreground">Features</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewItem.features.map((f, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {viewItem.pricing && (
                <div>
                  <p className="text-muted-foreground">Pricing</p>
                  <p className="font-medium">{viewItem.pricing}</p>
                </div>
              )}
              {viewItem.demo_url && (
                <div>
                  <p className="text-muted-foreground">Demo URL</p>
                  <a
                    href={viewItem.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm mt-1"
                  >
                    {viewItem.demo_url} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
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
