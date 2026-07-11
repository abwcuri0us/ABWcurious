'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Globe,
  Smartphone,
  TrendingUp,
  FileCheck,
  Brain,
  Users,
  Camera,
  MonitorSpeaker,
  ChevronRight,
  ShieldCheck,
  Search,
  Bug,
  Radar,
  Code,
  Cloud,
  Target,
  Server,
  Workflow,
  Palette,
  Image,
  Video,
  FileText,
  GraduationCap,
  Briefcase,
  Bot,
  Award,
  BookOpen,
  Rocket,
  Microscope,
  Lightbulb,
  Layers,
  Lock,
} from 'lucide-react';
import { useNavigation } from '@/contexts/NavigationContext';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Service {
  name: string;
  slug: string;
  icon: React.ElementType;
  description: string;
  accentRgb: string;
  category: 'security' | 'digital' | 'learning';
}

interface CategoryDef {
  id: 'all' | 'security' | 'digital' | 'learning';
  label: string;
  icon: React.ElementType;
  accentRgb: string;
}

/* ------------------------------------------------------------------ */
/*  Category Definitions                                               */
/* ------------------------------------------------------------------ */

const categories: CategoryDef[] = [
  { id: 'all', label: 'All Services', icon: Layers, accentRgb: '124, 58, 237' },
  { id: 'security', label: 'Security', icon: Shield, accentRgb: '8, 145, 178' },
  { id: 'digital', label: 'Digital', icon: Globe, accentRgb: '180, 83, 9' },
  { id: 'learning', label: 'Learning / Careers', icon: GraduationCap, accentRgb: '124, 58, 237' },
];

/* ------------------------------------------------------------------ */
/*  Service Data                                                       */
/* ------------------------------------------------------------------ */

const services: Service[] = [
  // ── Security ──────────────────────────────────────────────────────
  {
    name: 'CCTV Surveillance',
    slug: 'cctv-surveillance',
    icon: Camera,
    description:
      'Advanced CCTV surveillance systems with AI-powered analytics, remote monitoring, night vision, and cloud storage for round-the-clock security coverage.',
    accentRgb: '8, 145, 178',
    category: 'security',
  },
  {
    name: 'Cyber Security',
    slug: 'cyber-security',
    icon: Shield,
    description:
      'End-to-end cybersecurity solutions protecting your digital assets with threat intelligence, incident response, compliance management, and proactive defense strategies.',
    accentRgb: '8, 145, 178',
    category: 'security',
  },
  {
    name: 'VAPT — Vulnerability Assessment & Penetration Testing',
    slug: 'vapt',
    icon: ShieldCheck,
    description:
      'Comprehensive vulnerability assessments and penetration testing to identify security gaps, simulate real-world attacks, and fortify your infrastructure against threats.',
    accentRgb: '8, 145, 178',
    category: 'security',
  },
  {
    name: 'Digital Forensics',
    slug: 'digital-forensics',
    icon: Search,
    description:
      'Expert digital forensic investigation services including data recovery, evidence analysis, incident reconstruction, and courtroom-ready reporting for cyber incidents.',
    accentRgb: '8, 145, 178',
    category: 'security',
  },
  {
    name: 'Antivirus Solutions',
    slug: 'antivirus-solutions',
    icon: Bug,
    description:
      'Enterprise-grade antivirus and anti-malware solutions with real-time threat detection, zero-day protection, automated remediation, and centralized management.',
    accentRgb: '8, 145, 178',
    category: 'security',
  },
  {
    name: 'IDS/IPS (Intrusion Detection System)',
    slug: 'intrusion-detection-systems',
    icon: Radar,
    description:
      'Network and host-based intrusion detection and prevention systems with real-time alerting, anomaly detection, deep packet inspection, and seamless SIEM integration.',
    accentRgb: '8, 145, 178',
    category: 'security',
  },
  {
    name: 'Access Control Systems',
    slug: 'access-control-systems',
    icon: MonitorSpeaker,
    description:
      'Integrated access control solutions — biometric systems, keycard entry, alarm monitoring, intercoms, and perimeter protection for complete physical security.',
    accentRgb: '8, 145, 178',
    category: 'security',
  },
  {
    name: 'Firewall Solutions',
    slug: 'firewall-solutions',
    icon: Lock,
    description:
      'Advanced firewall solutions with next-gen threat prevention, deep packet inspection, VPN support, intrusion prevention, and centralized policy management for robust network security.',
    accentRgb: '8, 145, 178',
    category: 'security',
  },

  // ── Digital ───────────────────────────────────────────────────────
  {
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    icon: TrendingUp,
    description:
      'Data-driven marketing strategies, SEO/SEM optimization, social media management, content marketing, PPC campaigns, and brand growth solutions powered by analytics and AI.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'Software/IT Solutions',
    slug: 'software-it-solutions',
    icon: Code,
    description:
      'Custom software development and IT solutions tailored to your business — from enterprise systems and APIs to legacy modernization and cloud-native architectures.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'Website Development',
    slug: 'website-development',
    icon: Globe,
    description:
      'Custom websites and web applications built with cutting-edge technologies, responsive design, SEO optimization, and enterprise-grade architecture for maximum performance.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'Software Application Development',
    slug: 'software-application-development',
    icon: Smartphone,
    description:
      'Native and cross-platform mobile applications with intuitive UX, high performance, scalable backend systems, and seamless third-party integrations.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'SaaS Solutions',
    slug: 'saas-solutions',
    icon: Cloud,
    description:
      'Scalable Software-as-a-Service platforms with multi-tenant architecture, subscription billing, auto-scaling, and continuous delivery for rapid market deployment.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'AI Solutions',
    slug: 'ai-solutions',
    icon: Brain,
    description:
      'Cutting-edge AI/ML solutions including predictive analytics, natural language processing, computer vision, and intelligent automation to transform your business operations.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'Lead Generation',
    slug: 'lead-generation',
    icon: Target,
    description:
      'Strategic lead generation campaigns with AI-powered prospecting, multi-channel outreach, conversion optimization, and CRM integration for consistent pipeline growth.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'CRM Solutions',
    slug: 'crm-solutions',
    icon: Users,
    description:
      'Customer Relationship Management solutions with sales pipeline automation, contact management, analytics dashboards, and seamless integration with marketing tools.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'AMC (Annual Maintenance Contract)',
    slug: 'amc-annual-maintenance-contract',
    icon: FileCheck,
    description:
      'Annual Maintenance Contracts for comprehensive IT infrastructure management, regular updates, security patching, dedicated support, and performance optimization.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'Server Management',
    slug: 'server-management',
    icon: Server,
    description:
      'Enterprise server management with proactive monitoring, load balancing, auto-scaling, disaster recovery, and 99.99% uptime guarantees for mission-critical systems.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'Work Automations',
    slug: 'work-automations',
    icon: Workflow,
    description:
      'Intelligent workflow automation solutions — RPA, process orchestration, API integrations, and custom automation pipelines that eliminate manual tasks and boost efficiency.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'Banner Designing',
    slug: 'banner-designing',
    icon: Palette,
    description:
      'Eye-catching banner design for web, social media, and print — crafted with brand consistency, compelling visuals, and conversion-focused layouts.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'Posters',
    slug: 'posters',
    icon: Image,
    description:
      'High-impact poster and flyer designs for events, promotions, and brand campaigns — combining striking visuals with clear messaging for maximum engagement.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'Ads Shooting',
    slug: 'ads-shooting',
    icon: Video,
    description:
      'Professional ad film production from concept to delivery — scripting, shooting, editing, motion graphics, and multi-platform optimization for maximum reach.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },
  {
    name: 'Pamphlets',
    slug: 'pamphlets',
    icon: FileText,
    description:
      'Professionally designed pamphlets and brochures with compelling layouts, brand-aligned visuals, and persuasive copy for print and digital distribution.',
    accentRgb: '180, 83, 9',
    category: 'digital',
  },

  // ── Learning / Careers ────────────────────────────────────────────
  {
    name: 'Training Programs',
    slug: 'training-programs',
    icon: GraduationCap,
    description:
      'Industry-aligned professional training programs with expert instructors, hands-on labs, real-world projects, and certifications across cybersecurity, cloud, and AI domains.',
    accentRgb: '124, 58, 237',
    category: 'learning',
  },
  {
    name: 'Internships',
    slug: 'internships',
    icon: Briefcase,
    description:
      'Immersive internship programs with mentorship, real project experience, industry exposure, and placement assistance to launch your career in technology.',
    accentRgb: '124, 58, 237',
    category: 'learning',
  },
  {
    name: 'AI Tutor',
    slug: 'ai-tutor',
    icon: Bot,
    description:
      'AI-powered personalized tutoring with adaptive learning paths, instant doubt resolution, progress tracking, and intelligent recommendations for accelerated skill mastery.',
    accentRgb: '124, 58, 237',
    category: 'learning',
  },
  {
    name: 'Certifications',
    slug: 'certifications',
    icon: Award,
    description:
      'Globally recognized certification programs in cybersecurity, cloud computing, AI/ML, and project management with exam prep, practice tests, and credential verification.',
    accentRgb: '124, 58, 237',
    category: 'learning',
  },
  {
    name: 'Courses',
    slug: 'courses',
    icon: BookOpen,
    description:
      'Self-paced online courses with video lectures, interactive assignments, peer communities, and completion certificates — learn anytime, anywhere, on any device.',
    accentRgb: '124, 58, 237',
    category: 'learning',
  },
  {
    name: 'Skill Development',
    slug: 'skill-development',
    icon: Rocket,
    description:
      'Accelerated skill development bootcamps and workshops focused on in-demand technologies, soft skills, and leadership to fast-track your professional growth.',
    accentRgb: '124, 58, 237',
    category: 'learning',
  },
  {
    name: 'Research Programs',
    slug: 'research-programs',
    icon: Microscope,
    description:
      'Collaborative research programs in AI, cybersecurity, and emerging technologies with academic partnerships, publication support, and innovation grants.',
    accentRgb: '124, 58, 237',
    category: 'learning',
  },
  {
    name: 'Innovation Programs',
    slug: 'innovation-programs',
    icon: Lightbulb,
    description:
      'Innovation incubation programs with ideation workshops, prototype development, mentorship from industry leaders, and startup acceleration support.',
    accentRgb: '124, 58, 237',
    category: 'learning',
  },

];

/* ------------------------------------------------------------------ */
/*  Service Card                                                       */
/* ------------------------------------------------------------------ */

function ServiceCard({
  service,
  index,
}: {
  service: Service;
  index: number;
}) {
  const { navigate } = useNavigation();
  const Icon = service.icon;

  const handleClick = () => {
    navigate('service-detail', { slug: service.slug });
  };

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15, scale: 0.97 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: 'easeOut' }}
    >
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`
          relative glass-card overflow-hidden h-full
          transition-all duration-200
          group-hover:scale-[1.02]
          active:scale-[0.97]
          group-hover:border-primary/20
          cursor-pointer
          p-5 sm:p-6
        `}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = `rgba(${service.accentRgb}, 0.25)`;
          el.style.boxShadow = `0 0 20px rgba(${service.accentRgb}, 0.08), inset 0 0 15px rgba(${service.accentRgb}, 0.03)`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = '';
          el.style.boxShadow = 'none';
        }}
      >
        {/* Subtle gradient accent at top */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${service.accentRgb}, 0.5), transparent)`,
          }}
        />

        {/* Icon */}
        <div className="mb-4 relative inline-flex">
          <div
            className="absolute inset-0 rounded-lg blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500"
            style={{ backgroundColor: `rgba(${service.accentRgb}, 0.3)` }}
          />
          <div
            className="relative flex items-center justify-center w-12 h-12 rounded-lg border transition-all duration-300"
            style={{
              background: `rgba(${service.accentRgb}, 0.06)`,
              borderColor: `rgba(${service.accentRgb}, 0.1)`,
            }}
          >
            <Icon
              className="w-6 h-6"
              style={{ color: `rgba(${service.accentRgb}, 0.9)` }}
              strokeWidth={1.8}
            />
          </div>
        </div>

        {/* Service name */}
        <h3
          className="font-bold mb-2 text-foreground text-lg"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(${service.accentRgb},1), rgba(${service.accentRgb},0.65))`,
            }}
          >
            {service.name}
          </span>
        </h3>

        {/* Description */}
        <p className="text-foreground/80 leading-relaxed text-sm">
          {service.description}
        </p>

        {/* Learn more hint */}
        <div
          className="mt-4 flex items-center gap-1 text-xs font-medium transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
          style={{ color: `rgba(${service.accentRgb}, 0.8)` }}
        >
          Learn more
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export default function ServicesSection() {
  const [activeCategory, setActiveCategory] = useState<CategoryDef['id']>('all');

  const filteredServices =
    activeCategory === 'all'
      ? services
      : services.filter((s) => s.category === activeCategory);

  const activeCategoryDef = categories.find((c) => c.id === activeCategory)!;

  return (
    <section id="services" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-4">
            Enterprise Solutions
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            <span className="text-foreground">Our </span>
            <span className="text-gradient-holographic">Services</span>
          </h2>
          <p className="text-foreground/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Comprehensive solutions across security, digital innovation, and
            professional development — empowering your business to thrive in the
            modern landscape.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex justify-center">
            <div className="inline-flex gap-2 sm:gap-3 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-muted/30">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                const CatIcon = cat.icon;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`
                      relative flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3
                      rounded-lg text-sm font-medium
                      transition-all duration-300 whitespace-nowrap
                      border
                      ${
                        isActive
                          ? 'text-white border-transparent'
                          : 'text-foreground/70 bg-transparent border-border/50 hover:border-border hover:text-foreground'
                      }
                    `}
                    style={
                      isActive
                        ? {
                            backgroundColor: `rgba(${cat.accentRgb}, 0.15)`,
                            borderColor: `rgba(${cat.accentRgb}, 0.3)`,
                            color: `rgba(${cat.accentRgb}, 1)`,
                            boxShadow: `0 0 16px rgba(${cat.accentRgb}, 0.1)`,
                          }
                        : undefined
                    }
                  >
                    <CatIcon className="w-4 h-4" strokeWidth={1.8} />
                    <span>{cat.label}</span>
                    {/* Active underline */}
                    {isActive && (
                      <motion.div
                        layoutId="categoryUnderline"
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                        style={{
                          backgroundColor: `rgba(${cat.accentRgb}, 0.7)`,
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service count indicator */}
          <motion.p
            key={activeCategory}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-4 text-xs text-foreground/50 tracking-wide"
          >
            Showing {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
            {activeCategory !== 'all' && (
              <span>
                {' '}
                in{' '}
                <span
                  className="font-semibold"
                  style={{ color: `rgba(${activeCategoryDef.accentRgb}, 0.8)` }}
                >
                  {activeCategoryDef.label}
                </span>
              </span>
            )}
          </motion.p>
        </motion.div>

        {/* Services grid with AnimatePresence for smooth tab transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 auto-rows-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {filteredServices.map((service, i) => (
              <ServiceCard key={service.slug} service={service} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
