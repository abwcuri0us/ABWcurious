"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ExternalLink, ArrowRight, Star, Package,
  ShieldCheck, BookOpen, QrCode, UtensilsCrossed,
} from "lucide-react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false, loading: () => null });

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  category: string;
  externalUrl?: string;
  gradient: string;
  accent: string;
  badge?: string;
  features: string[];
  status: "live";
}

const products: Product[] = [
  {
    slug: "restaurant360",
    name: "Restaurant360",
    tagline: "Complete Restaurant Management Platform",
    description: "A comprehensive SaaS platform for restaurant management — POS, online ordering, inventory, staff scheduling, customer loyalty, and business analytics in one seamless system.",
    icon: UtensilsCrossed,
    category: "Hospitality Tech",
    externalUrl: "https://restaurant360.abwcurious.com/",
    gradient: "from-orange-500/20 via-red-500/10 to-transparent",
    accent: "text-orange-800",
    badge: "Live Product",
    features: ["Smart POS", "Online Ordering", "Inventory Management", "Staff Scheduling", "Analytics Dashboard", "Customer Loyalty"],
    status: "live",
  },
  {
    slug: "intelliqr",
    name: "IntelliQR",
    tagline: "Smart QR Code Management Platform",
    description: "Dynamic QR code generation, tracking, and analytics platform. Create, manage, and analyze QR codes for menus, marketing, packaging, events, and more.",
    icon: QrCode,
    category: "Marketing Tech",
    externalUrl: "https://intelliqr.abwcurious.com/",
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    accent: "text-blue-400",
    badge: "Live Product",
    features: ["Dynamic QR Codes", "Advanced Analytics", "Bulk Generation", "Custom Branding", "API Access", "Integrations"],
    status: "live",
  },
  {
    slug: "cyberintelligence360",
    name: "CyberIntelligence360",
    tagline: "AI-Powered Threat Intelligence Platform",
    description: "Enterprise cybersecurity platform combining AI threat intelligence, vulnerability management, SOC automation, dark web monitoring, and compliance in one unified solution.",
    icon: ShieldCheck,
    category: "Cybersecurity",
    gradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
    accent: "text-purple-400",
    badge: "Enterprise",
    features: ["Threat Intelligence", "Vulnerability Management", "SOC Automation", "Compliance Dashboard", "Dark Web Monitoring", "Security Scoring"],
    status: "live",
  },
  {
    slug: "studyspark",
    name: "StudySpark",
    tagline: "AI-Powered Learning Management System",
    description: "Next-generation LMS with AI tutoring, adaptive learning paths, live classes, intelligent assessments, and blockchain-verified certifications for modern learners.",
    icon: BookOpen,
    category: "EdTech",
    gradient: "from-green-500/20 via-emerald-500/10 to-transparent",
    accent: "text-green-400",
    badge: "live Product",
    features: ["AI Tutor", "Adaptive Learning", "Live Classes", "Assessment Engine", "Analytics", "Certifications"],
    status: "live",
  },
    {
    slug: "thecodearena",
    name: "The Code Arena",
    tagline: "AI-Powered Smart DSA Learning System",
    description: "High level Coding Skills, adaptive learning paths, live events, Hackathons, Programming Languages, Code Wars, Earn to Learn",
    icon: BookOpen,
    category: "Programming Tech",
    gradient: "from-green-500/20 via-emerald-500/10 to-transparent",
    accent: "text-green-400",
    badge: "Live Product",
    features: ["Hackathons", "Adaptive Learning", "Live Contests", "Large Problem Sets", "AI Roadmap", "Badges", "Certifications"],
    status: "live",
  },
    {
    slug: "Kapikitab",
    name: "Kapikitab",
    tagline: "AI-Powered Learning Management System",
    description: "Next-generation LMS with AI tutoring, adaptive learning paths, live classes, intelligent assessments, and blockchain-verified certifications for modern learners.",
    icon: BookOpen,
    category: "EdTech",
    gradient: "from-green-500/20 via-emerald-500/10 to-transparent",
    accent: "text-green-400",
    badge: "Live Product",
    features: ["AI Tutor", "Adaptive Learning", "Live Classes", "Assessment Engine", "Analytics", "Certifications"],
    status: "live",
  }
];

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-indigo-600/15 via-purple-500/10 to-transparent rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
                  <Package className="w-3.5 h-3.5" />
                  Our Products
                </span>
              </motion.div>
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6" style={{ fontFamily: "var(--font-sora)" }}>
                Products Built for{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Real Impact
                </span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="max-w-3xl mx-auto text-lg text-muted-foreground leading-relaxed">
                We don&apos;t just build for clients — we build for the world. Our products tackle real challenges in hospitality, marketing, cybersecurity, and education.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid lg:grid-cols-2 gap-8">
              {products.map((product) => (
                <motion.div key={product.slug} variants={fadeInUp} whileHover={{ y: -4 }} className="group relative">
                  <div className={`relative h-full p-8 rounded-2xl bg-gradient-to-br ${product.gradient} border border-border/40 hover:border-border transition-all duration-300 hover:shadow-2xl overflow-hidden`}>
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-background/60 text-muted-foreground border border-border/40">
                        {product.category}
                      </span>
                      {product.badge && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          product.status === "live"
                            ? "bg-green-500/15 text-green-400 border border-green-500/20"
                            : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
                        }`}>
                          {product.status === "live" && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Icon & Name */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-background/60 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <product.icon className={`w-7 h-7 ${product.accent}`} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-sora)" }}>
                          {product.name}
                        </h2>
                        <p className={`text-sm font-medium ${product.accent}`}>{product.tagline}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.description}</p>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-2 mb-8">
                      {product.features.map((f) => (
                        <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Star className={`w-3 h-3 ${product.accent} shrink-0`} />
                          {f}
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={`/products/${product.slug}`} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background/80 hover:bg-background text-foreground text-sm font-semibold transition-all border border-border/40 hover:border-border`}>
                        Learn More <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      {product.externalUrl && (
                        <a href={product.externalUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${product.accent} border border-current/20 hover:bg-current/10`}>
                          Visit Product <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Build With Us */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Package className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-sora)" }}>
                Have a Product Idea?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                We turn ambitious ideas into market-ready products. Partner with ABWcurious to co-build your next technology product.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25">
                Let&apos;s Build Together <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <AIChatbot />
    </>
  );
}
