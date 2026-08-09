"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Target,
  Eye,
  Heart,
  Users,
  Award,
  Globe,
  Lightbulb,
  Shield,
  Zap,
  Star,
  ArrowRight,
  CheckCircle2,
  Building2,
  GraduationCap,
  Cpu,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

const AIChatbot = dynamic(() => import("@/components/AIChatbot"), {
  ssr: false,
  loading: () => null,
});

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Core Values ──────────────────────────────────────────────────────────────

const coreValues = [
  {
    icon: Shield,
    title: "Security First",
    description:
      "We believe security is not a feature — it's a foundation. Every product, service, and decision is made with security at its core.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We constantly push the boundaries of what's possible, combining cutting-edge research with practical engineering excellence.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Heart,
    title: "Empathy",
    description:
      "We build technology for people. Understanding our clients' real needs drives every design and engineering decision we make.",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    icon: Users,
    title: "Collaboration",
    description:
      "Great technology is built by great teams. We foster a culture of collaboration, diversity, and collective intelligence.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "Mediocrity has no place here. We hold ourselves to the highest standards in code quality, design, and client outcomes.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Globe,
    title: "Impact",
    description:
      "We measure success by the positive difference we make — for our clients, communities, and the broader world.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
];

// ─── Why Choose Us ────────────────────────────────────────────────────────────

const whyChooseUs = [
  "Full-stack technology expertise from hardware to AI",
  "Cybersecurity-first approach in every engagement",
  "Proprietary AI research and development capabilities",
  "Government-recognized technology company",
  "Dedicated post-delivery support and maintenance",
  "Transparent, agile delivery methodology",
  "Flexible engagement models to fit your budget",
  "Proven track record across 100+ projects",
];

// ─── Stats ────────────────────────────────────────────────────────────────────

const stats = [
  { value: "100+", label: "Projects Delivered" },
  { value: "50+", label: "Team Members" },
  { value: "4+", label: "Products Launched" },
  { value: "6+", label: "Years of Innovation" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Gradient blob */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/20 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6">
                  <Building2 className="w-3.5 h-3.5" />
                  About ABWcurious
                </span>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
                style={{ fontFamily: "var(--font-sora)" }}
              >
                Shaping A Better World{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  With Technology
                </span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed"
              >
                We are a technology company driven by curiosity, guided by
                purpose, and committed to building digital solutions that create
                real-world impact — across cybersecurity, artificial
                intelligence, software, and education.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────────── */}
        <section className="py-16 border-y border-border/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  className="text-center"
                >
                  <div
                    className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2"
                    style={{ fontFamily: "var(--font-sora)" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Mission & Vision ──────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Mission */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/5 rounded-2xl border border-blue-500/20 group-hover:border-blue-500/40 transition-all duration-300" />
                <div className="relative p-8 sm:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                    <h2
                      className="text-2xl font-bold text-foreground"
                      style={{ fontFamily: "var(--font-sora)" }}
                    >
                      Our Mission
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-base mb-6">
                    To empower businesses, institutions, and individuals with
                    cutting-edge technology solutions that enhance security,
                    accelerate growth, and unlock human potential. We are
                    committed to making enterprise-grade technology accessible,
                    understandable, and impactful for organizations of all
                    sizes.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Democratize access to advanced cybersecurity",
                      "Build AI solutions that create real business value",
                      "Make technology simple, reliable, and secure",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Vision */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/5 rounded-2xl border border-purple-500/20 group-hover:border-purple-500/40 transition-all duration-300" />
                <div className="relative p-8 sm:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2
                      className="text-2xl font-bold text-foreground"
                      style={{ fontFamily: "var(--font-sora)" }}
                    >
                      Our Vision
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-base mb-6">
                    To be recognized globally as the most trusted technology
                    partner — known for innovation, integrity, and unwavering
                    commitment to our clients&apos; success. We envision a world
                    where technology serves humanity at its highest potential,
                    and ABWcurious is at the forefront of making that vision
                    real.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Global leader in integrated tech & cybersecurity",
                      "Pioneer AI-powered solutions for every industry",
                      "Build the next generation of technology talent",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Core Values ───────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.span
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4"
              >
                <Heart className="w-3.5 h-3.5" />
                What We Stand For
              </motion.span>
              <motion.h2
                variants={fadeInUp}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
                style={{ fontFamily: "var(--font-sora)" }}
              >
                Core Values
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-muted-foreground text-lg max-w-2xl mx-auto"
              >
                The principles that guide every decision we make, every product
                we build, and every relationship we cultivate.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {coreValues.map((value) => (
                <motion.div
                  key={value.title}
                  variants={fadeInUp}
                  whileHover={{ y: -4 }}
                  className="group relative p-6 rounded-2xl bg-card border border-border/40 hover:border-border transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${value.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <value.icon className={`w-6 h-6 ${value.color}`} />
                  </div>
                  <h3
                    className="text-lg font-semibold text-foreground mb-3"
                    style={{ fontFamily: "var(--font-sora)" }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Timeline ──────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.span
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-4"
              >
                <Star className="w-3.5 h-3.5" />
                Our Journey
              </motion.span>
              <motion.h2
                variants={fadeInUp}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
                style={{ fontFamily: "var(--font-sora)" }}
              >
                Company History
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-muted-foreground text-lg"
              >
                From a bold idea to a growing technology company — here&apos;s
                how we got here.
              </motion.p>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-cyan-500/30 to-transparent" />

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="space-y-12"
              >
                
                  >
                    {/* Content */}
                    <div
                      className={`flex-1 ${
                        i % 2 === 0
                          ? "sm:pr-12 sm:text-right"
                          : "sm:pl-12 sm:text-left"
                      } pl-14 sm:pl-0`}
                    >
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${event.color} text-white mb-3`}
                      >
                        {event.year}
                      </div>
                      <h3
                        className="text-xl font-semibold text-foreground mb-2"
                        style={{ fontFamily: "var(--font-sora)" }}
                      >
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    {/* Center icon */}
                    <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-0">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${event.color} flex items-center justify-center shadow-lg`}
                      >
                        <event.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden sm:block flex-1" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ─────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.span
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 mb-4"
                >
                  <Award className="w-3.5 h-3.5" />
                  Why ABWcurious
                </motion.span>
                <motion.h2
                  variants={fadeInUp}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
                  style={{ fontFamily: "var(--font-sora)" }}
                >
                  Why Choose Us
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  className="text-muted-foreground text-lg mb-8"
                >
                  We don&apos;t just deliver technology. We deliver outcomes —
                  backed by expertise, accountability, and genuine care for your
                  success.
                </motion.p>

                <motion.ul
                  variants={staggerContainer}
                  className="space-y-4"
                >
                  {whyChooseUs.map((item) => (
                    <motion.li
                      key={item}
                      variants={fadeInUp}
                      className="flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      </div>
                      <span className="text-muted-foreground text-sm leading-relaxed">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                {/* Culture card */}
                <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card p-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5" />
                  <div className="relative">
                    <h3
                      className="text-2xl font-bold text-foreground mb-4"
                      style={{ fontFamily: "var(--font-sora)" }}
                    >
                      Our Culture
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                      At ABWcurious, we believe our people are our greatest
                      asset. We cultivate a culture of continuous learning,
                      psychological safety, and bold experimentation. We
                      celebrate curiosity, embrace diversity, and believe that
                      the best ideas can come from anyone.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {[
                        { emoji: "🚀", label: "Move fast, learn faster" },
                        { emoji: "🔒", label: "Security is non-negotiable" },
                        { emoji: "💡", label: "Curiosity drives innovation" },
                        { emoji: "🤝", label: "Collaboration over competition" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="text-lg">{item.emoji}</span>
                          <span className="text-muted-foreground">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/careers"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
                    >
                      Join Our Team
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6"
                style={{ fontFamily: "var(--font-sora)" }}
              >
                Ready to Build Something{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Extraordinary?
                </span>
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-muted-foreground text-lg mb-10"
              >
                Whether you need a technology partner, a cybersecurity audit, or
                an AI-powered product — we&apos;re here to make it happen.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  Start a Conversation
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-border hover:border-blue-500/50 text-foreground font-semibold transition-all duration-200"
                >
                  Explore Our Services
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
