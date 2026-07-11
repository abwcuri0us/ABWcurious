'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  Loader2,
  Send,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/auth-fetch';

interface Feedback {
  id: string;
  subject: string;
  message: string;
  rating: number;
  status: string;
  admin_reply: string | null;
  created_at: string;
}

interface FeedbackPanelProps {
  token: string;
  userId: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-amber-500/10 text-amber-600',
  open: 'bg-amber-500/10 text-amber-600',
  read: 'bg-blue-500/10 text-blue-600',
  in_progress: 'bg-purple-500/10 text-purple-600',
  resolved: 'bg-emerald-500/10 text-emerald-600',
  closed: 'bg-gray-500/10 text-gray-600',
};

export default function FeedbackPanel({ token, userId }: FeedbackPanelProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [form, setForm] = useState({
    subject: '',
    message: '',
    rating: 0,
  });
  const [hoverRating, setHoverRating] = useState(0);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch('/api/user/feedbacks', {
        headers: getAuthHeaders(token),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.data || []);
      }
    } catch {
      toast.error('Failed to load feedback');
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.message || !form.rating) {
      toast.error('Rating, subject, and message are all required');
      return;
    }
    if (form.message.length < 10) {
      toast.error('Message must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/feedbacks', {
        method: 'POST',
        headers: getAuthHeaders(token, 'application/json'),
        body: JSON.stringify({
          subject: form.subject,
          message: form.message,
          rating: form.rating,
        }),
      });

      if (res.ok) {
        toast.success('Feedback submitted! Thank you for sharing.');
        setForm({ subject: '', message: '', rating: 0 });
        fetchFeedbacks();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit feedback');
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
          Feedback
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Share your experience and suggestions — we read every message.
        </p>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Send Feedback</h3>
              <p className="text-xs text-muted-foreground">Rate your experience and tell us what you think</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Rating *</Label>
              <div className="flex items-center gap-1 mt-1.5">
                {[1, 2, 3, 4, 5].map((value) => {
                  const active = (hoverRating || form.rating) >= value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, rating: value })}
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded transition-transform hover:scale-110"
                      aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`h-7 w-7 ${
                          active ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  );
                })}
                {form.rating > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {form.rating === 5 ? 'Excellent' : form.rating === 4 ? 'Good' : form.rating === 3 ? 'Average' : form.rating === 2 ? 'Poor' : 'Very poor'}
                  </span>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="feedback-subject">Subject *</Label>
              <Input
                id="feedback-subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="mt-1.5"
                placeholder="Brief summary of your feedback"
                maxLength={200}
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
                placeholder="Tell us what you loved or what we could improve... (min 10 characters)"
                maxLength={5000}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">{form.message.length}/5000</p>
            </div>
            <Button type="submit" disabled={loading || !form.rating}>
              {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous Feedback */}
      {fetching ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : feedbacks.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3">Your Previous Feedback</h3>
          <div className="space-y-3">
            {feedbacks.map((f) => (
              <Card key={f.id} className="border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="text-sm font-semibold text-foreground">{f.subject}</h4>
                    <Badge className={`text-xs shrink-0 ${statusColors[f.status] || 'bg-gray-500/10 text-gray-600'}`}>
                      {f.status.replace(/[-_]/g, ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <Star
                        key={v}
                        className={`h-3.5 w-3.5 ${v <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">{f.message}</p>
                  {f.admin_reply && (
                    <div className="mt-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2.5">
                      <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 mb-1">
                        <CheckCircle2 className="h-3 w-3" /> Admin Reply
                      </p>
                      <p className="text-xs text-foreground">{f.admin_reply}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted {new Date(f.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
