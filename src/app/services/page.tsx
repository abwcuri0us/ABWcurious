"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code2,
  Globe,
  Smartphone,
  Cloud,
  TrendingUp,
  GitBranch,
  Briefcase,
  Palette,
  Wrench,
  Zap,
  Brain,
  Activity,
  Wifi,
  Cpu,
  ArrowRight,
  Shield,
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

interface Service {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  category: string;
  color: string;
  gradient: string;
  features: string[];
}

const services: Service[] = [
  {
    slug: "software-development",
    name: "Software Development",
    tagline: "Custom software built for scale",
    description: "End-to-end software engineering from architecture design to deployment. We build robust, scalable, and maintainable software solutions.",
    icon: Code2,
    category: "Development",
    color: "text-blue-400",
    gradient: "from-blue-500/10 to-blue-600/5",
    features: ["Web Applications", "Enterprise Software", "API Development", "Microservices"],
  },
  {
    slug: "website-development",
    name: "Website Development",
    tagline: "Stunning, high-performance websites",
    description: "Modern, responsive websites with exceptional performance, SEO optimization, and outstanding user experiences.",
    icon: Globe,
    category: "Development",
    color: "text-cyan-400",
    gradient: "from-cyan-500/10 to-cyan-600/5",
    features: ["Next.js & React", "CMS Integration", "E-commerce", "Performance Optimization"],
  },
  {
    slug: "mobile-apps",
    name: "Mobile App Development",
    tagline: "Native & cross-platform mobile apps",
    description: "iOS, Android, and cross-platform mobile applications built with React Native and Flutter for superior user experiences.",
    icon: Smartphone,
    category: "Development",
    color: "text-purple-400",
    gradient: "from-purple-500/10 to-purple-600/5",
    features: ["iOS & Android", "React Native", "Flutter", "App Store Deployment"],
  },
  {
    slug: "cloud-solutions",
    name: "Cloud Solutions",
    tagline: "Scalable cloud infrastructure",
    description: "Cloud architecture design, migration, and managed services on AWS, Azure, and Google Cloud platforms.",
    icon: Cloud,
    category: "Infrastructure",
    color: "text-sky-400",
    gradient: "from-sky-500/10 to-sky-600/5",
    features: ["AWS / Azure / GCP", "Cloud Migration", "Serverless", "Cost Optimization"],
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    tagline: "Data-driven growth strategies",
    description: "SEO, SEM, social media marketing, content strategy, and performance analytics to grow your digital presence.",
    icon: TrendingUp,
    category: "Marketing",
    color: "text-orange-400",
    gradient: "from-orange-500/10 to-orange-600/5",
    features: ["SEO & SEM", "Social Media", "Content Strategy", "Analytics"],
  },
  {
    slug: "devops",
    name: "DevOps & CI/CD",
    tagline: "Automate. Deploy. Scale.",
    description: "DevOps transformation, CI/CD pipeline implementation, infrastructure as code, and continuous improvement.",
    icon: GitBranch,
    category: "DevOps",
    color: "text-green-400",
    gradient: "from-green-500/10 to-green-600/5",
    features: ["CI/CD Pipelines", "Docker & Kubernetes", "Infrastructure as Code", "Monitoring"],
  },
  {
    slug: "it-consulting",
    name: "IT Consulting",
    tagline: "Strategic technology advisory",
    description: "Enterprise IT strategy, technology architecture review, digital transformation roadmapping, and vendor selection.",
    icon: Briefcase,
    category: "Consulting",
    color: "text-slate-400",
    gradient: "from-slate-500/10 to-slate-600/5",
    features: ["IT Strategy", "Architecture Review", "Digital Transformation", "Technology Audit"],
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX Design",
    tagline: "Experiences that delight users",
    description: "User research, wireframing, prototyping, design systems, and pixel-perfect UI implementation for web and mobile.",
    icon: Palette,
    category: "Design",
    color: "text-pink-400",
    gradient: "from-pink-500/10 to-pink-600/5",
    features: ["User Research", "Design Systems", "Prototyping", "Accessibility"],
  },
  {
    slug: "maintenance-support",
    name: "Maintenance & Support",
    tagline: "Keep your systems running flawlessly",
    description: "24/7 monitoring, proactive maintenance, bug fixes, security patches, and technical support for your digital products.",
    icon: Wrench,
    category: "Support",
    color: "text-yellow-400",
    gradient: "from-yellow-500/10 to-yellow-600/5",
    features: ["24/7 Monitoring", "Bug Fixes", "Security Patches", "SLA Guarantees"],
  },
  {
    slug: "automation",
    name: "Process Automation",
    tagline: "Automate your workflows",
    description: "Business process automation, robotic process automation (RPA), workflow optimization, and intelligent automation.",
    icon: Zap,
    category: "Automation",
    color: "text-amber-400",
    gradient: "from-amber-500/10 to-amber-600/5",
    features: ["RPA", "Workflow Automation", "API Integration", "Business Intelligence"],
  },
  {
    slug: "ai-solutions",
    name: "AI Solutions",
    tagline: "Intelligent systems for every challenge",
    description: "Custom AI/ML solutions, large language model integration, RAG systems, and intelligent automation for enterprise.",
    icon: Brain,
    category: "Artificial Intelligence",
    color: "text-violet-400",
    gradient: "from-violet-500/10 to-violet-600/5",
    features: ["LLM Integration", "RAG Systems", "AI Chatbots", "Computer Vision"],
  },
  {
    slug: "machine-learning",
    name: "Machine Learning",
    tagline: "Data-driven predictions and insights",
    description: "ML model development, training pipelines, MLOps implementation, and production deployment for real-world applications.",
    icon: Activity,
    category: "Artificial Intelligence",
    color: "text-fuchsia-400",
    gradient: "from-fuchsia-500/10 to-fuchsia-600/5",
    features: ["Model Development", "MLOps", "Data Engineering", "Predictive Analytics"],
  },
  {
    slug: "iot",
    name: "IoT Solutions",
    tagline: "Connect everything",
    description: "IoT device management, edge computing, sensor integration, and connected systems for smart environments.",
    icon: Wifi,
    category: "IoT",
    color: "text-teal-400",
    gradient: "from-teal-500/10 to-teal-600/5",
    features: ["Device Management", "Edge Computing", "Real-time Monitoring", "MQTT / CoAP"],
  },
  {
    slug: "embedded-systems",
    name: "Embedded Systems",
    tagline: "Hardware meets software",
    description: "Embedded software development, firmware engineering, RTOS integration, and hardware-software co-design.",
    icon: Cpu,
    category: "Embedded",
    color: "text-red-400",
    gradient: "from-red-500/10 to-red-600/5",
    features: ["Firmware Development", "RTOS", "Hardware Integration", "Protocol Design"],
  },
];

const categories = ["All", "Development", "Infrastructure", "Artificial Intelligence", "Cybersecurity", "Design", "DevOps", "IoT", "Embedded", "Consulting", "Support", "Marketing", "Automation"];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-cyan-600/15 via-blue-500/10 to-transparent rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
                  <Shield className="w-3.5 h-3.5" />
                  Our Services
                </span>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
                style={{ fontFamily: "var(--font-sora)" }}
              >
                Technology Solutions{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Tailored for You
                </span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
                From idea to deployment — we cover the full spectrum of modern technology services. Every service is delivered with precision, security, and a relentless focus on your success.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {services.map((service) => (
                <motion.div key={service.slug} variants={fadeInUp} whileHover={{ y: -4 }}>
                  <Link href={`/services/${service.slug}`} className="block group h-full">
                    <div className={`relative h-full p-6 rounded-2xl bg-gradient-to-br ${service.gradient} border border-border/40 hover:border-border/80 transition-all duration-300 hover:shadow-xl`}>
                      {/* Category badge */}
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-background/50 text-muted-foreground border border-border/40 mb-4">
                        {service.category}
                      </span>

                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-xl bg-background/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <service.icon className={`w-5 h-5 ${service.color}`} />
                      </div>

                      {/* Content */}
                      <h3 className="text-base font-semibold text-foreground mb-1.5" style={{ fontFamily: "var(--font-sora)" }}>
                        {service.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                        {service.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-1 mb-5">
                        {service.features.slice(0, 3).map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <div className={`w-1.5 h-1.5 rounded-full bg-current ${service.color}`} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <div className={`flex items-center gap-1.5 text-xs font-semibold ${service.color} group-hover:gap-2.5 transition-all duration-200`}>
                        Learn more <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Cybersecurity CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden border border-blue-500/20 bg-gradient-to-br from-blue-950/50 via-slate-900/80 to-purple-950/50 p-10 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/5" />
              <div className="relative">
                <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-sora)" }}>
                  Dedicated Cybersecurity Services
                </h2>
                <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                  Protect your business with our comprehensive security portfolio — VAPT, SOC, SIEM, incident response, compliance, and more.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/cybersecurity" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30">
                    View Cybersecurity Services <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-blue-500/30 hover:border-blue-400/60 text-white font-semibold transition-all duration-200">
                    Get a Free Consultation
                  </Link>
                </div>
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
