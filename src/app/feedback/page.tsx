'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, Loader2, CheckCircle2, Send, MessageSquareHeart,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

/* ─── Constants ────────────────────────────────── */
const categoryOptions = ['General', 'Product', 'Service', 'Support', 'Website'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── Star Rating Component ─────────────────── */
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-125 focus:outline-none"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-foreground/20'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-foreground/60">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
}

/* ─── Component ────────────────────────────────── */
export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    category: '',
    message: '',
    isAnonymous: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.rating === 0) newErrors.rating = 'Please provide a rating';
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.trim().length < 5) newErrors.message = 'Message must be at least 5 characters';
    if (!formData.isAnonymous && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.isAnonymous ? '' : formData.name,
        email: formData.isAnonymous ? '' : formData.email,
        rating: formData.rating,
        category: formData.category,
        message: formData.message,
        isAnonymous: formData.isAnonymous,
      };

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
        toast.error(data.error || 'Failed to submit feedback');
        return;
      }
      setSuccess(true);
      toast.success('Feedback submitted!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | boolean | number) => {
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
            Thank You!
          </h2>
          <p className="text-foreground/70 mb-6">
            Your feedback helps us improve. We appreciate you taking the time to share your thoughts.
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
      <div className="max-w-2xl mx-auto">
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
            Share Your <span className="text-gradient-cyan">Feedback</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-xl">
            Your feedback helps us improve. Thank you for taking the time to share your experience with us.
          </p>
        </motion.div>

        {/* Trust Message */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={itemVariants} className="glass-card p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquareHeart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                We Value Your Voice
              </h3>
              <p className="text-sm text-foreground/60">
                Every piece of feedback is read by our team. Whether it&apos;s praise, criticism, or a suggestion — we want to hear it all.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 glow-cyan">
            {/* Star Rating */}
            <div className="mb-8">
              <Label className="mb-3 block">Rating <span className="text-red-500">*</span></Label>
              <StarRating
                value={formData.rating}
                onChange={(v) => updateField('rating', v)}
              />
              {errors.rating && <p className="text-red-500 text-xs mt-2">{errors.rating}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" value={formData.name} onChange={(e) => updateField('name', e.target.value)} disabled={formData.isAnonymous} className="bg-background/50 border-border disabled:opacity-50" />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => updateField('email', e.target.value)} disabled={formData.isAnonymous} className={`bg-background/50 disabled:opacity-50 ${errors.email ? 'border-red-500' : 'border-border'}`} />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                <select id="category" value={formData.category} onChange={(e) => updateField('category', e.target.value)} className={`flex h-10 w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.category ? 'border-red-500' : 'border-border'}`}>
                  <option value="">Select category...</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
              </div>

              {/* Anonymous checkbox */}
              <div className="flex items-end pb-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onCheckedChange={(checked) => {
                      updateField('isAnonymous', !!checked);
                      if (checked) {
                        updateField('name', '');
                        updateField('email', '');
                      }
                    }}
                  />
                  <Label htmlFor="anonymous" className="text-sm text-foreground/70 cursor-pointer">
                    Submit Anonymously
                  </Label>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                <Textarea
                  id="message"
                  placeholder="Share your experience, concerns, or suggestions..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  className={`bg-background/50 resize-none ${errors.message ? 'border-red-500' : 'border-border'}`}
                />
                {errors.message && <p className="text-red-500 text-xs">{errors.message}</p>}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button type="submit" disabled={loading} className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit Feedback</>
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
