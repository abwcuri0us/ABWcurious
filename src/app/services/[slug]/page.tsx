"use client";

import { notFound } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code2, Globe, Smartphone, Cloud, TrendingUp, GitBranch,
  Briefcase, Palette, Wrench, Zap, Brain, Activity, Wifi, Cpu,
  ArrowRight, CheckCircle2, ArrowLeft, MessageSquare,
} from "lucide-react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false, loading: () => null });

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

interface ServiceData {
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  features: { title: string; description: string }[];
  process: { step: string; title: string; description: string }[];
  technologies: string[];
  benefits: string[];
}

const servicesData: Record<string, ServiceData> = {
  "software-development": {
    name: "Software Development",
    tagline: "Custom software built for scale",
    description: "End-to-end software engineering from architecture design to production deployment.",
    longDescription: "We build robust, scalable, and maintainable software solutions that drive real business value. Our full-stack engineering teams work closely with your team to understand requirements, architect solutions, and deliver production-ready software. We follow clean architecture principles, test-driven development, and agile methodologies.",
    icon: Code2,
    color: "text-blue-400",
    gradient: "from-blue-600/20 to-cyan-600/10",
    features: [
      { title: "Full-Stack Development", description: "React, Next.js, Node.js, Python, and more — we work across the entire stack." },
      { title: "API Design & Development", description: "RESTful APIs, GraphQL, and microservices with proper documentation." },
      { title: "Database Architecture", description: "Relational and NoSQL database design, optimization, and management." },
      { title: "Code Quality", description: "Automated testing, CI/CD, code reviews, and static analysis." },
      { title: "Security by Design", description: "Security considerations embedded throughout the development lifecycle." },
      { title: "Scalable Architecture", description: "Cloud-native, containerized architectures designed for growth." },
    ],
    process: [
      { step: "01", title: "Discovery & Planning", description: "Requirements gathering, technical feasibility, and project planning." },
      { step: "02", title: "Architecture Design", description: "System design, technology selection, and architectural decisions." },
      { step: "03", title: "Agile Development", description: "Iterative development with regular demos and feedback cycles." },
      { step: "04", title: "Testing & QA", description: "Comprehensive testing including unit, integration, and E2E tests." },
      { step: "05", title: "Deployment", description: "Production deployment with CI/CD pipelines and monitoring." },
      { step: "06", title: "Support & Evolution", description: "Ongoing maintenance, feature development, and performance optimization." },
    ],
    technologies: ["React", "Next.js", "Node.js", "Python", "TypeScript", "PostgreSQL", "Redis", "Docker", "AWS", "GitHub Actions"],
    benefits: ["Reduced time-to-market", "Lower total cost of ownership", "Scalable architecture", "Maintainable codebase", "Security-first development", "Agile delivery"],
  },
  "website-development": {
    name: "Website Development",
    tagline: "Stunning, high-performance websites",
    description: "Modern, responsive websites with exceptional performance and SEO.",
    longDescription: "We create websites that don't just look beautiful — they perform. Using cutting-edge frameworks like Next.js and modern design principles, we build websites optimized for speed, search engines, and conversions. From corporate websites to complex web applications, every project receives our full engineering attention.",
    icon: Globe,
    color: "text-cyan-400",
    gradient: "from-cyan-600/20 to-blue-600/10",
    features: [
      { title: "Next.js & React", description: "Server-side rendering, static generation, and hybrid approaches for optimal performance." },
      { title: "SEO Optimization", description: "Technical SEO, structured data, Core Web Vitals optimization, and sitemap management." },
      { title: "CMS Integration", description: "Headless CMS solutions including Sanity, Contentful, and custom CMS." },
      { title: "E-commerce", description: "Shopify, WooCommerce, and custom e-commerce solutions." },
      { title: "Performance", description: "Lighthouse scores 95+, lazy loading, image optimization, and CDN delivery." },
      { title: "Responsive Design", description: "Mobile-first, fully responsive designs that work on all devices." },
    ],
    process: [
      { step: "01", title: "Discovery", description: "Goals, audience, and competitive analysis." },
      { step: "02", title: "Design", description: "Wireframes, design system, and visual design." },
      { step: "03", title: "Development", description: "Component-based development with clean code." },
      { step: "04", title: "Content", description: "Content integration, SEO optimization, and testing." },
      { step: "05", title: "Launch", description: "Deployment, DNS configuration, and go-live." },
      { step: "06", title: "Growth", description: "Analytics, A/B testing, and continuous improvement." },
    ],
    technologies: ["Next.js", "React", "TypeScript", "TailwindCSS", "Framer Motion", "Sanity CMS", "Vercel", "Cloudflare"],
    benefits: ["Lighthouse 95+ score", "Mobile-first design", "SEO-ready from day one", "Fast loading times", "Easy content management", "Analytics integration"],
  },
  "mobile-apps": {
    name: "Mobile App Development",
    tagline: "Native & cross-platform mobile apps",
    description: "iOS, Android, and cross-platform mobile applications.",
    longDescription: "We build high-quality mobile applications that users love. Whether you need a native iOS/Android app or a cross-platform solution using React Native or Flutter, our mobile development team delivers smooth, performant, and feature-rich applications. From MVP to enterprise-grade apps, we handle the full mobile development lifecycle.",
    icon: Smartphone,
    color: "text-purple-400",
    gradient: "from-purple-600/20 to-pink-600/10",
    features: [
      { title: "React Native", description: "Cross-platform apps with native performance using React Native." },
      { title: "Flutter", description: "Beautiful, fast apps from a single codebase for iOS and Android." },
      { title: "Native iOS & Android", description: "Swift, Kotlin, and Java for performance-critical native apps." },
      { title: "Push Notifications", description: "Firebase Cloud Messaging, APNs, and advanced notification strategies." },
      { title: "Offline Support", description: "Offline-first architecture with local storage and sync." },
      { title: "App Store Publishing", description: "Complete App Store and Google Play submission and management." },
    ],
    process: [
      { step: "01", title: "Concept & UX", description: "User flows, wireframes, and app architecture." },
      { step: "02", title: "Design", description: "Platform-specific UI following iOS/Material guidelines." },
      { step: "03", title: "Development", description: "Agile sprints with regular builds and testing." },
      { step: "04", title: "QA Testing", description: "Device testing, performance, and security testing." },
      { step: "05", title: "App Store", description: "Submission, review management, and launch." },
      { step: "06", title: "Updates", description: "OTA updates, feature releases, and maintenance." },
    ],
    technologies: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "Redux", "GraphQL", "Expo"],
    benefits: ["Single codebase for iOS & Android", "Native performance", "Offline capability", "Push notifications", "In-app purchases", "Analytics integration"],
  },
  "cloud-solutions": {
    name: "Cloud Solutions",
    tagline: "Scalable cloud infrastructure",
    description: "Cloud architecture, migration, and managed services.",
    longDescription: "Transform your infrastructure with our comprehensive cloud services. We help businesses design, migrate to, and optimize their cloud environments on AWS, Azure, and Google Cloud. From greenfield cloud architectures to complex legacy migrations, our certified cloud engineers ensure your infrastructure is scalable, secure, and cost-effective.",
    icon: Cloud,
    color: "text-sky-400",
    gradient: "from-sky-600/20 to-blue-600/10",
    features: [
      { title: "Cloud Architecture", description: "Well-architected, resilient, and cost-optimized cloud designs." },
      { title: "Cloud Migration", description: "Lift-and-shift, re-platforming, and re-architecting strategies." },
      { title: "Serverless", description: "Lambda, Cloud Functions, and serverless-first architectures." },
      { title: "Cost Optimization", description: "Reserved instances, right-sizing, and FinOps practices." },
      { title: "Security & Compliance", description: "IAM, VPC design, encryption, and compliance frameworks." },
      { title: "Disaster Recovery", description: "Multi-region redundancy and business continuity planning." },
    ],
    process: [
      { step: "01", title: "Assessment", description: "Current state analysis and cloud readiness assessment." },
      { step: "02", title: "Strategy", description: "Migration strategy, timeline, and cost modeling." },
      { step: "03", title: "Architecture", description: "Cloud architecture design and security baseline." },
      { step: "04", title: "Migration", description: "Phased migration with zero-downtime approach." },
      { step: "05", title: "Optimization", description: "Performance tuning and cost optimization." },
      { step: "06", title: "Operations", description: "Monitoring, alerting, and ongoing management." },
    ],
    technologies: ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "Docker", "CloudFormation", "Ansible"],
    benefits: ["Reduced infrastructure costs", "Improved scalability", "Higher availability", "Better security posture", "Faster deployment", "Global reach"],
  },
  "ai-solutions": {
    name: "AI Solutions",
    tagline: "Intelligent systems for every challenge",
    description: "Custom AI/ML solutions and LLM integration.",
    longDescription: "We help businesses harness the power of artificial intelligence to automate processes, gain insights, and create intelligent products. From LLM integration and RAG systems to computer vision and predictive analytics, our AI team delivers production-ready AI solutions that create measurable business value.",
    icon: Brain,
    color: "text-violet-400",
    gradient: "from-violet-600/20 to-purple-600/10",
    features: [
      { title: "LLM Integration", description: "GPT-4, Claude, Mistral, and open-source LLM integration." },
      { title: "RAG Systems", description: "Retrieval-augmented generation for accurate, context-aware AI." },
      { title: "AI Chatbots", description: "Intelligent conversational AI with memory and context." },
      { title: "Computer Vision", description: "Object detection, OCR, image classification, and more." },
      { title: "Predictive Analytics", description: "ML models for business forecasting and decision support." },
      { title: "AI Automation", description: "Intelligent process automation with human-in-the-loop workflows." },
    ],
    process: [
      { step: "01", title: "Use Case Definition", description: "Identify AI opportunities and define success metrics." },
      { step: "02", title: "Data Assessment", description: "Data inventory, quality assessment, and preparation." },
      { step: "03", title: "Model Selection", description: "Choose appropriate models and architectures." },
      { step: "04", title: "Development", description: "Build, train, and fine-tune AI models." },
      { step: "05", title: "Integration", description: "Seamless integration with existing systems." },
      { step: "06", title: "Monitoring", description: "Model performance monitoring and continuous improvement." },
    ],
    technologies: ["Python", "TensorFlow", "PyTorch", "LangChain", "Mistral AI", "OpenAI", "Pinecone", "Supabase Vector"],
    benefits: ["Automate repetitive tasks", "Improve decision quality", "Reduce operational costs", "Enhance customer experience", "Scale without headcount", "Competitive advantage"],
  },
};

// Default template for unlisted services
function createDefaultService(slug: string): ServiceData {
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    name,
    tagline: "Professional technology services",
    description: `Expert ${name.toLowerCase()} services from ABWcurious.`,
    longDescription: `ABWcurious provides professional ${name.toLowerCase()} services tailored to your business needs. Our team of experts brings deep domain knowledge and proven methodologies to deliver outstanding results.`,
    icon: Briefcase,
    color: "text-blue-400",
    gradient: "from-blue-600/20 to-cyan-600/10",
    features: [
      { title: "Expert Team", description: "Certified professionals with years of industry experience." },
      { title: "Proven Methodology", description: "Structured approach ensuring consistent, high-quality outcomes." },
      { title: "Tailored Solutions", description: "Services customized to your specific business needs." },
      { title: "Ongoing Support", description: "Continuous support and improvement after delivery." },
    ],
    process: [
      { step: "01", title: "Discovery", description: "Understanding your needs and objectives." },
      { step: "02", title: "Planning", description: "Detailed project plan and timeline." },
      { step: "03", title: "Execution", description: "Professional delivery with regular updates." },
      { step: "04", title: "Delivery", description: "Quality assurance and final delivery." },
    ],
    technologies: [],
    benefits: ["Expert delivery", "Quality guaranteed", "On-time delivery", "Ongoing support"],
  };
}

type Props = { params: Promise<{ slug: string }> };

export default function ServicePage({ params }: Props) {
  const { slug } = use(params);
  const service = servicesData[slug] ?? createDefaultService(slug);
  const Icon = service.icon;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b ${service.gradient} rounded-full blur-3xl opacity-60`} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              {/* Breadcrumb */}
              <motion.div variants={fadeInUp} className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <Link href="/services" className="hover:text-foreground flex items-center gap-1.5 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> All Services
                </Link>
                <span>/</span>
                <span className="text-foreground">{service.name}</span>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <motion.div variants={fadeInUp}>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} border border-border/40 flex items-center justify-center mb-6`}>
                      <Icon className={`w-8 h-8 ${service.color}`} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-sora)" }}>
                      {service.name}
                    </h1>
                    <p className={`text-xl font-medium ${service.color} mb-4`}>{service.tagline}</p>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-8">{service.longDescription}</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25">
                        Get Started <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-border hover:border-border/80 text-foreground font-semibold transition-all duration-200">
                        <MessageSquare className="w-4 h-4" /> Schedule Consultation
                      </Link>
                    </div>
                  </motion.div>
                </div>

                {/* Benefits */}
                <motion.div variants={fadeInUp} className="relative">
                  <div className={`p-8 rounded-2xl bg-gradient-to-br ${service.gradient} border border-border/40`}>
                    <h3 className="text-lg font-semibold text-foreground mb-5" style={{ fontFamily: "var(--font-sora)" }}>
                      Key Benefits
                    </h3>
                    <ul className="space-y-3">
                      {service.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3">
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${service.color}`} />
                          <span className="text-sm text-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-foreground mb-12 text-center" style={{ fontFamily: "var(--font-sora)" }}>
                What We Deliver
              </motion.h2>
              <motion.div variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {service.features.map((feature) => (
                  <motion.div key={feature.title} variants={fadeInUp} className="p-6 rounded-xl bg-card border border-border/40 hover:border-border transition-colors">
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Process */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-foreground mb-12 text-center" style={{ fontFamily: "var(--font-sora)" }}>
                Our Process
              </motion.h2>
              <motion.div variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {service.process.map((step) => (
                  <motion.div key={step.step} variants={fadeInUp} className="relative p-6 rounded-xl border border-border/40 hover:border-border transition-colors">
                    <span className={`text-5xl font-bold ${service.color} opacity-20 mb-3 block`}>{step.step}</span>
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Technologies */}
        {service.technologies.length > 0 && (
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
            <div className="max-w-7xl mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                <motion.h2 variants={fadeInUp} className="text-2xl font-bold text-foreground mb-8 text-center">
                  Technologies We Use
                </motion.h2>
                <motion.div variants={staggerContainer} className="flex flex-wrap gap-3 justify-center">
                  {service.technologies.map((tech) => (
                    <motion.span key={tech} variants={fadeInUp} className={`px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-br ${service.gradient} border border-border/40 text-foreground`}>
                      {tech}
                    </motion.span>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-sora)" }}>
                Ready to Get Started?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground mb-8">
                Talk to our experts about your {service.name.toLowerCase()} needs. We&apos;ll create a tailored plan for your business.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200">
                  Contact Us Today <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/services" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border hover:border-border/80 text-foreground font-semibold transition-all duration-200">
                  View All Services
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <AIChatbot />
    </>
  );
}
