'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Loader2, Send, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Feedback {
  id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface ContactPanelProps {
  token: string;
  userId: string;
}

const feedbackTypes = ['Feedback', 'Problem', 'Solution', 'Complaint'] as const;

const statusColors: Record<string, string> = {
  open: 'bg-amber-500/10 text-amber-600',
  in_progress: 'bg-blue-500/10 text-blue-600',
  resolved: 'bg-emerald-500/10 text-emerald-600',
  closed: 'bg-gray-500/10 text-gray-600',
};

export default function ContactPanel({ token, userId }: ContactPanelProps) {
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    type: '',
    subject: '',
    message: '',
  });

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch('/api/user/feedbacks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.subject || !form.message) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success('Feedback submitted! We\'ll review it soon.');
        setForm({ type: '', subject: '', message: '' });
        fetchFeedbacks();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
          Contact Us
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Have a question or need help? Send us feedback.
        </p>
      </div>

      {/* Contact Details */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Get in Touch</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm text-foreground">info@abwcurious.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm text-foreground">+91 86552 49949</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm text-foreground">Navi Mumbai, Maharashtra, India</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Form */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Send Feedback</h3>
              <p className="text-xs text-muted-foreground">We typically respond within 24 hours</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="feedback-type">Type *</Label>
              <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  {feedbackTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="feedback-subject">Subject *</Label>
              <Input
                id="feedback-subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="mt-1.5"
                placeholder="Brief description of your feedback"
                required
              />
            </div>
            <div>
              <Label htmlFor="feedback-message">Message *</Label>
              <Textarea
                id="feedback-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5"
                rows={5}
                placeholder="Your detailed feedback..."
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous Feedbacks */}
      {fetching ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : feedbacks.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3">Previous Feedbacks</h3>
          <div className="space-y-3">
            {feedbacks.map((f) => (
              <Card key={f.id} className="border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">{f.subject}</h4>
                        <Badge className={`text-xs ${statusColors[f.status] || 'bg-gray-500/10 text-gray-600'}`}>
                          {f.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{f.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{f.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted {new Date(f.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
