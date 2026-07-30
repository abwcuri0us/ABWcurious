"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Building, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function CaseStudiesClient({ caseStudies }: { caseStudies: any[] }) {
  // Fallback to static data if no database records exist
  const studies = caseStudies && caseStudies.length > 0 ? caseStudies : [
    { 
      title: "Securing Financial Infrastructure", 
      client: "Global FinTech Provider",
      description: "How we implemented a zero-trust architecture and 24/7 SOC for a leading financial services company, reducing incident response time by 85%.",
      slug: "#",
      icon: ShieldCheck
    },
    { 
      title: "Cloud Migration & Compliance", 
      client: "Healthcare Network",
      description: "A comprehensive case study on migrating sensitive healthcare data to the cloud while maintaining strict HIPAA and SOC2 compliance.",
      slug: "#",
      icon: Building
    }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="relative pt-32 pb-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-700/20 via-indigo-600/10 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6">
                  <BookOpen className="w-3.5 h-3.5" />
                  Success Stories
                </span>
              </motion.div>
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6" style={{ fontFamily: "var(--font-sora)" }}>
                Our <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Case Studies</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="max-w-3xl mx-auto text-lg text-muted-foreground leading-relaxed mb-10">
                Discover how we help enterprises secure their infrastructure and accelerate their digital transformation.
              </motion.p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 pb-32">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
            {studies.map((study, i) => {
              const Icon = study.icon || ShieldCheck;
              return (
                <div key={i} className="p-8 rounded-2xl bg-card border border-border hover:border-blue-500/50 transition-all hover:shadow-xl group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-xs font-medium px-3 py-1 bg-muted rounded-full text-muted-foreground">{study.client}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{study.title}</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">{study.description}</p>
                  <Link href={study.slug !== "#" ? `/case-studies/${study.slug}` : "#"} className="inline-flex items-center text-sm font-semibold text-blue-500 group-hover:text-blue-400 transition-colors mt-auto">
                    Read Full Case Study <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
