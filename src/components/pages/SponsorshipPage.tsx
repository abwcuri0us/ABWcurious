"use client";

import React, { useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Crown,
  Award,
  Medal,
  Star,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Send,
  Building2,
  User,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
  Mic2,
  Presentation,
  Users,
  Globe,
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

const sponsorshipTiers = [
  {
    title: "Platinum",
    level: "platinum",
    price: "₹5,00,000+",
    icon: Crown,
    gradient: "from-gray-900 via-slate-900 to-gray-900 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900",
    textColor: "text-cyan-300 dark:text-cyan-300",
    borderColor: "border-cyan-400/40 dark:border-cyan-400/30",
    iconColor: "text-cyan-400 dark:text-cyan-400",
    benefits: [
      "Logo on all marketing materials",
      "Keynote speaking slot",
      "Premium booth space",
      "Full-page ad in event program",
      "Social media campaign",
      "VIP networking access",
      "Custom workshop session",
      "First right of refusal for future events",
    ],
    popular: true,
  },
  {
    title: "Gold",
    level: "gold",
    price: "₹2,50,000+",
    icon: Award,
    gradient: "from-amber-300 via-yellow-400 to-amber-500",
    textColor: "text-amber-900 dark:text-amber-50",
    borderColor: "border-amber-400/50 dark:border-amber-500/30",
    iconColor: "text-amber-700 dark:text-amber-200",
    benefits: [
      "Logo on all marketing materials",
      "Workshop speaking slot",
      "Standard booth space",
      "Half-page ad in event program",
      "Social media mentions",
      "Networking event access",
    ],
    popular: false,
  },
  {
    title: "Silver",
    level: "silver",
    price: "₹1,00,000+",
    icon: Medal,
    gradient: "from-gray-300 via-gray-400 to-gray-500",
    textColor: "text-gray-800 dark:text-gray-100",
    borderColor: "border-gray-400/50 dark:border-gray-500/30",
    iconColor: "text-gray-600 dark:text-gray-300",
    benefits: [
      "Logo on event website",
      "Event passes (5 attendees)",
      "Quarter-page ad in program",
      "Social media mention",
    ],
    popular: false,
  },
  {
    title: "Bronze",
    level: "bronze",
    price: "₹50,000+",
    icon: Star,
    gradient: "from-orange-400 via-orange-500 to-amber-600",
    textColor: "text-orange-900 dark:text-orange-50",
    borderColor: "border-orange-400/50 dark:border-orange-500/30",
    iconColor: "text-orange-700 dark:text-orange-200",
    benefits: [
      "Logo on event website",
      "Social media mention",
      "Event passes (2 attendees)",
    ],
    popular: false,
  },
];

/* ──────────── Component ──────────── */

export default function SponsorshipPage() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sponsorshipLevel, setSponsorshipLevel] = useState("");
  const [eventName, setEventName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !contactName.trim() || !email.trim() || !sponsorshipLevel || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (message.trim().length < 10) {
      toast.error("Message must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/sponsorships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          contact_name: contactName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          sponsorship_level: sponsorshipLevel,
          event_name: eventName.trim() || undefined,
          message: message.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Thank you! Your sponsorship application has been submitted.");
        setSubmitted(true);
        setCompanyName("");
        setContactName("");
        setEmail("");
        setPhone("");
        setSponsorshipLevel("");
        setEventName("");
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
              Sponsor ABWcurious
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-foreground"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <span className="text-gradient-cyan">Sponsor ABWcurious</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-foreground/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
          >
            Amplify your brand by sponsoring ABWcurious events. Reach thousands
            of cybersecurity professionals, AI enthusiasts, and tech leaders
            across India and beyond.
          </motion.p>

          {/* Quick stats */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap justify-center gap-6 mt-8"
          >
            {[
              { value: "1000+", label: "Attendees" },
              { value: "50+", label: "Events/Year" },
              { value: "100K+", label: "Online Reach" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card px-5 py-3 text-center"
              >
                <div
                  className="text-xl sm:text-2xl font-bold text-gradient-cyan"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Sponsorship Tiers ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="text-gradient-cyan">Sponsorship Tiers</span>
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {sponsorshipTiers.map((tier, i) => {
              const Icon = tier.icon;
              return (
                <motion.div
                  key={tier.level}
                  variants={cardVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="relative"
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                      <span className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <Card
                    className={`glass-card overflow-hidden hover:border-primary/20 transition-all duration-500 h-full flex flex-col ${
                      tier.popular ? "ring-1 ring-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.15)] animate-[cyanGlow_3s_ease-in-out_infinite]" : ""
                    }`}
                  >
                    {/* Tier header */}
                    <div
                      className={`bg-gradient-to-r ${tier.gradient} p-5 text-center relative`}
                    >
                      {/* Platinum glow/shimmer overlay */}
                      {tier.level === "platinum" && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              "radial-gradient(ellipse at 50% 0%, rgba(34,211,238,0.08) 0%, transparent 50%)",
                          }}
                        />
                      )}
                      <Icon className={`w-8 h-8 mx-auto mb-2 relative z-10 ${tier.iconColor}`} />
                      <h3
                        className={`text-xl font-bold relative z-10 ${tier.textColor}`}
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                      >
                        {tier.title}
                      </h3>
                      <p className={`text-lg font-semibold mt-1 relative z-10 ${tier.textColor} opacity-90`}>
                        {tier.price}
                      </p>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col">
                      {/* Benefits */}
                      <ul className="space-y-2.5 mb-6 flex-1">
                        {tier.benefits.map((b) => (
                          <li key={b} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-foreground/80 text-sm">{b}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <Button
                        onClick={() => {
                          setSponsorshipLevel(tier.level);
                          document.getElementById("sponsorship-form")?.scrollIntoView({
                            behavior: "smooth",
                          });
                        }}
                        variant="outline"
                        className={`w-full font-semibold text-sm py-2.5 rounded-xl transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:border-primary/30 ${tier.borderColor}`}
                      >
                        Choose {tier.title}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Sponsorship Application Form ── */}
      <section id="sponsorship-form" className="relative px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h2
              className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              <span className="text-gradient-cyan">Apply for Sponsorship</span>
            </h2>
            <p className="text-muted-foreground text-sm text-center mb-8">
              Choose a tier and submit your sponsorship application.
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
                  Thank you for your interest in sponsoring ABWcurious. We&apos;ll
                  review your application and get back to you soon.
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
                  <Label htmlFor="s-company" className="text-foreground text-sm font-medium">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="s-company"
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
                  <Label htmlFor="s-contact" className="text-foreground text-sm font-medium">
                    Contact Person <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="s-contact"
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
                    <Label htmlFor="s-email" className="text-foreground text-sm font-medium">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="s-email"
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
                    <Label htmlFor="s-phone" className="text-foreground text-sm font-medium">
                      Phone <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="s-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-background/50 border-border pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Sponsorship Level & Event Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground text-sm font-medium">
                      Sponsorship Level <span className="text-destructive">*</span>
                    </Label>
                    <Select value={sponsorshipLevel} onValueChange={setSponsorshipLevel}>
                      <SelectTrigger className="bg-background/50 border-border">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="platinum">
                          <span className="flex items-center gap-2">
                            <Crown className="w-3.5 h-3.5" />
                            Platinum
                          </span>
                        </SelectItem>
                        <SelectItem value="gold">
                          <span className="flex items-center gap-2">
                            <Award className="w-3.5 h-3.5" />
                            Gold
                          </span>
                        </SelectItem>
                        <SelectItem value="silver">
                          <span className="flex items-center gap-2">
                            <Medal className="w-3.5 h-3.5" />
                            Silver
                          </span>
                        </SelectItem>
                        <SelectItem value="bronze">
                          <span className="flex items-center gap-2">
                            <Star className="w-3.5 h-3.5" />
                            Bronze
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s-event" className="text-foreground text-sm font-medium">
                      Event Name <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="s-event"
                      placeholder="Specific event (if any)"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="bg-background/50 border-border"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="s-message" className="text-foreground text-sm font-medium">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="s-message"
                      placeholder="Tell us about your sponsorship goals..."
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
                      Submit Sponsorship Application
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
