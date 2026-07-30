'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Shield,
  Brain,
  Globe,
  Cloud,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Send,
  Package,
  MessageSquare,
  Mail,
  User,
  Building2,
  ShoppingCart,
  Users,
  Camera,
  Headphones,
  FileCheck,
  TrendingUp,
  Smartphone,
  Cpu,
  Bug,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/* ──────────── Types ──────────── */

interface Solution {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  features: string[] | null;
  pricing: string | null;
  demo_url: string | null;
  is_active: boolean;
}

/* ──────────── Hardcoded Solutions — one per service ──────────── */

const HARDCODED_SOLUTIONS = [
  {
    id: 'sol-ai-ml',
    name: 'AI & Machine Learning Solutions',
    slug: 'ai-machine-learning',
    tagline: 'Intelligent automation and predictive analytics for your business',
    description:
      'Leverage the power of artificial intelligence and machine learning to automate workflows, predict outcomes, and uncover insights hidden in your data. From NLP chatbots to computer vision systems, we build custom AI solutions that drive measurable business results.',
    features: [
      'Custom AI model development & training',
      'Predictive analytics & forecasting',
      'Natural Language Processing (NLP) solutions',
      'Computer vision & image recognition',
      'AI-powered process automation',
    ],
    pricing: 'Starting at ₹50,000',
    demo_url: null,
    is_active: true,
    icon: Brain,
    emoji: '🧠',
    gradient: 'from-violet-500/10 to-purple-500/10',
  },
  {
    id: 'sol-electronic-security',
    name: 'Electronic Security System',
    slug: 'electronic-security-system',
    tagline: 'Comprehensive physical-digital security integration',
    description:
      'End-to-end electronic security solutions including CCTV surveillance, access control, biometric authentication, intrusion detection systems, and integrated command centers. We design, deploy, and maintain security infrastructure for organizations of all sizes.',
    features: [
      'CCTV & IP surveillance systems',
      'Biometric access control (fingerprint, face, iris)',
      'Intrusion detection & alarm systems',
      'Integrated security command center',
      'Remote monitoring & mobile alerts',
    ],
    pricing: 'Starting at ₹1,50,000',
    demo_url: null,
    is_active: true,
    icon: Camera,
    emoji: '📹',
    gradient: 'from-red-500/10 to-rose-500/10',
  },
  {
    id: 'sol-cyber-security',
    name: 'CyberIntelligence360',
    slug: 'cyber-security',
    tagline: 'Enterprise-grade cybersecurity suite',
    description:
      'A comprehensive cybersecurity platform combining threat intelligence, vulnerability scanning, incident response, and compliance management in one unified dashboard. Protect your organization against advanced persistent threats and zero-day exploits.',
    features: [
      'Real-time threat monitoring & SIEM',
      'Automated vulnerability scanning',
      'Incident response automation',
      'Compliance dashboard (SOC2, GDPR, ISO 27001)',
      'Security awareness training modules',
    ],
    pricing: 'Custom pricing',
    demo_url: null,
    is_active: true,
    icon: Shield,
    emoji: '🛡️',
    gradient: 'from-emerald-500/10 to-teal-500/10',
  },
  {
    id: 'sol-website-dev',
    name: 'WebCraft Pro',
    slug: 'website-development',
    tagline: 'Professional website & web application development',
    description:
      'From stunning corporate websites to complex web applications, WebCraft Pro delivers scalable, secure, and blazing-fast digital experiences. We use modern frameworks, responsive design, and SEO best practices to maximize your online presence.',
    features: [
      'Custom website design & development',
      'Progressive web apps (PWA)',
      'E-commerce & marketplace platforms',
      'API development & third-party integration',
      'Performance optimization & SEO',
    ],
    pricing: 'Starting at ₹25,000',
    demo_url: null,
    is_active: true,
    icon: Globe,
    emoji: '🌐',
    gradient: 'from-cyan-500/10 to-blue-500/10',
  },
  {
    id: 'sol-app-dev',
    name: 'AppForge Studio',
    slug: 'application-development',
    tagline: 'Native and cross-platform mobile applications',
    description:
      'Build powerful mobile applications with intuitive UX, high performance, and scalable backend systems. From React Native to Flutter, we craft apps that delight users and drive business growth on iOS, Android, and cross-platform.',
    features: [
      'iOS & Android native development',
      'Cross-platform (React Native / Flutter)',
      'UI/UX design & prototyping',
      'Backend API & cloud integration',
      'App Store optimization & deployment',
    ],
    pricing: 'Starting at ₹40,000',
    demo_url: null,
    is_active: true,
    icon: Smartphone,
    emoji: '📱',
    gradient: 'from-blue-500/10 to-indigo-500/10',
  },
  {
    id: 'sol-it-supports',
    name: 'IT Care 24/7',
    slug: 'it-supports',
    tagline: 'Round-the-clock enterprise IT support and infrastructure management',
    description:
      'Comprehensive IT support services including helpdesk, infrastructure management, network monitoring, cloud migration, and proactive maintenance. Our certified engineers ensure your business runs without interruptions, 24 hours a day, 7 days a week.',
    features: [
      '24/7 helpdesk & remote support',
      'Network monitoring & management',
      'Cloud migration & optimization',
      'Disaster recovery & backup solutions',
      'IT asset lifecycle management',
    ],
    pricing: 'Starting at ₹15,000/month',
    demo_url: null,
    is_active: true,
    icon: Headphones,
    emoji: '🎧',
    gradient: 'from-green-500/10 to-emerald-500/10',
  },
  {
    id: 'sol-digital-marketing',
    name: 'GrowthPulse Digital',
    slug: 'digital-marketing',
    tagline: 'Data-driven marketing strategies for measurable growth',
    description:
      'Full-spectrum digital marketing solutions powered by data analytics and AI. From SEO and content marketing to social media management and PPC campaigns, we help you reach the right audience, generate leads, and grow your brand effectively.',
    features: [
      'SEO & SEM optimization',
      'Social media strategy & management',
      'Content marketing & copywriting',
      'PPC campaign management (Google, Meta)',
      'Analytics, reporting & A/B testing',
    ],
    pricing: 'Starting at ₹20,000/month',
    demo_url: null,
    is_active: true,
    icon: TrendingUp,
    emoji: '📈',
    gradient: 'from-amber-500/10 to-orange-500/10',
  },
  {
    id: 'sol-amc',
    name: 'ShieldGuard AMC',
    slug: 'amc-services',
    tagline: 'Annual Maintenance Contracts for complete IT peace of mind',
    description:
      'Comprehensive Annual Maintenance Contracts covering IT infrastructure, software updates, security patching, hardware maintenance, and dedicated support. Choose from Silver, Gold, and Platinum tiers based on your organization\'s needs.',
    features: [
      'Regular preventive maintenance',
      'Priority support with SLA guarantees',
      'Security patching & software updates',
      'Hardware maintenance & replacement',
      'Quarterly health check reports',
    ],
    pricing: 'Starting at ₹12,000/year',
    demo_url: null,
    is_active: true,
    icon: FileCheck,
    emoji: '📋',
    gradient: 'from-teal-500/10 to-cyan-500/10',
  },
  {
    id: 'sol-hiring-career',
    name: 'CareerBridge Pro',
    slug: 'hiring-career-guidance',
    tagline: 'Professional recruitment and career development services',
    description:
      'Comprehensive hiring solutions for employers and career guidance for job seekers. We offer recruitment services, skill assessment, interview preparation, resume building workshops, and industry-relevant training programs to bridge the talent gap.',
    features: [
      'Professional recruitment & staffing',
      'Skill assessment & aptitude testing',
      'Resume building & interview prep workshops',
      'Industry-certified training programs',
      'Campus placement & internship coordination',
    ],
    pricing: 'Starting at ₹5,000',
    demo_url: null,
    is_active: true,
    icon: Users,
    emoji: '👥',
    gradient: 'from-purple-500/10 to-pink-500/10',
  },
  {
    id: 'sol-vapt',
    name: 'ThreatHunter VAPT',
    slug: 'vapt',
    tagline: 'Certified vulnerability assessment and penetration testing',
    description:
      'Identify and eliminate security weaknesses before attackers exploit them. Our certified VAPT services follow OWASP and NIST methodologies to provide thorough security assessments with actionable remediation guidance.',
    features: [
      'OWASP Top 10 vulnerability assessment',
      'Network & infrastructure penetration testing',
      'Web & mobile application security testing',
      'Social engineering assessments',
      'Detailed reporting & remediation guidance',
    ],
    pricing: 'Starting at ₹35,000',
    demo_url: null,
    is_active: true,
    icon: Bug,
    emoji: '🔍',
    gradient: 'from-sky-500/10 to-blue-500/10',
  },
  {
    id: 'sol-digital-forensics',
    name: 'ForensiLab',
    slug: 'digital-forensics',
    tagline: 'Advanced digital forensic investigation and evidence analysis',
    description:
      'Professional digital forensic services for cyber incidents, data breaches, intellectual property theft, and digital crime resolution. Our forensic experts provide courtroom-ready evidence analysis and detailed investigative reports.',
    features: [
      'Disk & memory forensics',
      'Network traffic analysis',
      'Mobile device forensics',
      'Email & communication analysis',
      'Courtroom-ready expert reporting',
    ],
    pricing: 'Custom pricing',
    demo_url: null,
    is_active: true,
    icon: Search,
    emoji: '🔬',
    gradient: 'from-indigo-500/10 to-violet-500/10',
  },
  {
    id: 'sol-it-infra',
    name: 'InfraCore Solutions',
    slug: 'it-infrastructure-networking',
    tagline: 'Complete IT infrastructure design, deployment, and management',
    description:
      'End-to-end IT infrastructure solutions including server setup, networking, cloud architecture, virtualization, and disaster recovery planning. We build resilient, scalable infrastructure that supports your business growth.',
    features: [
      'Server & storage infrastructure design',
      'Network architecture & deployment',
      'Cloud migration & hybrid setups',
      'Virtualization (VMware, Hyper-V, KVM)',
      'Disaster recovery & business continuity',
    ],
    pricing: 'Starting at ₹75,000',
    demo_url: null,
    is_active: true,
    icon: Cpu,
    emoji: '🖥️',
    gradient: 'from-lime-500/10 to-green-500/10',
  },
];

/* ──────────── Animation Variants ──────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ──────────── Order Modal ──────────── */

function OrderModal({
  open,
  onClose,
  solution,
}: {
  open: boolean;
  onClose: () => void;
  solution: { id: string; name: string } | null;
}) {
  const { user, token } = useAuth();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!solution) return;

    if (!user) {
      toast.error('Please log in to place an order.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/solution-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          solution_id: solution.id,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order placed for ${solution.name}! We'll be in touch soon.`);
        setNotes('');
        onClose();
      } else {
        toast.error(data.error || 'Failed to place order.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Order {solution?.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Place your order and our team will reach out within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {solution && (
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <p className="text-sm font-medium text-foreground">{solution.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Solution ID: {solution.id.slice(0, 8)}...</p>
            </div>
          )}

          {!user && (
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Please log in to place an order. You&apos;ll need an account to track your order status.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="order-notes" className="text-sm font-medium mb-1.5 block">
              Additional Notes (optional)
            </Label>
            <Textarea
              id="order-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell us about your requirements, team size, timeline..."
              rows={4}
              className="bg-secondary/50 border-border resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !user}
              className="flex-1 btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Placing Order...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Place Order</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────── Solution Card Component ──────────── */

function SolutionCard({
  solution,
  onOrder,
}: {
  solution: typeof HARDCODED_SOLUTIONS[number];
  onOrder: (sol: typeof HARDCODED_SOLUTIONS[number]) => void;
}) {
  const Icon = solution.icon;

  return (
    <motion.div variants={fadeUp}>
      <Card className="h-full overflow-hidden glass-card hover:border-primary/20 transition-all duration-300 group">
        <CardContent className="p-5 sm:p-6 flex flex-col h-full">
          {/* Icon + Name */}
          <div className="flex items-start gap-3 mb-4">
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${solution.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
            >
              <span className="text-2xl" role="img" aria-label={solution.name}>
                {solution.emoji}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {solution.name}
              </h3>
              {solution.tagline && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                  {solution.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
            {solution.description}
          </p>

          {/* Features */}
          {solution.features && solution.features.length > 0 && (
            <div className="space-y-1.5 mb-4 flex-1">
              {solution.features.slice(0, 5).map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Pricing + CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
            <div>
              {solution.pricing && (
                <span className="text-sm font-semibold text-gradient-cyan">
                  {solution.pricing}
                </span>
              )}
            </div>
            <Button
              onClick={() => onOrder(solution)}
              size="sm"
              className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-xs"
            >
              Order Now
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ──────────── Main Solutions Page ──────────── */

export default function SolutionsPage() {
  const [solutions, setSolutions] = useState<typeof HARDCODED_SOLUTIONS>(HARDCODED_SOLUTIONS);
  const [loading, setLoading] = useState(true);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<typeof HARDCODED_SOLUTIONS[number] | null>(null);

  // Custom solution form
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [customRequirements, setCustomRequirements] = useState('');
  const [customSubmitting, setCustomSubmitting] = useState(false);

  const fetchSolutions = useCallback(async () => {
    try {
      const res = await fetch('/api/solutions');
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        // Map API solutions to our format with icon assignments
        const icons = [Brain, Camera, Shield, Globe, Smartphone, Headphones, TrendingUp, FileCheck, Users, Bug, Search, Cpu];
        const emojis = ['🧠', '📹', '🛡️', '🌐', '📱', '🎧', '📈', '📋', '👥', '🔍', '🔬', '🖥️'];
        const gradients = [
          'from-violet-500/10 to-purple-500/10',
          'from-red-500/10 to-rose-500/10',
          'from-emerald-500/10 to-teal-500/10',
          'from-cyan-500/10 to-blue-500/10',
          'from-blue-500/10 to-indigo-500/10',
          'from-green-500/10 to-emerald-500/10',
          'from-amber-500/10 to-orange-500/10',
          'from-teal-500/10 to-cyan-500/10',
          'from-purple-500/10 to-pink-500/10',
          'from-sky-500/10 to-blue-500/10',
          'from-indigo-500/10 to-violet-500/10',
          'from-lime-500/10 to-green-500/10',
        ];
        const apiSolutions = data.data.map((sol: Solution, idx: number) => {
          const i = idx % icons.length;
          return {
            id: sol.id,
            name: sol.name,
            slug: sol.slug,
            tagline: sol.tagline,
            description: sol.description,
            features: sol.features,
            pricing: sol.pricing,
            demo_url: sol.demo_url,
            is_active: sol.is_active,
            icon: icons[i],
            emoji: emojis[i],
            gradient: gradients[i],
          };
        });
        // Merge: API solutions first, then any hardcoded ones not in API
        const apiSlugs = apiSolutions.map((s: typeof HARDCODED_SOLUTIONS[number]) => s.slug);
        const extraHardcoded = HARDCODED_SOLUTIONS.filter((s) => !apiSlugs.includes(s.slug));
        setSolutions([...apiSolutions, ...extraHardcoded]);
      }
    } catch {
      // Use hardcoded solutions as fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  const handleOrder = (solution: typeof HARDCODED_SOLUTIONS[number]) => {
    setSelectedSolution(solution);
    setOrderModalOpen(true);
  };

  const handleCustomSubmit = async () => {
    if (!customName.trim() || !customEmail.trim() || !customRequirements.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setCustomSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customName,
          email: customEmail,
          company: customCompany || undefined,
          message: `[Custom Solution Request]\n\n${customRequirements}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Request submitted! Our team will contact you within 48 hours.');
        setCustomName('');
        setCustomEmail('');
        setCustomCompany('');
        setCustomRequirements('');
      } else {
        toast.error(data.error || 'Failed to submit request.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setCustomSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-radial-cyan opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <motion.div
          className="relative max-w-7xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="glass-card inline-flex items-center gap-2 px-4 py-2 text-sm text-primary font-medium mb-6">
            <Package className="w-4 h-4" />
            Products & Solutions
          </span>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Our <span className="text-gradient-cyan">Solutions</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            From AI-powered analytics to enterprise cybersecurity, electronic security systems, and career services — ABWcurious delivers innovative products that transform businesses and empower individuals.
          </p>
        </motion.div>
      </section>

      {/* Solutions Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading solutions...</span>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {solutions.map((solution) => (
                <SolutionCard
                  key={solution.id}
                  solution={solution}
                  onOrder={handleOrder}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Request Custom Solution Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card border-border/40 overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h2
                    className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
                    style={{ fontFamily: 'var(--font-space-grotesk)' }}
                  >
                    Request a <span className="text-gradient-cyan">Custom Solution</span>
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Can&apos;t find what you need? Tell us about your requirements and we&apos;ll build it for you.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="custom-name" className="text-sm font-medium mb-1.5 block">
                        Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="custom-name"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="Your full name"
                          className="pl-10 bg-secondary/50 border-border h-11"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="custom-email" className="text-sm font-medium mb-1.5 block">
                        Email *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="custom-email"
                          type="email"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="pl-10 bg-secondary/50 border-border h-11"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="custom-company" className="text-sm font-medium mb-1.5 block">
                      Company
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="custom-company"
                        value={customCompany}
                        onChange={(e) => setCustomCompany(e.target.value)}
                        placeholder="Your company name"
                        className="pl-10 bg-secondary/50 border-border h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="custom-requirements" className="text-sm font-medium mb-1.5 block">
                      Requirements *
                    </Label>
                    <Textarea
                      id="custom-requirements"
                      value={customRequirements}
                      onChange={(e) => setCustomRequirements(e.target.value)}
                      placeholder="Describe what you need — features, integrations, scale, timeline, budget..."
                      rows={5}
                      className="bg-secondary/50 border-border resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleCustomSubmit}
                    disabled={customSubmitting}
                    className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold h-11"
                  >
                    {customSubmitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" /> Submit Request</>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Order Modal */}
      <OrderModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        solution={selectedSolution}
      />
    </div>
  );
}
