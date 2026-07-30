"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Server, Cloud, Building2, Network, HardDrive, Settings,
  FileText, Headphones, ArrowRight, CheckCircle2, Shield,
  Zap, Globe, Database, Monitor,
} from "lucide-react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false, loading: () => null });

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const solutions = [
  {
    icon: Network,
    title: "IT Infrastructure",
    description: "Design, deploy, and manage robust IT infrastructure that forms the backbone of your business operations.",
    features: ["Network Design", "Hardware Procurement", "Rack & Stack", "Structured Cabling"],
    color: "text-blue-400", bg: "bg-blue-500/10",
  },
  {
    icon: Cloud,
    title: "Cloud Services",
    description: "Comprehensive cloud infrastructure design, migration, and managed services across leading cloud platforms.",
    features: ["AWS / Azure / GCP", "Cloud Migration", "Multi-cloud Strategy", "Cloud Cost Optimization"],
    color: "text-cyan-400", bg: "bg-cyan-500/10",
  },
  {
    icon: Building2,
    title: "Enterprise Solutions",
    description: "End-to-end enterprise technology solutions including ERP, CRM, and integrated business systems.",
    features: ["ERP Implementation", "CRM Integration", "Business Intelligence", "Digital Transformation"],
    color: "text-purple-400", bg: "bg-purple-500/10",
  },
  {
    icon: Network,
    title: "Networking",
    description: "Enterprise networking solutions from LAN/WAN design to SD-WAN, firewalls, and network security.",
    features: ["LAN / WAN Design", "SD-WAN", "Firewall Management", "VPN Solutions"],
    color: "text-green-400", bg: "bg-green-500/10",
  },
  {
    icon: HardDrive,
    title: "Data Backup & Recovery",
    description: "Comprehensive data protection with automated backups, disaster recovery, and business continuity planning.",
    features: ["Automated Backups", "Disaster Recovery", "Data Replication", "Recovery Testing"],
    color: "text-orange-400", bg: "bg-orange-500/10",
  },
  {
    icon: Server,
    title: "Server Management",
    description: "Proactive server administration, monitoring, patching, and optimization for physical and virtual environments.",
    features: ["Server Administration", "Patch Management", "Performance Tuning", "Virtualization"],
    color: "text-slate-400", bg: "bg-slate-500/10",
  },
  {
    icon: FileText,
    title: "AMC Services",
    description: "Annual Maintenance Contracts for IT equipment, software, and infrastructure with SLA-backed guarantees.",
    features: ["Hardware AMC", "Software AMC", "Preventive Maintenance", "Priority Support"],
    color: "text-yellow-400", bg: "bg-yellow-500/10",
  },
  {
    icon: Headphones,
    title: "IT Support",
    description: "Multi-tier IT helpdesk support with remote and on-site assistance to keep your team productive.",
    features: ["L1 / L2 / L3 Support", "Remote Assistance", "On-site Support", "24/7 Helpdesk"],
    color: "text-rose-400", bg: "bg-rose-500/10",
  },
];

export default function ITSolutionsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-purple-700/15 via-blue-600/10 to-transparent rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-6">
                  <Server className="w-3.5 h-3.5" />
                  IT Solutions
                </span>
              </motion.div>
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6" style={{ fontFamily: "var(--font-sora)" }}>
                Enterprise IT{" "}
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Infrastructure
                </span>
                {" "}& Solutions
              </motion.h1>
              <motion.p variants={fadeInUp} className="max-w-3xl mx-auto text-lg text-muted-foreground leading-relaxed mb-10">
                Complete IT infrastructure and managed services to power your business. From server management to cloud migrations — we keep your technology running at peak performance.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25">
                  Get IT Assessment <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border hover:border-purple-500/50 text-foreground font-semibold transition-all duration-200">
                  Contact Our Team
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 border-y border-border/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "99.9%", label: "Uptime Guarantee" },
                { value: "< 4hrs", label: "Response SLA" },
                { value: "50+", label: "Enterprise Clients" },
                { value: "24/7", label: "Support Coverage" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-1" style={{ fontFamily: "var(--font-sora)" }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Grid */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-sora)" }}>
                Complete IT Solutions Portfolio
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
                From infrastructure design to day-to-day management — we handle every aspect of your IT environment.
              </motion.p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {solutions.map((sol) => (
                <motion.div key={sol.title} variants={fadeInUp} whileHover={{ y: -4 }} className="group p-6 rounded-2xl bg-card border border-border/40 hover:border-border transition-all duration-300 hover:shadow-xl">
                  <div className={`w-12 h-12 rounded-xl ${sol.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <sol.icon className={`w-6 h-6 ${sol.color}`} />
                  </div>
                  <h3 className="font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-sora)" }}>{sol.title}</h3>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{sol.description}</p>
                  <ul className="space-y-1.5">
                    {sol.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className={`w-3 h-3 ${sol.color} shrink-0`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-sora)" }}>
                Ready to Modernize Your IT?
              </h2>
              <p className="text-muted-foreground mb-8">Let our IT experts assess your current environment and build a roadmap for modernization.</p>
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25">
                Schedule IT Assessment <ArrowRight className="w-4 h-4" />
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
