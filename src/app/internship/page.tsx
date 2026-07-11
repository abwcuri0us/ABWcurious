'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Rocket, BookOpen, TrendingUp, Users, Loader2, CheckCircle2,
  Send, GraduationCap, ExternalLink, Briefcase, MapPin, X, RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

/* ─── Types ────────────────────────────────────── */
interface CareerItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  jobType: string;
  department: string;
  isRemote: boolean;
  postedAt: string;
}

/* ─── Constants ────────────────────────────────── */
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd6d_0Rpq0mt6UKqt9oM9eMwvoaGBZkbTpGlXshFBHFGc6G-Q/viewform?usp=dialog';

const benefits = [
  { icon: Rocket, title: 'Real Projects', description: 'Work on live client projects in cybersecurity, AI, and web development from day one.' },
  { icon: BookOpen, title: 'Mentorship', description: 'One-on-one mentorship from industry experts who guide your learning and career path.' },
  { icon: TrendingUp, title: 'Industry Exposure', description: 'Gain hands-on experience with enterprise tools, frameworks, and real-world workflows.' },
  { icon: Users, title: 'Career Growth', description: 'Top interns receive pre-placement offers and accelerated career opportunities.' },
];

const roleOptions = ['Cybersecurity Intern', 'AI/ML Intern', 'Full Stack Developer Intern', 'UI/UX Design Intern', 'Digital Marketing Intern'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── Component ────────────────────────────────── */
export default function InternshipPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    degree: '',
    graduationYear: '',
    role: '',
    resumeUrl: '',
    portfolioUrl: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [internRoles, setInternRoles] = useState<CareerItem[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);

  const fetchInternRoles = useCallback(async () => {
    setRolesLoading(true);
    setRolesError(null);
    try {
      const res = await fetch('/api/careers?jobType=Internship&limit=20');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setInternRoles(json.data || []);
    } catch {
      setRolesError('Failed to load internship roles');
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInternRoles();
  }, [fetchInternRoles]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.college.trim()) newErrors.college = 'College/University is required';
    if (!formData.degree.trim()) newErrors.degree = 'Degree is required';
    if (!formData.graduationYear.trim()) newErrors.graduationYear = 'Graduation year is required';
    else if (!/^\d{4}$/.test(formData.graduationYear)) newErrors.graduationYear = 'Enter a valid year (e.g., 2025)';
    if (!formData.message.trim()) newErrors.message = 'Cover letter is required';
    else if (formData.message.trim().length < 20) newErrors.message = 'Cover letter must be at least 20 characters';
    if (formData.resumeUrl && !/^https?:\/\/.+/.test(formData.resumeUrl)) newErrors.resumeUrl = 'Invalid URL';
    if (formData.portfolioUrl && !/^https?:\/\/.+/.test(formData.portfolioUrl)) newErrors.portfolioUrl = 'Invalid URL';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/internships', {
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
        toast.error(data.error || 'Failed to submit application');
        return;
      }
      setSuccess(true);
      toast.success('Application submitted successfully!');
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
            Application Submitted!
          </h2>
          <p className="text-foreground/70 mb-6">
            Thank you for applying to ABWcurious! We&apos;ll review your application and get back to you soon.
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
            Internship <span className="text-gradient-cyan">Program</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Kick-start your career with hands-on experience in cybersecurity, AI, and full-stack development. Learn from industry experts and work on real projects.
          </p>
        </motion.div>

        {/* Why intern at ABWcurious? */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Why Intern at <span className="text-gradient-cyan">ABWcurious</span>?
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
                className="glass-card p-6 hover:glow-cyan transition-all duration-300 group text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                  {benefit.title}
                </h3>
                <p className="text-sm text-foreground/60">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Open Internship Roles */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 flex items-center gap-3" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            <GraduationCap className="w-7 h-7 text-primary" />
            Open Internship Roles
          </h2>

          {rolesLoading && (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-5 flex flex-col gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          )}

          {rolesError && !rolesLoading && (
            <div className="glass-card p-8 text-center">
              <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-foreground/60 mb-3">{rolesError}</p>
              <Button variant="outline" onClick={fetchInternRoles} className="gap-2">
                <RefreshCw className="w-4 h-4" /> Retry
              </Button>
            </div>
          )}

          {!rolesLoading && !rolesError && internRoles.length === 0 && (
            <div className="glass-card p-8 text-center">
              <Briefcase className="w-8 h-8 text-foreground/30 mx-auto mb-2" />
              <p className="text-foreground/60 mb-3">No open internship roles at the moment</p>
              <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="w-4 h-4" /> Apply via Google Form
                </Button>
              </a>
            </div>
          )}

          {!rolesLoading && !rolesError && internRoles.length > 0 && (
            <div className="grid gap-3">
              {internRoles.map((role) => (
                <div key={role.id} className="glass-card p-5 hover:glow-cyan transition-all duration-300 group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                        {role.title}
                      </h3>
                      <p className="text-sm text-foreground/60 mt-1">{role.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" /> {role.location}
                        </Badge>
                        {role.isRemote && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs border-0">Remote</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{role.department}</Badge>
                      </div>
                    </div>
                    <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" /> Apply
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 glow-cyan">
            <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              Apply for Internship
            </h2>
            <p className="text-sm text-foreground/60 mb-6">
              Fill out the form below or{' '}
              <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                apply via Google Form
              </a>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input id="name" placeholder="Jane Doe" value={formData.name} onChange={(e) => updateField('name', e.target.value)} className={`bg-background/50 ${errors.name ? 'border-red-500' : 'border-border'}`} />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" placeholder="jane@university.edu" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={`bg-background/50 ${errors.email ? 'border-red-500' : 'border-border'}`} />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} className="bg-background/50 border-border" />
              </div>

              {/* College */}
              <div className="space-y-2">
                <Label htmlFor="college">College/University <span className="text-red-500">*</span></Label>
                <Input id="college" placeholder="IIT Bombay" value={formData.college} onChange={(e) => updateField('college', e.target.value)} className={`bg-background/50 ${errors.college ? 'border-red-500' : 'border-border'}`} />
                {errors.college && <p className="text-red-500 text-xs">{errors.college}</p>}
              </div>

              {/* Degree */}
              <div className="space-y-2">
                <Label htmlFor="degree">Degree <span className="text-red-500">*</span></Label>
                <Input id="degree" placeholder="B.Tech in Computer Science" value={formData.degree} onChange={(e) => updateField('degree', e.target.value)} className={`bg-background/50 ${errors.degree ? 'border-red-500' : 'border-border'}`} />
                {errors.degree && <p className="text-red-500 text-xs">{errors.degree}</p>}
              </div>

              {/* Graduation Year */}
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year <span className="text-red-500">*</span></Label>
                <Input id="graduationYear" placeholder="2025" value={formData.graduationYear} onChange={(e) => updateField('graduationYear', e.target.value)} className={`bg-background/50 ${errors.graduationYear ? 'border-red-500' : 'border-border'}`} />
                {errors.graduationYear && <p className="text-red-500 text-xs">{errors.graduationYear}</p>}
              </div>

              {/* Desired Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Desired Role</Label>
                <select id="role" value={formData.role} onChange={(e) => updateField('role', e.target.value)} className="flex h-10 w-full rounded-md border bg-background/50 px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-border">
                  <option value="">Select role...</option>
                  {roleOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Resume Link */}
              <div className="space-y-2">
                <Label htmlFor="resumeUrl">Resume Link</Label>
                <Input id="resumeUrl" placeholder="https://drive.google.com/..." value={formData.resumeUrl} onChange={(e) => updateField('resumeUrl', e.target.value)} className={`bg-background/50 ${errors.resumeUrl ? 'border-red-500' : 'border-border'}`} />
                {errors.resumeUrl && <p className="text-red-500 text-xs">{errors.resumeUrl}</p>}
              </div>

              {/* Portfolio Link */}
              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Portfolio Link</Label>
                <Input id="portfolioUrl" placeholder="https://yourportfolio.com" value={formData.portfolioUrl} onChange={(e) => updateField('portfolioUrl', e.target.value)} className={`bg-background/50 ${errors.portfolioUrl ? 'border-red-500' : 'border-border'}`} />
                {errors.portfolioUrl && <p className="text-red-500 text-xs">{errors.portfolioUrl}</p>}
              </div>

              {/* Cover Letter */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="message">Cover Letter <span className="text-red-500">*</span></Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about yourself, why you're interested in this internship, and what you hope to learn..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  className={`bg-background/50 resize-none ${errors.message ? 'border-red-500' : 'border-border'}`}
                />
                {errors.message && <p className="text-red-500 text-xs">{errors.message}</p>}
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" /> Prefer Google Forms? Apply here
              </a>
              <Button type="submit" disabled={loading} className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit Application</>
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
