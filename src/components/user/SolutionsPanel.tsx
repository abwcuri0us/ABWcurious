'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  Loader2,
  Send,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/auth-fetch';

interface SolutionRequest {
  id: string;
  title: string;
  description: string;
  solution_type: string;
  budget: string | null;
  timeline: string | null;
  status: string;
  created_at: string;
}

interface SolutionsPanelProps {
  token: string;
  userId: string;
}

const solutionTypes = [
  { value: 'software_app', label: 'Software Application' },
  { value: 'website', label: 'Website Development' },
  { value: 'cybersecurity', label: 'Cybersecurity Solution' },
  { value: 'ai_ml', label: 'AI / ML Solution' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'consulting', label: 'IT Consulting' },
  { value: 'other', label: 'Other' },
];

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  submitted: { color: 'bg-blue-500/10 text-blue-600', icon: Clock, label: 'Submitted' },
  pending: { color: 'bg-amber-500/10 text-amber-600', icon: Clock, label: 'Pending' },
  'in-progress': { color: 'bg-purple-500/10 text-purple-600', icon: Loader2, label: 'In Progress' },
  processing: { color: 'bg-purple-500/10 text-purple-600', icon: Loader2, label: 'Processing' },
  completed: { color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle2, label: 'Completed' },
  cancelled: { color: 'bg-red-500/10 text-red-600', icon: XCircle, label: 'Cancelled' },
  rejected: { color: 'bg-red-500/10 text-red-600', icon: XCircle, label: 'Rejected' },
};

export default function SolutionsPanel({ token, userId }: SolutionsPanelProps) {
  const [requests, setRequests] = useState<SolutionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'submit' | 'my'>('submit');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    solution_type: 'software_app',
    title: '',
    description: '',
    budget: '',
    timeline: '',
  });

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/user/solutions', {
        headers: getAuthHeaders(token),
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data?.requests || []);
      }
    } catch {
      toast.error('Failed to load your solution requests');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required.');
      return;
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/solutions', {
        method: 'POST',
        headers: getAuthHeaders(token, 'application/json'),
        body: JSON.stringify({
          solution_type: form.solution_type,
          title: form.title,
          description: form.description,
          budget: form.budget || undefined,
          timeline: form.timeline || undefined,
        }),
      });

      if (res.ok) {
        toast.success('Solution request submitted successfully!');
        setForm({
          solution_type: 'software_app',
          title: '',
          description: '',
          budget: '',
          timeline: '',
        });
        setTab('my');
        fetchRequests();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit solution request');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
          Solutions
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Request a custom solution tailored to your needs
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={tab === 'submit' ? 'default' : 'outline'} size="sm" onClick={() => setTab('submit')}>
          <Send className="h-3.5 w-3.5 mr-1.5" />
          Submit Request
        </Button>
        <Button variant={tab === 'my' ? 'default' : 'outline'} size="sm" onClick={() => setTab('my')}>
          <Package className="h-3.5 w-3.5 mr-1.5" />
          My Requests ({requests.length})
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : tab === 'submit' ? (
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Solution Type *</Label>
              <Select
                value={form.solution_type}
                onValueChange={(v) => setForm((f) => ({ ...f, solution_type: v }))}
              >
                <SelectTrigger className="w-full bg-secondary/50 border-border h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {solutionTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Custom AI Security Platform"
                className="bg-secondary/50 border-border h-11"
                maxLength={200}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Description * <span className="text-muted-foreground font-normal">(min 10 characters)</span></Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe your requirements in detail..."
                rows={5}
                className="bg-secondary/50 border-border resize-none"
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground mt-1">{form.description.length}/5000</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Budget <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  value={form.budget}
                  onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                  placeholder="e.g., 5-10 LPA"
                  className="bg-secondary/50 border-border h-11"
                  maxLength={100}
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Timeline <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  value={form.timeline}
                  onChange={(e) => setForm((f) => ({ ...f, timeline: e.target.value }))}
                  placeholder="e.g., 3 months"
                  className="bg-secondary/50 border-border h-11"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Submit Request</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-1">No solution requests yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Submit your first solution request!</p>
            <Button onClick={() => setTab('submit')} size="sm">
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Submit Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const status = statusConfig[req.status] || statusConfig.submitted;
            const StatusIcon = status.icon;
            const typeLabel = solutionTypes.find((t) => t.value === req.solution_type)?.label || req.solution_type;
            return (
              <Card key={req.id} className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-semibold text-foreground">{req.title}</h3>
                        <Badge className={`text-xs shrink-0 ${status.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs mb-2">{typeLabel}</Badge>
                      <p className="text-sm text-muted-foreground line-clamp-2">{req.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {req.budget && <span>Budget: {req.budget}</span>}
                        {req.timeline && <span>Timeline: {req.timeline}</span>}
                        <span>Submitted {new Date(req.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
