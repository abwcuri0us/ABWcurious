"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Clock, Send, MessageSquare,
  Briefcase, Users, ArrowRight, CheckCircle2, Globe,
  Linkedin, Twitter, Instagram, Facebook, Youtube,
} from "lucide-react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false, loading: () => null });

const fadeInUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    value: "info@abwcurious.com",
    href: "mailto:info@abwcurious.com",
    description: "We reply within 24 hours",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Phone,
    title: "Call Us",
    value: "+91 9930338504",
    href: "tel:+919930338504",
    description: "Monday – Friday, 9AM – 6PM IST",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    value: "S-07-05, Haware's Centurion Mall, Nerul East, Sector 19A, Nerul, Navi Mumbai, Maharashtra 400706",
    href: "#map",
    description: "By appointment only",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    value: "Chat with Curious AI",
    href: "#",
    description: "Available 24/7",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

const inquiryTypes = [
  { value: "general", label: "General Inquiry" },
  { value: "sales", label: "Business / Sales" },
  { value: "support", label: "Technical Support" },
  { value: "career", label: "Career Inquiry" },
  { value: "partnership", label: "Partnership" },
  { value: "feedback", label: "Feedback & Suggestions" },
  { value: "media", label: "Media / Press" },
];

const socialLinks = [
  { icon: Linkedin, href: "https://linkedin.com/company/abwcurious", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com/abwcurious", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/abwcurious", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/abwcurious", label: "Facebook" },
  { icon: Youtube, href: "https://youtube.com/@abwcurious", label: "YouTube" },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    inquiryType: "general",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Failed to send message. Please try again or email us directly.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Contact Us
                </span>
              </motion.div>
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6" style={{ fontFamily: "var(--font-sora)" }}>
                Let&apos;s Build Something{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Great Together
                </span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="max-w-2xl mx-auto text-lg text-muted-foreground">
                Have a project in mind? A question about our services? Or just want to say hello? We&apos;d love to hear from you.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {contactMethods.map((method) => (
                <motion.a key={method.title} href={method.href} variants={fadeInUp} whileHover={{ y: -2 }} className="group p-5 rounded-2xl bg-card border border-border/40 hover:border-border transition-all duration-300 hover:shadow-lg">
                  <div className={`w-10 h-10 rounded-xl ${method.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <method.icon className={`w-5 h-5 ${method.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{method.title}</h3>
                  <p className="text-xs text-foreground/80 mb-1 font-medium">{method.value}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Form + Info */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Contact Form */}
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:col-span-3">
                <div className="p-8 rounded-2xl bg-card border border-border/40">
                  <h2 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: "var(--font-sora)" }}>
                    Send Us a Message
                  </h2>

                  {submitted ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-foreground mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                            Full Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            id="name"
                            type="text"
                            required
                            value={formState.name}
                            onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-foreground placeholder:text-muted-foreground transition-all"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                            Email Address <span className="text-red-400">*</span>
                          </label>
                          <input
                            id="email"
                            type="email"
                            required
                            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                            title="Please enter a valid email address (e.g., name@example.com)"
                            value={formState.email}
                            onChange={(e) => setFormState((p) => ({ ...p, email: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-foreground placeholder:text-muted-foreground transition-all"
                            placeholder="you@company.com"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                          <input
                            id="phone"
                            type="tel"
                            pattern="^[0-9]{10}$"
                            title="Please enter a valid 10-digit phone number"
                            value={formState.phone}
                            onChange={(e) => setFormState((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-foreground placeholder:text-muted-foreground transition-all"
                            placeholder="+91 00000 00000"
                          />
                        </div>
                        <div>
                          <label htmlFor="company" className="block text-sm font-medium text-foreground mb-1.5">Company</label>
                          <input
                            id="company"
                            type="text"
                            value={formState.company}
                            onChange={(e) => setFormState((p) => ({ ...p, company: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-foreground placeholder:text-muted-foreground transition-all"
                            placeholder="Your company name"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="inquiryType" className="block text-sm font-medium text-foreground mb-1.5">Inquiry Type</label>
                        <select
                          id="inquiryType"
                          value={formState.inquiryType}
                          onChange={(e) => setFormState((p) => ({ ...p, inquiryType: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-foreground transition-all"
                        >
                          {inquiryTypes.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">
                          Subject <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="subject"
                          type="text"
                          required
                          value={formState.subject}
                          onChange={(e) => setFormState((p) => ({ ...p, subject: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-foreground placeholder:text-muted-foreground transition-all"
                          placeholder="Brief subject of your inquiry"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
                          Message <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          id="message"
                          required
                          rows={5}
                          value={formState.message}
                          onChange={(e) => setFormState((p) => ({ ...p, message: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-foreground placeholder:text-muted-foreground transition-all resize-none"
                          placeholder="Tell us about your project, requirements, or question..."
                        />
                      </div>

                      {error && (
                        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
                      >
                        {submitting ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {submitting ? "Sending..." : "Send Message"}
                      </button>

                      <p className="text-xs text-center text-muted-foreground">
                        By submitting this form, you agree to our{" "}
                        <Link href="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
                      </p>
                    </form>
                  )}
                </div>
              </motion.div>

              {/* Company Info */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:col-span-2 space-y-6">
                {/* Office hours */}
                <div className="p-6 rounded-2xl bg-card border border-border/40">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-foreground">Business Hours</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monday – Friday</span>
                      <span className="text-foreground font-medium">9:00 AM – 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saturday</span>
                      <span className="text-foreground font-medium">10:00 AM – 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunday</span>
                      <span className="text-muted-foreground">Closed</span>
                    </div>
                    <div className="pt-2 border-t border-border/40">
                      <span className="text-xs text-green-400">24/7 Emergency Security Support Available</span>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="p-6 rounded-2xl bg-card border border-border/40">
                  <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
                  <div className="space-y-3">
                    {[
                      { icon: Briefcase, label: "View Open Positions", href: "/careers" },
                      { icon: Users, label: "Become a Partner", href: "/partnership" },
                      { icon: Globe, label: "Explore Our Products", href: "/products" },
                    ].map((link) => (
                      <Link key={link.label} href={link.href} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                        <link.icon className="w-4 h-4 text-blue-400" />
                        {link.label}
                        <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Social Media */}
                <div className="p-6 rounded-2xl bg-card border border-border/40">
                  <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {socialLinks.map((social) => (
                      <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors group">
                        <social.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="text-[10px] text-muted-foreground">{social.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map */}
        <section id="map" className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2" style={{ fontFamily: "var(--font-sora)" }}>
                <MapPin className="w-5 h-5 text-blue-400" />
                Find Us
              </h2>
              <div className="rounded-2xl overflow-hidden border border-border/40 shadow-xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53768.54653679616!2d72.98699682636942!3d19.06295472912357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c3d076147f7b%3A0xe421751ae4517f6d!2sABWcurious%20Pvt.Ltd!5e1!3m2!1sen!2sin!4v1785188566040!5m2!1sen!2sin"
                  width="100%"
                  height="500"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="ABWcurious Pvt. Ltd. Location"
                />
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
