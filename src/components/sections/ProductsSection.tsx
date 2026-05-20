'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Code2,
  UtensilsCrossed,
  GraduationCap,
  ExternalLink,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Product {
  name: string;
  url: string;
  icon: React.ElementType;
  accent: string;
  accentRgb: string;
  gradientClass: string;
  description: string;
  tags: string[];
  comingSoon?: boolean;
}

const products: Product[] = [
  {
    name: 'CyberIntelligence360',
    url: 'https://cyberintelligence360.vercel.app/',
    icon: ShieldCheck,
    accent: 'text-primary',
    accentRgb: '8, 145, 178',
    gradientClass: 'from-primary to-accent',
    description:
      'Advanced cyber intelligence platform for digital forensics, security analytics, investigations, and AI-powered security tools. Enterprise-grade threat detection and response.',
    tags: ['Cyber Intelligence', 'Digital Forensics', 'AI Security', 'Threat Analytics'],
  },
  {
    name: 'TheCodeArena',
    url: 'https://thecodearena.vercel.app/',
    icon: Code2,
    accent: 'text-neon-blue',
    accentRgb: '0, 102, 255',
    gradientClass: 'from-neon-blue to-blue-400',
    description:
      'Next-generation developer ecosystem for coding, programming education, AI coding tools, and developer collaboration. Build, learn, and compete.',
    tags: ['Developer Tools', 'Coding Education', 'AI Coding', 'Collaboration'],
  },
  {
    name: 'Restaurant360',
    url: '#',
    icon: UtensilsCrossed,
    accent: 'text-amber-400',
    accentRgb: '251, 191, 36',
    gradientClass: 'from-amber-400 to-yellow-500',
    description:
      'Smart restaurant management platform with AI automation, analytics, and complete digital transformation for the hospitality industry.',
    tags: ['Smart Management', 'AI Automation', 'Analytics', 'Digital Transformation'],
    comingSoon: true,
  },
  {
    name: 'StudySpark',
    url: 'https://advancedstudyspark.vercel.app/',
    icon: GraduationCap,
    accent: 'text-emerald-400',
    accentRgb: '52, 211, 153',
    gradientClass: 'from-emerald-400 to-green-500',
    description:
      'AI-powered adaptive learning platform with smart tutoring, personalized education paths, and future-ready learning systems for students and professionals.',
    tags: ['AI Learning', 'Adaptive Education', 'Smart Tutoring', 'Future Learning'],
  },
];

/* ------------------------------------------------------------------ */
/*  3D Tilt Card                                                       */
/* ------------------------------------------------------------------ */

function ProductCard({ product, index }: { product: Product; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x: y * -12, y: x * 12 });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const Icon = product.icon;
  const isComingSoon = product.comingSoon;

  return (
    <motion.div
      ref={cardRef}
      className={`relative group ${isComingSoon ? 'opacity-80' : ''}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: 'easeOut' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <a
        href={isComingSoon ? undefined : product.url}
        target={isComingSoon ? undefined : '_blank'}
        rel={isComingSoon ? undefined : 'noopener noreferrer'}
        className="block"
        onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
      >
        <div
          className="relative glass-card overflow-hidden p-5 sm:p-6 transition-all duration-300"
          style={{
            transform: isHovered
              ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02,1.02,1.02)`
              : 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
            transition: 'transform 0.15s ease-out, box-shadow 0.3s ease',
            boxShadow: isHovered
              ? `0 0 25px rgba(${product.accentRgb}, 0.15), 0 0 50px rgba(${product.accentRgb}, 0.06), inset 0 0 20px rgba(${product.accentRgb}, 0.03)`
              : 'none',
            borderColor: isHovered
              ? `rgba(${product.accentRgb}, 0.3)`
              : undefined,
          }}
        >
          {/* Holographic shimmer overlay on hover */}
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(105deg, transparent 20%, rgba(${product.accentRgb}, 0.04) 35%, rgba(${product.accentRgb}, 0.08) 42%, rgba(${product.accentRgb}, 0.04) 50%, transparent 65%)`,
              backgroundSize: '250% 100%',
              animation: 'holographic-shimmer 3s linear infinite',
            }}
          />

          {/* Coming Soon badge */}
          {isComingSoon && (
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold tracking-widest rounded-full bg-amber-500/20 text-amber-400 dark:text-amber-300 border border-amber-500/30 backdrop-blur-sm">
                <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-amber-400" />
                COMING SOON
              </span>
            </div>
          )}

          {/* Icon with animated glow */}
          <div className="mb-5 relative inline-flex">
            <div
              className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
              style={{ backgroundColor: `rgba(${product.accentRgb}, 0.25)` }}
            />
            <div
              className="relative flex items-center justify-center w-14 h-14 rounded-xl border transition-colors duration-300"
              style={{
                background: `rgba(${product.accentRgb}, 0.08)`,
                borderColor: `rgba(${product.accentRgb}, 0.15)`,
              }}
            >
              <Icon
                className={`w-7 h-7 ${product.accent}`}
                strokeWidth={1.8}
              />
            </div>
          </div>

          {/* Product name */}
          <h3
            className="text-xl sm:text-2xl font-bold mb-3"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(${product.accentRgb},1), rgba(${product.accentRgb},0.7))`,
              fontFamily: 'var(--font-space-grotesk)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-foreground/80 text-sm leading-relaxed mb-5 break-words">
            {product.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium rounded-full border"
                style={{
                  background: `rgba(${product.accentRgb}, 0.06)`,
                  borderColor: `rgba(${product.accentRgb}, 0.12)`,
                  color: `rgba(${product.accentRgb}, 0.8)`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA button */}
          {isComingSoon ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-300 cursor-not-allowed">
              <Clock className="w-4 h-4" />
              Coming Soon
            </div>
          ) : (
            <div
              className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, rgba(${product.accentRgb},0.12), rgba(${product.accentRgb},0.06))`,
                borderColor: `rgba(${product.accentRgb}, 0.2)`,
                color: `rgba(${product.accentRgb}, 1)`,
              }}
            >
              Visit Product
              <ArrowUpRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </a>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export default function ProductsSection() {
  return (
    <section id="products" aria-label="Products" className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
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
            Our Products
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            <span className="text-gradient-holographic">Our</span>{' '}
            <span className="text-foreground">Products</span>
          </h2>
          <p className="text-foreground/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Explore our suite of cutting-edge products designed to empower
            businesses and individuals across cybersecurity, education, and
            digital transformation.
          </p>
        </motion.div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.name} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
