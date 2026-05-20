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
import { Handshake, Loader2, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Partnership {
  id: string;
  organization_name: string;
  partnership_type: string;
  message: string | null;
  status: string;
  created_at: string;
}

interface PartnershipPanelProps {
  token: string;
  userId: string;
}

const partnershipTypes = ['strategic', 'technology', 'marketing', 'educational', 'financial', 'general'] as const;

const partnershipTypeLabels: Record<string, string> = {
  strategic: 'Strategic',
  technology: 'Technology',
  marketing: 'Marketing',
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

export default function PartnershipPanel({ token, userId }: PartnershipPanelProps) {
  const [loading, setLoading] = useState(false);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    organizationName: '',
    partnershipType: '',
    message: '',
  });

  const fetchPartnerships = useCallback(async () => {
    try {
      const res = await fetch('/api/user/partnerships', {
        headers: { Authorization: `Bearer ${token}` },
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
    if (!form.organizationName || !form.partnershipType) {
      toast.error('Organization name and partnership type are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success('Partnership request submitted! We\'ll get back to you soon.');
        setForm({ organizationName: '', partnershipType: '', message: '' });
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
                <Label htmlFor="partner-org">Organization Name *</Label>
                <Input
                  id="partner-org"
                  value={form.organizationName}
                  onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                  className="mt-1.5"
                  placeholder="Company name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="partner-type">Partnership Type *</Label>
                <Select value={form.partnershipType} onValueChange={(val) => setForm({ ...form, partnershipType: val })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {partnershipTypes.map((type) => (
                      <SelectItem key={type} value={type}>{partnershipTypeLabels[type]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="partner-message">Message / Proposal</Label>
              <Textarea
                id="partner-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5"
                rows={4}
                placeholder="Tell us about your partnership idea..."
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
                        <h4 className="text-sm font-semibold text-foreground">{p.organization_name}</h4>
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
