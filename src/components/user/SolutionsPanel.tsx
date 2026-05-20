'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Pencil,
  Trash2,
  Lightbulb,
  Loader2,
  ArrowLeft,
  Send,
} from 'lucide-react';
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
import { toast } from 'sonner';

interface Solution {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SolutionsPanelProps {
  token: string;
  userId: string;
}

const solutionTypes = ['consulting', 'development', 'training', 'audit', 'support', 'general'] as const;

const solutionTypeLabels: Record<string, string> = {
  consulting: 'Consulting',
  development: 'Software Development',
  training: 'Training',
  audit: 'Security Audit',
  support: 'Technical Support',
  general: 'General',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600',
  'in-progress': 'bg-blue-500/10 text-blue-600',
  completed: 'bg-emerald-500/10 text-emerald-600',
  cancelled: 'bg-red-500/10 text-red-600',
};

export default function SolutionsPanel({ token, userId }: SolutionsPanelProps) {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [saving, setSaving] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<string>('');
  const [formBudget, setFormBudget] = useState('');
  const [formTimeline, setFormTimeline] = useState('');

  const fetchSolutions = useCallback(async () => {
    try {
      const res = await fetch('/api/user/solutions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSolutions(data.data || []);
      }
    } catch {
      toast.error('Failed to load solutions');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormType('');
    setFormBudget('');
    setFormTimeline('');
    setView('list');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formType) {
      toast.error('Title and type are required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription || undefined,
          type: formType,
          budget: formBudget || undefined,
          timeline: formTimeline || undefined,
        }),
      });

      if (res.ok) {
        toast.success('Solution request submitted!');
        resetForm();
        fetchSolutions();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (view === 'form') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={resetForm} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            Request a Solution
          </h2>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="solution-title">Title *</Label>
                <Input
                  id="solution-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Inventory Management System"
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="solution-type">Type *</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select solution type" />
                  </SelectTrigger>
                  <SelectContent>
                    {solutionTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="solution-description">Description</Label>
                <Textarea
                  id="solution-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe what you need..."
                  className="mt-1.5"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="solution-budget">Budget Range (optional)</Label>
                  <Input
                    id="solution-budget"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    placeholder="e.g., ₹50,000 - ₹1,00,000"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="solution-timeline">Timeline (optional)</Label>
                  <Input
                    id="solution-timeline"
                    value={formTimeline}
                    onChange={(e) => setFormTimeline(e.target.value)}
                    placeholder="e.g., 2-3 months"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            My Solution Requests
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Request software, apps, or development solutions
          </p>
        </div>
        <Button onClick={() => setView('form')} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          New Request
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : solutions.length === 0 ? (
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-1">No solution requests yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Submit your first solution request!</p>
            <Button onClick={() => setView('form')} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              New Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {solutions.map((solution) => (
            <Card key={solution.id} className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground truncate">{solution.title}</h3>
                      <Badge className={`text-xs shrink-0 ${statusColors[solution.status] || 'bg-gray-500/10 text-gray-600'}`}>
                        {solution.status.replace(/[-_]/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{solutionTypeLabels[solution.type] || solution.type}</Badge>
                    </div>
                    {solution.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{solution.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Submitted {new Date(solution.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
