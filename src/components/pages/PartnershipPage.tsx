"use client";

import React, { useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  MonitorSmartphone,
  Handshake,
  GraduationCap,
  Store,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Send,
  Building2,
  User,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

/* ──────────── Animation Variants ──────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ──────────── Data ──────────── */

const partnershipTypes = [
  {
    title: "Technology Partners",
    type: "technology",
    icon: MonitorSmartphone,
    description:
      "Integrate ABWcurious solutions into your technology stack and deliver joint value to clients.",
    benefits: [
      "API access & technical integration support",
      "Co-development opportunities",
      "Joint solution marketing",
      "Revenue sharing model",
      "Priority technical support",
    ],
    gradient: "from-primary to-accent",
  },
  {
    title: "Strategic Partners",
    type: "strategic",
    icon: Handshake,
    description:
      "Grow together with ABWcurious through strategic alliances that drive mutual business success.",
    benefits: [
      "Co-branded initiatives & campaigns",
      "Shared business development",
      "Executive-level engagement",
      "Market expansion support",
      "Quarterly strategy reviews",
    ],
    gradient: "from-accent to-primary",
  },
  {
    title: "Academic Partners",
    type: "academic",
    icon: GraduationCap,
    description:
      "Collaborate on education, research, and training programs to shape the next generation of talent.",
    benefits: [
      "Curriculum co-development",
      "Research collaboration",
      "Student internship pipeline",
      "Guest lectures & workshops",
      "Lab & tool access",
    ],
    gradient: "from-primary via-accent to-primary",
  },
  {
    title: "Reseller Partners",
    type: "reseller",
    icon: Store,
    description:
      "Distribute ABWcurious products and solutions through your sales channels with competitive margins.",
    benefits: [
      "Competitive commission structure",
      "Sales enablement resources",
      "Dedicated partner manager",
      "Marketing collateral provided",
      "Deal registration protection",
    ],
    gradient: "from-accent via-primary to-accent",
  },
];

/* ──────────── Component ──────────── */

export default function PartnershipPage() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [partnershipType, setPartnershipType] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!companyName.trim() || !contactName.trim() || !email.trim() || !partnershipType || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (message.trim().length < 10) {
      toast.error("Message must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/partnerships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          contact_name: contactName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          partnership_type: partnershipType,
          message: message.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Thank you! We'll review your partnership application.");
        setSubmitted(true);
        // Reset form
        setCompanyName("");
        setContactName("");
        setEmail("");
        setPhone("");
        setPartnershipType("");
        setMessage("");
      } else {
        toast.error(data.error || "Failed to submit application.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" ref={sectionRef}>
      {/* ── Hero Section ── */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 gradient-radial-cyan pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp}>
            <span
              className="inline-block text-primary text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-4"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Partner With Us
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-foreground"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <span className="text-gradient-cyan">Partner With Us</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-foreground/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
          >
            Join our growing ecosystem of technology, strategic, academic, and
            reseller partners. Together, we can deliver cutting-edge
            cybersecurity and AI solutions to a broader audience.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Partnership Types Showcase ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="text-gradient-cyan">Partnership Models</span>
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
            {partnershipTypes.map((pt, i) => {
              const Icon = pt.icon;
              return (
                <motion.div
                  key={pt.type}
                  variants={cardVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Card className="glass-card p-5 sm:p-6 relative group overflow-hidden hover:border-primary/20 transition-all duration-500 h-full">
                    {/* Corner accent gradient */}
                    <div
                      className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                      aria-hidden="true"
                      style={{
                        background: `linear-gradient(225deg, var(--glow-color), transparent 70%)`,
                      }}
                    />

                    <div className="relative z-10">
                      {/* Icon */}
                      <div
                        className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary"
                        style={{ border: "1px solid var(--glow-color)" }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Title */}
                      <h3
                        className="text-lg font-semibold text-foreground mb-2"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                      >
                        {pt.title}
                      </h3>

                      {/* Description */}
                      <p className="text-foreground/80 text-sm leading-relaxed mb-5">
                        {pt.description}
                      </p>

                      {/* Benefits */}
                      <ul className="space-y-2.5">
                        {pt.benefits.map((b) => (
                          <li key={b} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-foreground/80 text-sm">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Partnership Application Form ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2
              className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              <span className="text-gradient-cyan">Apply for Partnership</span>
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-8">
              Fill in the details below and our team will get back to you.
            </p>

            {submitted ? (
              <motion.div
                className="glass-card p-8 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3
                  className="text-xl font-semibold text-foreground mb-2"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Application Submitted!
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Thank you! We&apos;ll review your partnership application and get
                  back to you soon.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="border-border"
                >
                  Submit Another Application
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card p-5 sm:p-8 space-y-5">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="p-company" className="text-foreground text-sm font-medium">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="p-company"
                      placeholder="Your company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="bg-background/50 border-border pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Contact Name */}
                <div className="space-y-2">
                  <Label htmlFor="p-contact" className="text-foreground text-sm font-medium">
                    Contact Person <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="p-contact"
                      placeholder="Full name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="bg-background/50 border-border pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="p-email" className="text-foreground text-sm font-medium">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="p-email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background/50 border-border pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-phone" className="text-foreground text-sm font-medium">
                      Phone <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="p-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-background/50 border-border pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Partnership Type */}
                <div className="space-y-2">
                  <Label className="text-foreground text-sm font-medium">
                    Partnership Type <span className="text-destructive">*</span>
                  </Label>
                  <Select value={partnershipType} onValueChange={setPartnershipType}>
                    <SelectTrigger className="bg-background/50 border-border">
                      <SelectValue placeholder="Select partnership type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology Partner</SelectItem>
                      <SelectItem value="strategic">Strategic Partner</SelectItem>
                      <SelectItem value="academic">Academic Partner</SelectItem>
                      <SelectItem value="reseller">Reseller Partner</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="p-message" className="text-foreground text-sm font-medium">
                    Message / Proposal <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="p-message"
                      placeholder="Tell us about your partnership vision..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-background/50 border-border min-h-[120px] pl-10 resize-y"
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 rounded-xl hover:shadow-[0_0_20px_var(--glow-color)] transition-all duration-300"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
