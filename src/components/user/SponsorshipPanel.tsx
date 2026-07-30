'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heart, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/auth-fetch';

interface Sponsorship {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  sponsorship_level: string;
  event_name: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

interface SponsorshipPanelProps {
  token: string;
  userId: string;
}

const sponsorshipLevels = [
  { value: 'platinum', label: 'Platinum', desc: 'Premium partnership with maximum visibility' },
  { value: 'gold', label: 'Gold', desc: 'High-visibility sponsorship tier' },
  { value: 'silver', label: 'Silver', desc: 'Standard sponsorship with good visibility' },
  { value: 'bronze', label: 'Bronze', desc: 'Entry-level sponsorship' },
] as const;

const sponsorshipLevelLabels: Record<string, string> = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
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
    company_name: '',
    contact_name: '',
    phone: '',
    sponsorship_level: '',
    event_name: '',
    message: '',
  });

  const fetchSponsorships = useCallback(async () => {
    try {
      const res = await fetch('/api/user/sponsorships', {
        headers: getAuthHeaders(token),
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
    if (!form.company_name || !form.contact_name || !form.sponsorship_level || !form.message) {
      toast.error('Company name, contact name, sponsorship level, and message are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/sponsorships', {
        method: 'POST',
        headers: getAuthHeaders(token, 'application/json'),
        body: JSON.stringify({
          company_name: form.company_name,
          contact_name: form.contact_name,
          phone: form.phone || undefined,
          sponsorship_level: form.sponsorship_level,
          event_name: form.event_name || undefined,
          message: form.message,
        }),
      });

      if (res.ok) {
        toast.success('Sponsorship request submitted! We\'ll get back to you soon.');
        setForm({ company_name: '', contact_name: '', phone: '', sponsorship_level: '', event_name: '', message: '' });
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
                <Label htmlFor="sponsor-company">Company Name *</Label>
                <Input
                  id="sponsor-company"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className="mt-1.5"
                  placeholder="Company name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sponsor-contact">Contact Name *</Label>
                <Input
                  id="sponsor-contact"
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  className="mt-1.5"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sponsor-phone">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="sponsor-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1.5"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="sponsor-level">Sponsorship Level *</Label>
                <Select value={form.sponsorship_level} onValueChange={(val) => setForm({ ...form, sponsorship_level: val })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="z-[210]">
                    {sponsorshipLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="sponsor-event">Event Name <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="sponsor-event"
                value={form.event_name}
                onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                className="mt-1.5"
                placeholder="Specific event you'd like to sponsor"
              />
            </div>
            <div>
              <Label htmlFor="sponsor-message">Message *</Label>
              <Textarea
                id="sponsor-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5"
                rows={4}
                placeholder="Tell us about your sponsorship interest..."
                required
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
                        <h4 className="text-sm font-semibold text-foreground">{s.company_name}</h4>
                        <Badge className={`text-xs ${statusColors[s.status] || 'bg-gray-500/10 text-gray-600'}`}>
                          {s.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{sponsorshipLevelLabels[s.sponsorship_level] || s.sponsorship_level}</Badge>
                        {s.event_name && (
                          <Badge variant="outline" className="text-xs">{s.event_name}</Badge>
                        )}
                      </div>
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
