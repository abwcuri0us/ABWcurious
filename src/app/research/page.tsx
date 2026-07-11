'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Shield, Brain, GraduationCap, Cloud, Loader2, CheckCircle2, Send, Microscope,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/* ─── Constants ────────────────────────────────── */
const researchAreas = [
  { icon: Shield, title: 'Cybersecurity', description: 'Threat intelligence, zero-day research, advanced persistent threat detection, and security framework development.', color: 'text-red-500', bg: 'bg-red-500/10' },
  { icon: Brain, title: 'AI/ML', description: 'Deep learning, natural language processing, computer vision, and responsible AI for real-world applications.', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { icon: GraduationCap, title: 'Education Technology', description: 'Adaptive learning platforms, gamification, and intelligent tutoring systems for next-gen education.', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { icon: Cloud, title: 'Cloud Computing', description: 'Cloud-native architectures, serverless computing, edge computing, and multi-cloud strategies.', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
];

const collaborationTypes = ['Joint Research', 'Consultancy', 'Whitepaper', 'Other'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── Component ────────────────────────────────── */
export default function ResearchPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    researchTopic: '',
    description: '',
    collaborationType: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.researchTopic.trim()) newErrors.researchTopic = 'Research topic is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (!formData.collaborationType) newErrors.collaborationType = 'Please select a collaboration type';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/research', {
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
      toast.success('Research inquiry submitted!');
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
            Inquiry Submitted!
          </h2>
          <p className="text-foreground/70 mb-6">
            Our research team will review your proposal and reach out to discuss potential collaboration opportunities.
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
            Research <span className="text-gradient-cyan">Collaboration</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Partner with ABWcurious on cutting-edge research. We collaborate with academic institutions, industry researchers, and innovators to push boundaries.
          </p>
        </motion.div>

        {/* Research Focus Areas */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl font-bold text-foreground mb-8 flex items-center gap-3"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            <Microscope className="w-7 h-7 text-primary" />
            Our Research Focus
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {researchAreas.map((area) => (
              <motion.div
                key={area.title}
                variants={itemVariants}
                className="glass-card p-6 hover:glow-cyan transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl ${area.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <area.icon className={`w-6 h-6 ${area.color}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {area.title}
                </h3>
                <p className="text-sm text-foreground/60">{area.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 glow-cyan">
            <h2 className="text-xl font-bold text-foreground mb-6" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Propose a Collaboration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input id="name" placeholder="Dr. Jane Smith" value={formData.name} onChange={(e) => updateField('name', e.target.value)} className={`bg-background/50 ${errors.name ? 'border-red-500' : 'border-border'}`} />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" placeholder="jane@university.edu" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={`bg-background/50 ${errors.email ? 'border-red-500' : 'border-border'}`} />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              {/* Organization */}
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input id="organization" placeholder="University / Research Lab" value={formData.organization} onChange={(e) => updateField('organization', e.target.value)} className="bg-background/50 border-border" />
              </div>

              {/* Research Topic */}
              <div className="space-y-2">
                <Label htmlFor="researchTopic">Research Topic <span className="text-red-500">*</span></Label>
                <Input id="researchTopic" placeholder="e.g., AI-driven threat detection" value={formData.researchTopic} onChange={(e) => updateField('researchTopic', e.target.value)} className={`bg-background/50 ${errors.researchTopic ? 'border-red-500' : 'border-border'}`} />
                {errors.researchTopic && <p className="text-red-500 text-xs">{errors.researchTopic}</p>}
              </div>

              {/* Collaboration Type */}
              <div className="space-y-2">
                <Label htmlFor="collaborationType">Collaboration Type <span className="text-red-500">*</span></Label>
                <select id="collaborationType" value={formData.collaborationType} onChange={(e) => updateField('collaborationType', e.target.value)} className={`flex h-10 w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.collaborationType ? 'border-red-500' : 'border-border'}`}>
                  <option value="">Select type...</option>
                  {collaborationTypes.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {errors.collaborationType && <p className="text-red-500 text-xs">{errors.collaborationType}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="Describe your research proposal, objectives, expected outcomes, and how ABWcurious can contribute..."
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
                  <><Send className="w-4 h-4" /> Submit Proposal</>
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
