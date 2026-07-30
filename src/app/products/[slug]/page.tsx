"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, ExternalLink, CheckCircle2,
  Star, MessageSquare, ChevronDown, Play,
  ShieldCheck, BookOpen, QrCode, UtensilsCrossed,
} from "lucide-react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false, loading: () => null });

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

interface ProductDetail {
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  icon: React.ElementType;
  externalUrl?: string;
  demoUrl?: string;
  gradient: string;
  accent: string;
  accentBg: string;
  category: string;
  status: "live" | "coming-soon";
  features: { title: string; description: string; icon: string }[];
  pricing: { plan: string; price: string; period: string; features: string[]; highlighted?: boolean }[];
  faq: { question: string; answer: string }[];
  screenshots: string[];
  roadmap: { quarter: string; items: string[]; done?: boolean }[];
}

const productsData: Record<string, ProductDetail> = {
  restaurant360: {
    name: "Restaurant360",
    tagline: "The Complete Restaurant Operating System",
    description: "Everything your restaurant needs to thrive — in one powerful platform.",
    longDescription: "Restaurant360 is a comprehensive, cloud-based restaurant management platform designed to streamline every aspect of your restaurant operations. From front-of-house POS to back-office analytics, we provide the tools you need to grow your business, delight your customers, and manage your team with confidence.",
    icon: UtensilsCrossed,
    externalUrl: "https://restaurant360.abwcurious.com/",
    demoUrl: "https://restaurant360.abwcurious.com/",
    gradient: "from-orange-600/20 via-red-600/10 to-transparent",
    accent: "text-orange-400",
    accentBg: "bg-orange-500/10",
    category: "Hospitality Tech",
    status: "live",
    features: [
      { title: "Smart POS System", description: "Fast, intuitive point-of-sale with support for table management, split bills, and multiple payment methods.", icon: "🖥️" },
      { title: "Online Ordering", description: "Built-in online ordering portal with delivery partner integrations and real-time order tracking.", icon: "📱" },
      { title: "Inventory Management", description: "Real-time inventory tracking, automated reorder alerts, waste tracking, and supplier management.", icon: "📦" },
      { title: "Staff Management", description: "Scheduling, clock-in/out, payroll integration, and performance tracking for your team.", icon: "👥" },
      { title: "Analytics Dashboard", description: "Comprehensive revenue analytics, bestseller reports, peak hours analysis, and custom KPI dashboards.", icon: "📊" },
      { title: "Customer Loyalty", description: "Digital loyalty programs, personalized promotions, customer feedback, and re-engagement campaigns.", icon: "❤️" },
      { title: "Menu Management", description: "Dynamic digital menus with modifier support, allergen tags, pricing rules, and QR menu integration.", icon: "🍽️" },
      { title: "Multi-branch Support", description: "Manage multiple locations from a single dashboard with consolidated reporting.", icon: "🏪" },
    ],
    pricing: [
      {
        plan: "Starter",
        price: "₹2,999",
        period: "/month",
        features: ["1 Terminal", "Up to 500 orders/month", "Basic Analytics", "Email Support", "Online Menu"],
      },
      {
        plan: "Professional",
        price: "₹7,999",
        period: "/month",
        highlighted: true,
        features: ["3 Terminals", "Unlimited Orders", "Advanced Analytics", "Inventory Management", "Staff Management", "Priority Support", "Online Ordering"],
      },
      {
        plan: "Enterprise",
        price: "Custom",
        period: "",
        features: ["Unlimited Terminals", "Multi-branch", "Custom Integrations", "Dedicated Account Manager", "24/7 Phone Support", "Custom Reporting"],
      },
    ],
    faq: [
      { question: "Do I need any special hardware?", answer: "Restaurant360 works on any modern tablet or computer. We also have recommended hardware bundles for the best experience." },
      { question: "Is my data secure?", answer: "Yes. All data is encrypted at rest and in transit. We're PCI DSS compliant for payment data handling." },
      { question: "Can I migrate from my existing POS?", answer: "Yes. Our onboarding team handles full data migration from most popular POS systems at no extra cost." },
      { question: "Is there a free trial?", answer: "Yes, we offer a 14-day free trial with full access to all Professional features. No credit card required." },
    ],
    screenshots: [],
    roadmap: [
      { quarter: "Q1 2025", items: ["AI-powered demand forecasting", "WhatsApp ordering integration"], done: true },
      { quarter: "Q2 2025", items: ["Kitchen display system", "Loyalty program API"], done: true },
      { quarter: "Q3 2025", items: ["Advanced reservation system", "Third-party delivery integrations"], done: false },
      { quarter: "Q4 2025", items: ["AI menu optimization", "Multi-currency support"], done: false },
    ],
  },
  intelliqr: {
    name: "IntelliQR",
    tagline: "Smart QR Codes. Intelligent Analytics.",
    description: "Dynamic QR codes that work harder for your business.",
    longDescription: "IntelliQR is a powerful QR code management platform that goes far beyond static QR codes. Create dynamic, trackable QR codes that you can update in real-time, analyze deeply, and integrate with your existing tools. Perfect for restaurants, retailers, events, marketing teams, and enterprises.",
    icon: QrCode,
    externalUrl: "https://intelliqr.abwcurious.com/",
    demoUrl: "https://intelliqr.abwcurious.com/",
    gradient: "from-blue-600/20 via-cyan-600/10 to-transparent",
    accent: "text-blue-400",
    accentBg: "bg-blue-500/10",
    category: "Marketing Tech",
    status: "live",
    features: [
      { title: "Dynamic QR Codes", description: "Update the content behind your QR code anytime without reprinting. Perfect for menus, promotions, and changing content.", icon: "🔄" },
      { title: "Advanced Analytics", description: "Track every scan — location, device, browser, time, and conversion metrics with real-time dashboards.", icon: "📊" },
      { title: "Bulk Generation", description: "Generate thousands of unique, trackable QR codes in seconds with CSV import support.", icon: "⚡" },
      { title: "Custom Branding", description: "Brand your QR codes with your logo, colors, and custom frame designs for consistent identity.", icon: "🎨" },
      { title: "Landing Pages", description: "Create mobile-optimized landing pages that your QR codes link to — no website needed.", icon: "📱" },
      { title: "API Access", description: "Full REST API for programmatic QR code creation, management, and analytics integration.", icon: "🔌" },
      { title: "A/B Testing", description: "Split-test different destinations to optimize conversion rates from your QR campaigns.", icon: "🧪" },
      { title: "Team Collaboration", description: "Multi-user workspace with role-based access for marketing teams and agencies.", icon: "👥" },
    ],
    pricing: [
      {
        plan: "Free",
        price: "₹0",
        period: "",
        features: ["10 Dynamic QR Codes", "1,000 scans/month", "Basic Analytics", "Custom Colors"],
      },
      {
        plan: "Growth",
        price: "₹1,499",
        period: "/month",
        highlighted: true,
        features: ["Unlimited QR Codes", "100,000 scans/month", "Advanced Analytics", "Custom Branding", "Bulk Generation", "API Access"],
      },
      {
        plan: "Enterprise",
        price: "Custom",
        period: "",
        features: ["Unlimited Everything", "SLA Guarantee", "Custom Integrations", "Dedicated Support", "White Label Option"],
      },
    ],
    faq: [
      { question: "What happens to old QR codes if I update content?", answer: "The QR code itself stays the same — only the destination content changes. No need to reprint anything." },
      { question: "Can I use my own domain for QR links?", answer: "Yes, Growth and Enterprise plans support custom domain configuration." },
      { question: "Do scans expire?", answer: "Dynamic QR codes never expire as long as your account is active." },
      { question: "Can I export scan data?", answer: "Yes, you can export all analytics data to CSV or access it via API." },
    ],
    screenshots: [],
    roadmap: [
      { quarter: "Q1 2025", items: ["Geo-targeted QR content", "Scan time restrictions"], done: true },
      { quarter: "Q2 2025", items: ["Zapier integration", "Shopify app"], done: true },
      { quarter: "Q3 2025", items: ["AR QR experiences", "NFC card support"], done: false },
      { quarter: "Q4 2025", items: ["AI content recommendations", "Print-ready export templates"], done: false },
    ],
  },
  cyberintelligence360: {
    name: "CyberIntelligence360",
    tagline: "See Everything. Miss Nothing. Stop Every Threat.",
    description: "AI-powered cybersecurity intelligence for modern enterprises.",
    longDescription: "CyberIntelligence360 is ABWcurious's flagship enterprise cybersecurity platform. It unifies threat intelligence, vulnerability management, SOC automation, compliance monitoring, and dark web surveillance into a single, AI-powered security operations platform.",
    icon: ShieldCheck,
    gradient: "from-purple-600/20 via-indigo-600/10 to-transparent",
    accent: "text-purple-400",
    accentBg: "bg-purple-500/10",
    category: "Cybersecurity",
    status: "live",
    features: [
      { title: "AI Threat Intelligence", description: "Real-time threat feeds enriched with AI correlation and attribution to identify targeted threats.", icon: "🤖" },
      { title: "Vulnerability Management", description: "Continuous scanning, risk-based prioritization, and automated remediation workflows.", icon: "🔍" },
      { title: "SOC Automation", description: "Automated incident detection, triage, and response with SOAR playbooks.", icon: "⚡" },
      { title: "Compliance Dashboard", description: "Real-time compliance monitoring for ISO 27001, SOC 2, GDPR, HIPAA, and PCI DSS.", icon: "✅" },
      { title: "Dark Web Monitoring", description: "Monitor for leaked credentials, stolen data, and brand mentions across dark web forums.", icon: "🌐" },
      { title: "Security Score", description: "Continuous security posture scoring with peer benchmarking and trend analysis.", icon: "📈" },
      { title: "Threat Hunting", description: "Proactive threat hunting with hypothesis-driven investigation and IOC management.", icon: "🎯" },
      { title: "SIEM Integration", description: "Native SIEM capabilities with log ingestion, correlation rules, and behavioral analytics.", icon: "📊" },
    ],
    pricing: [
      {
        plan: "SMB",
        price: "₹24,999",
        period: "/month",
        features: ["Up to 50 assets", "Vulnerability Scanning", "Basic Threat Intel", "Compliance Reports", "Email Alerts"],
      },
      {
        plan: "Enterprise",
        price: "₹74,999",
        period: "/month",
        highlighted: true,
        features: ["Unlimited Assets", "AI Threat Intelligence", "SOC Automation", "Dark Web Monitoring", "24/7 Analyst Support", "Custom Playbooks"],
      },
      {
        plan: "MSSP",
        price: "Custom",
        period: "",
        features: ["Multi-tenant Platform", "White Label", "Partner Portal", "Volume Pricing", "Dedicated Support"],
      },
    ],
    faq: [
      { question: "How is this different from traditional SIEM?", answer: "CyberIntelligence360 goes beyond log aggregation — it adds AI-driven threat correlation, vulnerability context, and automated response capabilities." },
      { question: "Do you provide managed services?", answer: "Yes, we offer fully managed SOC services on top of the platform for organizations without in-house security teams." },
      { question: "What integrations are supported?", answer: "We integrate with 200+ security tools including CrowdStrike, Splunk, Microsoft Sentinel, AWS Security Hub, and more." },
      { question: "How quickly can we get started?", answer: "Platform onboarding typically takes 2-5 business days. Our team handles all integration and configuration." },
    ],
    screenshots: [],
    roadmap: [
      { quarter: "Q2 2025", items: ["LLM-powered alert summarization", "Zero-day threat hunting"], done: true },
      { quarter: "Q3 2025", items: ["Attack surface management", "Supply chain risk module"], done: false },
      { quarter: "Q4 2025", items: ["Deception technology integration", "AI-driven risk scoring"], done: false },
    ],
  },
  studyspark: {
    name: "StudySpark",
    tagline: "Learning Powered by AI. Results That Last.",
    description: "The intelligent LMS built for the future of education.",
    longDescription: "StudySpark reimagines online learning with AI at its core. Our platform creates truly personalized learning experiences that adapt to each student's pace, style, and knowledge gaps. From live classes to AI tutoring sessions, StudySpark makes quality education accessible and effective for everyone.",
    icon: BookOpen,
    gradient: "from-green-600/20 via-emerald-600/10 to-transparent",
    accent: "text-green-400",
    accentBg: "bg-green-500/10",
    category: "EdTech",
    status: "live",
    features: [
      { title: "AI Tutor", description: "24/7 AI tutor that answers questions, explains concepts, and provides personalized guidance.", icon: "🤖" },
      { title: "Adaptive Learning", description: "Learning paths that automatically adapt based on student performance and learning preferences.", icon: "🧠" },
      { title: "Live Classes", description: "Interactive video sessions with whiteboard, screen share, polls, and auto-transcription.", icon: "🎥" },
      { title: "Assessment Engine", description: "AI-generated quizzes, assignments, and proctored exams with plagiarism detection.", icon: "📝" },
      { title: "Progress Analytics", description: "Detailed learner analytics for students, instructors, and administrators.", icon: "📊" },
      { title: "Certifications", description: "Blockchain-verified digital certificates with LinkedIn integration.", icon: "🏆" },
      { title: "Discussion Forums", description: "Threaded discussions, peer learning, and study groups with AI moderation.", icon: "💬" },
      { title: "Mobile Learning", description: "Full-featured mobile apps for iOS and Android with offline content access.", icon: "📱" },
    ],
    pricing: [
      {
        plan: "Learner",
        price: "₹499",
        period: "/month",
        features: ["All Courses", "AI Tutor (50 queries/month)", "Certificates", "Mobile App"],
      },
      {
        plan: "Institution",
        price: "₹9,999",
        period: "/month",
        highlighted: true,
        features: ["Up to 200 Students", "Custom Branding", "Live Classes", "Analytics Dashboard", "Priority Support", "Custom Courses"],
      },
      {
        plan: "Enterprise",
        price: "Custom",
        period: "",
        features: ["Unlimited Students", "Full White Label", "API Access", "HRMS Integration", "Custom AI Training"],
      },
    ],
    faq: [
      { question: "When will StudySpark launch?", answer: "StudySpark is currently in closed beta. Join our waitlist to get early access and launch pricing." },
      { question: "Can I create my own courses?", answer: "Yes, institution and enterprise plans allow you to create, upload, and sell your own course content." },
      { question: "Does it work for corporate training?", answer: "Absolutely. StudySpark is designed for both academic institutions and corporate L&D teams." },
      { question: "How does the AI tutor work?", answer: "Our AI tutor is trained on course content and can answer questions, generate practice problems, and provide explanations 24/7." },
    ],
    screenshots: [],
    roadmap: [
      { quarter: "Q3 2025", items: ["Closed beta launch", "AI tutor core capabilities"], done: false },
      { quarter: "Q4 2025", items: ["Public launch", "iOS & Android apps"], done: false },
      { quarter: "Q1 2026", items: ["Marketplace for courses", "Corporate LMS features"], done: false },
    ],
  },
};

type Props = { params: Promise<{ slug: string }> };

export default function ProductPage({ params }: Props) {
  const { slug } = use(params);
  const product = productsData[slug];

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">This product doesn&apos;t exist yet.</p>
            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold">
              <ArrowLeft className="w-4 h-4" /> View All Products
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const Icon = product.icon;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b ${product.gradient} rounded-full blur-3xl opacity-70`} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              {/* Breadcrumb */}
              <motion.div variants={fadeInUp} className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <Link href="/products" className="hover:text-foreground flex items-center gap-1.5 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> All Products
                </Link>
                <span>/</span>
                <span className="text-foreground">{product.name}</span>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <motion.div variants={fadeInUp}>
                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                      product.status === "live"
                        ? "bg-green-500/15 text-green-400 border border-green-500/20"
                        : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                    }`}>
                      {product.status === "live" && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                      {product.status === "live" ? "Live Product" : "Coming Soon"}
                    </span>

                    {/* Icon + Name */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-2xl ${product.accentBg} flex items-center justify-center`}>
                        <Icon className={`w-8 h-8 ${product.accent}`} />
                      </div>
                      <div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-foreground" style={{ fontFamily: "var(--font-sora)" }}>
                          {product.name}
                        </h1>
                        <p className={`text-sm font-medium ${product.accent}`}>{product.category}</p>
                      </div>
                    </div>

                    <p className={`text-xl font-semibold text-foreground mb-4`}>{product.tagline}</p>
                    <p className="text-muted-foreground leading-relaxed mb-8">{product.longDescription}</p>

                    <div className="flex flex-col sm:flex-row gap-4">
                      {product.externalUrl && (
                        <a href={product.externalUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25`}>
                          Visit {product.name} <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {product.demoUrl && (
                        <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-border hover:border-border/80 text-foreground font-semibold transition-all duration-200">
                          <Play className="w-4 h-4" /> Live Demo
                        </a>
                      )}
                      {product.status === "coming-soon" && (
                        <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200">
                          Join Waitlist <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Feature highlights */}
                <motion.div variants={fadeInUp} className={`p-8 rounded-2xl bg-gradient-to-br ${product.gradient} border border-border/40`}>
                  <h3 className="text-lg font-semibold text-foreground mb-5" style={{ fontFamily: "var(--font-sora)" }}>
                    Key Capabilities
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {product.features.slice(0, 6).map((f) => (
                      <div key={f.title} className="flex items-start gap-2">
                        <span className="text-lg leading-none mt-0.5">{f.icon}</span>
                        <span className="text-sm text-foreground font-medium">{f.title}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-foreground mb-12 text-center" style={{ fontFamily: "var(--font-sora)" }}>
                Everything You Need
              </motion.h2>
              <motion.div variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {product.features.map((f) => (
                  <motion.div key={f.title} variants={fadeInUp} className="p-5 rounded-xl bg-card border border-border/40 hover:border-border transition-all duration-300 hover:shadow-lg">
                    <div className="text-2xl mb-3">{f.icon}</div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-foreground mb-4 text-center" style={{ fontFamily: "var(--font-sora)" }}>
                Simple, Transparent Pricing
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-center mb-12">
                {product.status === "coming-soon" ? "Pricing at launch — join the waitlist for early-bird discounts." : "No hidden fees. Cancel anytime."}
              </motion.p>
              <motion.div variants={stagger} className={`grid gap-6 ${product.pricing.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                {product.pricing.map((plan) => (
                  <motion.div key={plan.plan} variants={fadeInUp} className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                    plan.highlighted
                      ? `border-blue-500/40 bg-gradient-to-br ${product.gradient}`
                      : "border-border/40 bg-card hover:border-border"
                  }`}>
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-4 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">Most Popular</span>
                      </div>
                    )}
                    <h3 className="font-bold text-foreground mb-2">{plan.plan}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                    </div>
                    <ul className="space-y-2.5 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className={`w-4 h-4 ${product.accent} shrink-0 mt-0.5`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact" className={`block w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      plan.highlighted
                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                        : "border border-border hover:border-border/80 text-foreground"
                    }`}>
                      {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-foreground mb-12 text-center" style={{ fontFamily: "var(--font-sora)" }}>
                Product Roadmap
              </motion.h2>
              <motion.div variants={stagger} className="space-y-4">
                {product.roadmap.map((phase) => (
                  <motion.div key={phase.quarter} variants={fadeInUp} className={`p-5 rounded-xl border ${phase.done ? "border-green-500/20 bg-green-500/5" : "border-border/40 bg-card"}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${phase.done ? "bg-green-500/15 text-green-400" : "bg-blue-500/15 text-blue-400"}`}>
                        {phase.quarter}
                      </span>
                      {phase.done && <span className="text-xs text-green-400 font-medium">✓ Shipped</span>}
                    </div>
                    <ul className="space-y-1">
                      {phase.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="w-3 h-3 text-blue-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-foreground mb-12 text-center" style={{ fontFamily: "var(--font-sora)" }}>
                Frequently Asked Questions
              </motion.h2>
              <motion.div variants={stagger} className="space-y-3">
                {product.faq.map((item) => (
                  <motion.div key={item.question} variants={fadeInUp} className="p-5 rounded-xl border border-border/40 bg-card">
                    <h4 className="font-semibold text-foreground mb-2 text-sm">{item.question}</h4>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-sora)" }}>
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-8">
                {product.status === "live"
                  ? `Start your free trial of ${product.name} today. No credit card required.`
                  : `Join the waitlist for ${product.name} and get early access.`}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {product.externalUrl ? (
                  <a href={product.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25">
                    Get Started Free <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200">
                    Join Waitlist <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border hover:border-border/80 text-foreground font-semibold transition-all duration-200">
                  <MessageSquare className="w-4 h-4" /> Talk to Sales
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <AIChatbot />
    </>
  );
}
