'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Bug,
  Search,
  Globe,
  Smartphone,
  Headphones,
  TrendingUp,
  FileCheck,
  Brain,
  Lock,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Service {
  name: string;
  icon: React.ElementType;
  description: string;
  accentRgb: string;
}

const services: Service[] = [
  {
    name: 'Cybersecurity',
    icon: Shield,
    description:
      'Comprehensive security solutions protecting your digital assets with military-grade defense systems and real-time threat monitoring.',
    accentRgb: '8, 145, 178',
  },
  {
    name: 'VAPT',
    icon: Bug,
    description:
      'Vulnerability Assessment and Penetration Testing to identify and eliminate security weaknesses before attackers exploit them.',
    accentRgb: '0, 102, 255',
  },
  {
    name: 'Digital Forensics',
    icon: Search,
    description:
      'Advanced forensic investigation and evidence analysis for cyber incidents, data breaches, and digital crime resolution.',
    accentRgb: '124, 58, 237',
  },
  {
    name: 'Web Development',
    icon: Globe,
    description:
      'Custom web applications built with cutting-edge technologies, responsive design, and enterprise-grade architecture.',
    accentRgb: '8, 145, 178',
  },
  {
    name: 'App Development',
    icon: Smartphone,
    description:
      'Native and cross-platform mobile applications with intuitive UX, high performance, and scalable backend systems.',
    accentRgb: '0, 102, 255',
  },
  {
    name: 'IT Support',
    icon: Headphones,
    description:
      '24/7 enterprise IT support, infrastructure management, and proactive monitoring to ensure business continuity.',
    accentRgb: '52, 211, 153',
  },
  {
    name: 'Digital Marketing',
    icon: TrendingUp,
    description:
      'Data-driven marketing strategies, SEO optimization, and brand growth solutions powered by analytics and AI.',
    accentRgb: '251, 191, 36',
  },
  {
    name: 'AMC Services',
    icon: FileCheck,
    description:
      'Annual Maintenance Contracts for comprehensive IT infrastructure management, updates, and dedicated support.',
    accentRgb: '8, 145, 178',
  },
  {
    name: 'AI Learning Systems',
    icon: Brain,
    description:
      'Intelligent learning platforms with adaptive curricula, personalized tutoring, and AI-powered educational experiences.',
    accentRgb: '124, 58, 237',
  },
  {
    name: 'Integrated Security Systems',
    icon: Lock,
    description:
      'End-to-end security integration combining physical and digital security for comprehensive organizational protection.',
    accentRgb: '0, 102, 255',
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
  const Icon = service.icon;

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      <div
        className="
          relative glass-card overflow-hidden h-full
          transition-all duration-300
          group-hover:scale-[1.02]
          group-hover:border-primary/20
          p-5 sm:p-6
        "
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
        <p
          className="text-foreground/80 leading-relaxed break-words text-sm"
        >
          {service.description}
        </p>


      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export default function ServicesSection() {
  return (
    <section id="services" aria-label="Services" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-4">
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
            From cybersecurity to AI-driven learning, we deliver end-to-end
            enterprise solutions that drive innovation and secure your digital
            future.
          </p>
        </motion.div>

        {/* Services grid - 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {services.map((service, i) => (
            <ServiceCard key={service.name} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
