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
import { Handshake, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/auth-fetch';

interface Partnership {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  partnership_type: string;
  message: string | null;
  status: string;
  created_at: string;
}

interface PartnershipPanelProps {
  token: string;
  userId: string;
}

const partnershipTypes = [
  { value: 'technology', label: 'Technology' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'academic', label: 'Academic' },
  { value: 'reseller', label: 'Reseller' },
  { value: 'other', label: 'Other' },
] as const;

const partnershipTypeLabels: Record<string, string> = {
  technology: 'Technology',
  strategic: 'Strategic',
  academic: 'Academic',
  reseller: 'Reseller',
  other: 'Other',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600',
  approved: 'bg-emerald-500/10 text-emerald-600',
  rejected: 'bg-red-500/10 text-red-600',
  active: 'bg-blue-500/10 text-blue-600',
  inactive: 'bg-gray-500/10 text-gray-600',
};

export default function PartnershipPanel({ token, userId }: PartnershipPanelProps) {
  const [loading, setLoading] = useState(false);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    partnership_type: '',
    message: '',
  });

  const fetchPartnerships = useCallback(async () => {
    try {
      const res = await fetch('/api/user/partnerships', {
        headers: getAuthHeaders(token),
      });
      if (res.ok) {
        const data = await res.json();
        setPartnerships(data.data || []);
      }
    } catch {
      toast.error('Failed to load partnerships');
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPartnerships();
  }, [fetchPartnerships]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.contact_name || !form.partnership_type || !form.message) {
      toast.error('Company name, contact name, partnership type, and message are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/partnerships', {
        method: 'POST',
        headers: getAuthHeaders(token, 'application/json'),
        body: JSON.stringify({
          company_name: form.company_name,
          contact_name: form.contact_name,
          phone: form.phone || undefined,
          partnership_type: form.partnership_type,
          message: form.message,
        }),
      });

      if (res.ok) {
        toast.success('Partnership request submitted! We\'ll get back to you soon.');
        setForm({ company_name: '', contact_name: '', phone: '', partnership_type: '', message: '' });
        fetchPartnerships();
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
          Partnership Inquiry
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Interested in partnering with ABWcurious? We&apos;d love to hear from you.
        </p>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Handshake className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Partner With Us</h3>
              <p className="text-xs text-muted-foreground">Technology partnerships, integrations, and collaborations</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partner-company">Company Name *</Label>
                <Input
                  id="partner-company"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className="mt-1.5"
                  placeholder="Company name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="partner-contact">Contact Name *</Label>
                <Input
                  id="partner-contact"
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  className="mt-1.5"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="partner-phone">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="partner-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1.5"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="partner-type">Partnership Type *</Label>
                <Select value={form.partnership_type} onValueChange={(val) => setForm({ ...form, partnership_type: val })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="z-[210]">
                    {partnershipTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="partner-message">Message / Proposal *</Label>
              <Textarea
                id="partner-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5"
                rows={4}
                placeholder="Tell us about your partnership idea..."
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
      ) : partnerships.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3">Previous Requests</h3>
          <div className="space-y-3">
            {partnerships.map((p) => (
              <Card key={p.id} className="border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">{p.company_name}</h4>
                        <Badge className={`text-xs ${statusColors[p.status] || 'bg-gray-500/10 text-gray-600'}`}>
                          {p.status}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">{partnershipTypeLabels[p.partnership_type] || p.partnership_type}</Badge>
                      {p.message && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted {new Date(p.created_at).toLocaleDateString()}
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
