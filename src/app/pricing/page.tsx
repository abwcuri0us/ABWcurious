'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Star, Shield, Zap, Building2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const tiers = [
  {
    name: 'Starter',
    icon: Zap,
    price: '₹49,999',
    period: '/mo',
    description: 'Perfect for small businesses getting started with cybersecurity.',
    features: [
      { name: 'Basic cybersecurity assessment', included: true },
      { name: 'Web vulnerability scan', included: true },
      { name: 'Monthly reports', included: true },
      { name: 'Email support', included: true },
      { name: '1 project', included: true },
      { name: 'Advanced VAPT', included: false },
      { name: 'Digital forensics', included: false },
      { name: '24/7 monitoring', included: false },
      { name: 'AI-powered threat detection', included: false },
      { name: 'Dedicated security team', included: false },
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    icon: Shield,
    price: '₹1,49,999',
    period: '/mo',
    description: 'For growing businesses that need advanced security and development.',
    features: [
      { name: 'Advanced VAPT', included: true },
      { name: 'Digital forensics', included: true },
      { name: 'Web + App development', included: true },
      { name: '24/7 monitoring', included: true },
      { name: 'Priority support', included: true },
      { name: '5 projects', included: true },
      { name: 'Basic cybersecurity assessment', included: true },
      { name: 'AI-powered threat detection', included: false },
      { name: 'Dedicated security team', included: false },
      { name: 'Unlimited projects', included: false },
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: 'Custom',
    period: '',
    description: 'For large organizations requiring comprehensive security solutions.',
    features: [
      { name: 'Full cybersecurity suite', included: true },
      { name: 'AI-powered threat detection', included: true },
      { name: 'Dedicated security team', included: true },
      { name: 'Custom development', included: true },
      { name: 'SLA guarantees', included: true },
      { name: 'Unlimited projects', included: true },
      { name: 'Advanced VAPT', included: true },
      { name: 'Digital forensics', included: true },
      { name: '24/7 monitoring', included: true },
      { name: 'Priority support', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const comparisonFeatures = [
  { name: 'Cybersecurity Assessment', starter: 'Basic', professional: 'Advanced', enterprise: 'Full Suite' },
  { name: 'Vulnerability Scanning', starter: 'Web only', professional: 'Web + App', enterprise: 'Comprehensive' },
  { name: 'Reports', starter: 'Monthly', professional: 'Weekly', enterprise: 'Real-time' },
  { name: 'Support', starter: 'Email', professional: 'Priority 24/7', enterprise: 'Dedicated Team' },
  { name: 'Projects', starter: '1', professional: '5', enterprise: 'Unlimited' },
  { name: 'Digital Forensics', starter: false, professional: true, enterprise: true },
  { name: 'AI Threat Detection', starter: false, professional: false, enterprise: true },
  { name: 'Custom Development', starter: false, professional: false, enterprise: true },
  { name: 'SLA Guarantees', starter: false, professional: false, enterprise: true },
  { name: 'Dedicated Security Team', starter: false, professional: false, enterprise: true },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <a href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>

        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.svg" alt="ABWcurious Logo" width={40} height={40} className="h-10 w-10 object-contain" unoptimized />
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            <span className="text-gradient-cyan">ABW</span>
            <span className="text-foreground">curious</span>
          </span>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Transparent <span className="text-gradient-cyan">Pricing</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Choose the plan that fits your security needs. Scale up as your business grows, with no hidden fees.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-20"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={itemVariants}
              className={`glass-card p-6 sm:p-8 flex flex-col relative transition-all duration-300 hover:glow-cyan ${
                tier.popular ? 'ring-2 ring-primary/50 glow-cyan' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3" /> Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <tier.icon className="w-6 h-6 text-primary" />
                </div>
                <h2
                  className="text-xl font-bold text-foreground mb-1"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {tier.name}
                </h2>
                <p className="text-sm text-foreground/60 mb-4">{tier.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-foreground" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {tier.price}
                  </span>
                  {tier.period && <span className="text-foreground/50 text-sm">{tier.period}</span>}
                </div>
              </div>

              <div className="flex-1 space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <div key={feature.name} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-foreground/25 mt-0.5 shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-foreground/80' : 'text-foreground/40'}`}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>

              {tier.name === 'Enterprise' ? (
                <a href="mailto:info@abwcurious.com">
                  <Button
                    variant="outline"
                    className="w-full btn-glow border-primary/30 hover:bg-primary/10 text-primary"
                  >
                    {tier.cta}
                  </Button>
                </a>
              ) : (
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSd6d_0Rpq0mt6UKqt9oM9eMwvoaGBZkbTpGlXshFBHFGc6G-Q/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full btn-glow bg-primary text-primary-foreground hover:bg-primary/90">
                    {tier.cta}
                  </Button>
                </a>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Comparison Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Feature <span className="text-gradient-cyan">Comparison</span>
          </h2>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-foreground" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Feature</th>
                    <th className="text-center p-4 font-semibold text-foreground" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Starter</th>
                    <th className="text-center p-4 font-semibold text-primary" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Professional</th>
                    <th className="text-center p-4 font-semibold text-foreground" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, idx) => (
                    <tr key={feature.name} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                      <td className="p-4 text-foreground/80 font-medium">{feature.name}</td>
                      <td className="p-4 text-center">
                        {typeof feature.starter === 'boolean' ? (
                          feature.starter ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-foreground/25 mx-auto" />
                        ) : (
                          <span className="text-foreground/70">{feature.starter}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof feature.professional === 'boolean' ? (
                          feature.professional ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-foreground/25 mx-auto" />
                        ) : (
                          <span className="text-foreground/70">{feature.professional}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof feature.enterprise === 'boolean' ? (
                          feature.enterprise ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-foreground/25 mx-auto" />
                        ) : (
                          <span className="text-foreground/70">{feature.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* FAQ / CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-20 text-center"
        >
          <div className="glass-card p-8 sm:p-10 glow-cyan">
            <h2
              className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              Need a custom plan?
            </h2>
            <p className="text-foreground/70 mb-6 max-w-md mx-auto">
              We&apos;ll work with you to create a tailored solution that meets your organization&apos;s unique security requirements.
            </p>
            <a href="mailto:info@abwcurious.com">
              <Button size="lg" variant="outline" className="btn-glow border-primary/30 hover:bg-primary/10 text-primary">
                Contact Sales
              </Button>
            </a>
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <a href="/" className="text-primary hover:underline text-sm">Return to ABWcurious.com</a>
        </div>
      </div>
    </div>
  );
}
