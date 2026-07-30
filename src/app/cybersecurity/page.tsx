"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield, Search, Eye, AlertTriangle, Cloud, Mail,
  GraduationCap, Target, Database, FileCheck, ArrowRight,
  CheckCircle2, Lock, Zap, Activity, ShieldCheck,
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
  visible: { transition: { staggerChildren: 0.08 } },
};

const cybersecServices = [
  {
    icon: Search,
    title: "VAPT",
    fullTitle: "Vulnerability Assessment & Penetration Testing",
    description: "Comprehensive security assessments that identify vulnerabilities in your applications, networks, and infrastructure before attackers do.",
    features: ["Web App Pen Testing", "Network VAPT", "Mobile App Security", "API Security Testing"],
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    icon: Eye,
    title: "SOC as a Service",
    fullTitle: "Security Operations Center",
    description: "24/7 security monitoring and threat detection with expert analysts watching your environment around the clock.",
    features: ["24/7 Monitoring", "Threat Hunting", "Incident Detection", "Real-time Alerts"],
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Activity,
    title: "SIEM",
    fullTitle: "Security Information & Event Management",
    description: "Centralized security log management, correlation, and analysis to detect threats across your entire environment.",
    features: ["Log Management", "Threat Correlation", "Compliance Reporting", "Behavioral Analytics"],
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: AlertTriangle,
    title: "Incident Response",
    fullTitle: "Cyber Incident Response",
    description: "Rapid response to security incidents to contain damage, eliminate threats, and restore normal operations.",
    features: ["Emergency Response", "Forensic Analysis", "Threat Containment", "Recovery Planning"],
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: Cloud,
    title: "Cloud Security",
    fullTitle: "Cloud Security Posture Management",
    description: "Comprehensive security for AWS, Azure, and GCP environments with continuous compliance monitoring.",
    features: ["CSPM", "Zero Trust", "IAM Review", "Security Baselines"],
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Mail,
    title: "Email Security",
    fullTitle: "Email Security & Anti-Phishing",
    description: "Advanced email security to protect against phishing, BEC attacks, malware, and impersonation threats.",
    features: ["Anti-Phishing", "Email Filtering", "DMARC/DKIM/SPF", "BEC Protection"],
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    icon: GraduationCap,
    title: "Security Awareness",
    fullTitle: "Security Awareness Training",
    description: "Employee cybersecurity training programs to build a human firewall and reduce security risks from within.",
    features: ["Phishing Simulations", "Training Modules", "Compliance Training", "Certification"],
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    icon: Target,
    title: "Pen Testing",
    fullTitle: "Advanced Penetration Testing",
    description: "Red team exercises and advanced penetration testing to validate your security controls against real-world attack scenarios.",
    features: ["Red Team Exercises", "Social Engineering", "Physical Security", "Adversary Simulation"],
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    icon: Database,
    title: "Digital Forensics",
    fullTitle: "Digital Forensics & Investigation",
    description: "Forensic investigation of security incidents, data breaches, and cyber crimes with court-admissible evidence.",
    features: ["Memory Forensics", "Malware Analysis", "Log Analysis", "Chain of Custody"],
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: FileCheck,
    title: "Compliance",
    fullTitle: "Compliance & Risk Management",
    description: "Navigate complex compliance requirements including ISO 27001, SOC 2, GDPR, HIPAA, and industry-specific regulations.",
    features: ["ISO 27001", "SOC 2 Type II", "GDPR", "Risk Assessment"],
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
];

const stats = [
  { value: "500+", label: "Vulnerabilities Found & Fixed" },
  { value: "99.9%", label: "Uptime SLA for SOC" },
  { value: "< 15min", label: "Mean Time to Detect" },
  { value: "50+", label: "Clients Protected" },
];

export default function CybersecurityPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-700/20 via-indigo-600/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-gradient-to-tr from-red-600/10 to-transparent rounded-full blur-2xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center">
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Cybersecurity Services
                </span>
              </motion.div>
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6" style={{ fontFamily: "var(--font-sora)" }}>
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  Enterprise-Grade
                </span>{" "}
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Cyber Defense
                </span>{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  & Intelligence
                </span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10">
                Enterprise-grade cybersecurity services built for the modern threat landscape. We protect your business with proactive security, 24/7 monitoring, and expert incident response.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30">
                  Get a Security Assessment <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="#services" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border hover:border-blue-500/50 text-foreground font-semibold transition-all duration-200">
                  <Shield className="w-4 h-4" /> Explore Services
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 border-y border-border/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <motion.div key={stat.label} variants={fadeInUp} className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1" style={{ fontFamily: "var(--font-sora)" }}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section id="services" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
              <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-sora)" }}>
                Our Cybersecurity Portfolio
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Comprehensive security services covering every layer of your digital environment.
              </motion.p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {cybersecServices.map((service) => (
                <motion.div key={service.title} variants={fadeInUp} whileHover={{ y: -4 }} className={`group p-6 rounded-2xl bg-card border ${service.border} hover:border-opacity-60 transition-all duration-300 hover:shadow-xl`}>
                  <div className={`w-12 h-12 rounded-xl ${service.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className={`w-6 h-6 ${service.color}`} />
                  </div>
                  <h3 className="font-bold text-foreground mb-1" style={{ fontFamily: "var(--font-sora)" }}>
                    {service.title}
                  </h3>
                  <p className={`text-xs font-medium ${service.color} mb-3`}>{service.fullTitle}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{service.description}</p>
                  <ul className="space-y-1.5">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className={`w-3 h-3 ${service.color} shrink-0`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Why Us */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-6" style={{ fontFamily: "var(--font-sora)" }}>
                  Why ABWcurious for Cybersecurity?
                </motion.h2>
                <motion.div variants={staggerContainer} className="space-y-5">
                  {[
                    { icon: Lock, title: "Security-First Culture", desc: "Security isn't an afterthought — it's embedded in everything we do." },
                    { icon: Zap, title: "Rapid Response", desc: "Our SOC team responds to threats in under 15 minutes, 24/7/365." },
                    { icon: ShieldCheck, title: "Certified Experts", desc: "CISSP, CEH, OSCP, and other industry-leading certifications." },
                    { icon: Activity, title: "Continuous Monitoring", desc: "Eyes on your environment around the clock with zero blind spots." },
                  ].map((item) => (
                    <motion.div key={item.title} variants={fadeInUp} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-950/60 to-slate-900/80 p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
                <div className="relative">
                  <Shield className="w-10 h-10 text-blue-400 mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-sora)" }}>
                    Free Security Assessment
                  </h3>
                  <p className="text-slate-300 mb-6 text-sm">
                    Not sure where to start? Get a complimentary 30-minute security assessment with one of our certified experts. No strings attached.
                  </p>
                  <ul className="space-y-2 mb-8">
                    {["Identify critical vulnerabilities", "Review security posture", "Get prioritized recommendations", "No commitment required"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all">
                    Book Free Assessment <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
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
