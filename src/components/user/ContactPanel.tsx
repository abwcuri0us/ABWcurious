'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, Send, Phone, MapPin, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ContactPanelProps {
  token: string;
  userId: string;
}

export default function ContactPanel({ token, userId }: ContactPanelProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Name, email, subject, and message are required');
      return;
    }
    if (form.message.length < 10) {
      toast.error('Message must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          subject: form.subject,
          message: form.message,
        }),
      });

      if (res.ok) {
        toast.success('Message sent! We\'ll get back to you soon.');
        setForm({ name: user?.name || '', email: user?.email || '', phone: '', subject: '', message: '' });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to send message');
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
          Have a question or need help? We&apos;d love to hear from you.
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

      {/* Contact Form */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Send a Message</h3>
              <p className="text-xs text-muted-foreground">We typically respond within 24 hours</p>
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">Message Sent!</h3>
              <p className="text-sm text-muted-foreground">We&apos;ll get back to you as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-name">Name *</Label>
                  <Input
                    id="contact-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email">Email *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1.5"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-phone">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input
                    id="contact-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1.5"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-subject">Subject *</Label>
                  <Input
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="mt-1.5"
                    placeholder="Brief description"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contact-message">Message *</Label>
                <Textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-1.5"
                  rows={5}
                  placeholder="Your detailed message... (min 10 characters)"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
                Send Message
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
