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
import { Heart, Loader2, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Sponsorship {
  id: string;
  organization_name: string;
  sponsorship_type: string;
  message: string | null;
  status: string;
  created_at: string;
}

interface SponsorshipPanelProps {
  token: string;
  userId: string;
}

const sponsorshipTypes = ['event', 'content', 'community', 'educational', 'financial', 'general'] as const;

const sponsorshipTypeLabels: Record<string, string> = {
  event: 'Event',
  content: 'Content',
  community: 'Community',
  educational: 'Educational',
  financial: 'Financial',
  general: 'General',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600',
  approved: 'bg-emerald-500/10 text-emerald-600',
  rejected: 'bg-red-500/10 text-red-600',
  active: 'bg-blue-500/10 text-blue-600',
  inactive: 'bg-gray-500/10 text-gray-600',
};

export default function SponsorshipPanel({ token, userId }: SponsorshipPanelProps) {
  const [loading, setLoading] = useState(false);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    organizationName: '',
    sponsorshipType: '',
    message: '',
  });

  const fetchSponsorships = useCallback(async () => {
    try {
      const res = await fetch('/api/user/sponsorships', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSponsorships(data.data || []);
      }
    } catch {
      toast.error('Failed to load sponsorships');
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSponsorships();
  }, [fetchSponsorships]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organizationName || !form.sponsorshipType) {
      toast.error('Organization name and sponsorship type are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/sponsorships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success('Sponsorship request submitted! We\'ll get back to you soon.');
        setForm({ organizationName: '', sponsorshipType: '', message: '' });
        fetchSponsorships();
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
          Sponsorship Inquiry
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Support our mission by sponsoring events, content, or initiatives
        </p>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-pink-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Sponsor ABWcurious</h3>
              <p className="text-xs text-muted-foreground">Event sponsorships, content partnerships, and community support</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sponsor-org">Organization Name *</Label>
                <Input
                  id="sponsor-org"
                  value={form.organizationName}
                  onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                  className="mt-1.5"
                  placeholder="Company name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sponsor-type">Sponsorship Type *</Label>
                <Select value={form.sponsorshipType} onValueChange={(val) => setForm({ ...form, sponsorshipType: val })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sponsorshipTypes.map((type) => (
                      <SelectItem key={type} value={type}>{sponsorshipTypeLabels[type]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="sponsor-message">Message</Label>
              <Textarea
                id="sponsor-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5"
                rows={4}
                placeholder="Tell us about your sponsorship interest..."
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
              Submit Inquiry
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Previous Requests */}
      {fetching ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : sponsorships.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3">Previous Requests</h3>
          <div className="space-y-3">
            {sponsorships.map((s) => (
              <Card key={s.id} className="border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">{s.organization_name}</h4>
                        <Badge className={`text-xs ${statusColors[s.status] || 'bg-gray-500/10 text-gray-600'}`}>
                          {s.status}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">{sponsorshipTypeLabels[s.sponsorship_type] || s.sponsorship_type}</Badge>
                      {s.message && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{s.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted {new Date(s.created_at).toLocaleDateString()}
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
