'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Handshake, Users, Building2, Loader2, CheckCircle2, Send,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/* ─── Constants ────────────────────────────────── */
const partnerCards = [
  {
    icon: Handshake,
    title: 'Technology Partner',
    description: 'Co-development, joint go-to-market strategies, and shared innovation.',
    partnerType: 'Technology',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-500',
    benefits: ['Joint product development', 'Shared technical resources', 'Co-branded solutions'],
  },
  {
    icon: Users,
    title: 'Referral Partner',
    description: 'Earn commissions on successful referrals and grow together.',
    partnerType: 'Referral',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    benefits: ['Competitive commissions', 'Marketing support', 'Dedicated partner portal'],
  },
  {
    icon: Building2,
    title: 'Strategic Alliance',
    description: 'White-label solutions, revenue sharing, and deep integration partnerships.',
    partnerType: 'Strategic Alliance',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
    benefits: ['White-label solutions', 'Revenue sharing', 'Priority support & integration'],
  },
];

const partnerTypeOptions = ['Technology', 'Referral', 'Strategic Alliance'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── Component ────────────────────────────────── */
export default function PartnershipPage() {
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    partnerType: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCardClick = (partnerType: string) => {
    setSelectedType(partnerType);
    setFormData((prev) => ({ ...prev, partnerType }));
    setErrors((prev) => ({ ...prev, partnerType: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.partnerType) newErrors.partnerType = 'Please select a partner type';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) newErrors.website = 'Invalid website URL (must start with http:// or https://)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((err: { field: string; message: string }) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        }
        toast.error(data.error || 'Failed to submit inquiry');
        return;
      }
      setSuccess(true);
      toast.success('Partnership inquiry submitted!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 sm:p-14 text-center max-w-md glow-cyan"
        >
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Inquiry Received!
          </h2>
          <p className="text-foreground/70 mb-6">
            Thank you for your partnership interest. Our team will review your inquiry and reach out within 48 hours.
          </p>
          <a href="/">
            <Button className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90">Return to Home</Button>
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back link + Logo */}
        <a href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>

        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.svg" alt="ABWcurious Logo" width={40} height={40} className="h-10 w-10 object-contain" unoptimized />
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            <span className="text-gradient-cyan">ABW</span><span className="text-foreground">curious</span>
          </span>
        </div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Become a <span className="text-gradient-cyan">Partner</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Join forces with ABWcurious to deliver cutting-edge solutions. Whether you&apos;re a technology provider, consultant, or reseller — we have a partnership model that fits.
          </p>
        </motion.div>

        {/* Partner Tier Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
        >
          {partnerCards.map((card) => {
            const isSelected = selectedType === card.partnerType;
            return (
              <motion.div key={card.title} variants={itemVariants}>
                <button
                  onClick={() => handleCardClick(card.partnerType)}
                  className={`w-full text-left glass-card p-6 transition-all duration-300 hover:glow-cyan group ${
                    isSelected ? 'glow-cyan border-primary/50' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {card.title}
                  </h3>
                  <p className="text-sm text-foreground/60 mb-3">{card.description}</p>
                  <ul className="space-y-1">
                    {card.benefits.map((b) => (
                      <li key={b} className="text-xs text-foreground/50 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-primary inline-block" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  {isSelected && (
                    <Badge className="mt-3 bg-primary/10 text-primary border-0 text-xs">Selected</Badge>
                  )}
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 glow-cyan">
            <h2 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Partnership Inquiry
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={`bg-background/50 ${errors.name ? 'border-red-500' : 'border-border'}`}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`bg-background/50 ${errors.email ? 'border-red-500' : 'border-border'}`}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="bg-background/50 border-border"
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Your Company"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="bg-background/50 border-border"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://yourcompany.com"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  className={`bg-background/50 ${errors.website ? 'border-red-500' : 'border-border'}`}
                />
                {errors.website && <p className="text-red-500 text-xs">{errors.website}</p>}
              </div>

              {/* Partner Type */}
              <div className="space-y-2">
                <Label htmlFor="partnerType">Partner Type <span className="text-red-500">*</span></Label>
                <select
                  id="partnerType"
                  value={formData.partnerType}
                  onChange={(e) => {
                    updateField('partnerType', e.target.value);
                    setSelectedType(e.target.value);
                  }}
                  className={`flex h-10 w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.partnerType ? 'border-red-500' : 'border-border'
                  }`}
                >
                  <option value="">Select partner type...</option>
                  {partnerTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errors.partnerType && <p className="text-red-500 text-xs">{errors.partnerType}</p>}
              </div>

              {/* Message */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your company, what kind of partnership you're looking for, and how we can create value together..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  className={`bg-background/50 resize-none ${errors.message ? 'border-red-500' : 'border-border'}`}
                />
                {errors.message && <p className="text-red-500 text-xs">{errors.message}</p>}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Inquiry
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>

        <div className="mt-12 text-center">
          <a href="/" className="text-primary hover:underline text-sm">Return to ABWcurious.com</a>
        </div>
      </div>
    </div>
  );
}
