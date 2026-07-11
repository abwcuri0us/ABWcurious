'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Lightbulb, Wrench, Bug, FileText, MoreHorizontal, Loader2,
  CheckCircle2, Send, Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/* ─── Constants ────────────────────────────────── */
const categoryIcons = [
  { icon: Lightbulb, label: 'Feature Request', value: 'Feature Request', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { icon: Wrench, label: 'Improvement', value: 'Improvement', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
  { icon: Bug, label: 'Bug Report', value: 'Bug Report', color: 'text-red-500', bg: 'bg-red-500/10' },
  { icon: FileText, label: 'Content', value: 'Content', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { icon: MoreHorizontal, label: 'Other', value: 'Other', color: 'text-foreground/60', bg: 'bg-foreground/10' },
];

const categoryOptions = ['Feature Request', 'Improvement', 'Bug Report', 'Content', 'Other'];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── Component ────────────────────────────────── */
export default function SuggestionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    title: '',
    description: '',
    priority: 'Medium',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCategoryClick = (value: string) => {
    setSelectedCategory(value);
    setFormData((prev) => ({ ...prev, category: value }));
    setErrors((prev) => ({ ...prev, category: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/suggestions', {
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
        toast.error(data.error || 'Failed to submit suggestion');
        return;
      }
      setSuccess(true);
      toast.success('Suggestion submitted!');
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
            Suggestion Received!
          </h2>
          <p className="text-foreground/70 mb-6">
            We value your input. Our team reviews every suggestion carefully. Thank you for helping us improve!
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
      <div className="max-w-3xl mx-auto">
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
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Share a <span className="text-gradient-cyan">Suggestion</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-xl">
            We value your input. Our team reviews every suggestion carefully. Help us build better products and experiences.
          </p>
        </motion.div>

        {/* Category Icons */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-5 gap-3 mb-10"
        >
          {categoryIcons.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <motion.div key={cat.value} variants={itemVariants}>
                <button
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`w-full text-center glass-card p-4 transition-all duration-300 hover:glow-cyan group ${
                    isSelected ? 'glow-cyan border-primary/50' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                    <cat.icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <span className="text-xs text-foreground/70 font-medium block">{cat.label}</span>
                  {isSelected && (
                    <Badge className="mt-1.5 bg-primary/10 text-primary border-0 text-xs">✓</Badge>
                  )}
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <div className="glass-card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-foreground/70">
                Your ideas matter. Whether it&apos;s a new feature, an improvement, or a bug you&apos;ve found — we read every submission and prioritize based on community impact.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 glow-cyan">
            <h2 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Submit a Suggestion
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name (optional)" value={formData.name} onChange={(e) => updateField('name', e.target.value)} className="bg-background/50 border-border" />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com (optional)" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={`bg-background/50 ${errors.email ? 'border-red-500' : 'border-border'}`} />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => {
                    updateField('category', e.target.value);
                    setSelectedCategory(e.target.value);
                  }}
                  className={`flex h-10 w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.category ? 'border-red-500' : 'border-border'
                  }`}
                >
                  <option value="">Select category...</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select id="priority" value={formData.priority} onChange={(e) => updateField('priority', e.target.value)} className="flex h-10 w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-border">
                  {priorityOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input id="title" placeholder="Brief summary of your suggestion" value={formData.title} onChange={(e) => updateField('title', e.target.value)} className={`bg-background/50 ${errors.title ? 'border-red-500' : 'border-border'}`} />
                {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of your suggestion, including any context, use cases, or examples..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className={`bg-background/50 resize-none ${errors.description ? 'border-red-500' : 'border-border'}`}
                />
                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button type="submit" disabled={loading} className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit Suggestion</>
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
