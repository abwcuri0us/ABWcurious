"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Filter,
  FileText,
  Upload,
  X,
  LogIn,
  ChevronDown,
  Building2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

/* ──────────── Types ──────────── */

interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  requirements: string[] | null;
  is_active: boolean;
  created_at: string;
}

interface JobApplication {
  id: string;
  career_id: string;
  user_id: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "hired";
  cover_letter: string | null;
  resume_url: string | null;
  created_at: string;
  career: {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
  } | null;
}

/* ──────────── Animation Variants ──────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
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

/* ──────────── Helpers ──────────── */

const JOB_TYPE_COLORS: Record<string, string> = {
  "full-time": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "part-time": "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  internship: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  contract: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  reviewed: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  shortlisted: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
  hired: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

/* ──────────── Component ──────────── */

export default function CareersPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);

  // Filters
  const [deptFilter, setDeptFilter] = useState("all");
  const [locFilter, setLocFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Application modal
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Login prompt
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  // ── Fetch careers ──
  const fetchCareers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/careers");
      const data = await res.json();
      if (data.success) setCareers(data.data || []);
    } catch {
      toast.error("Failed to load job listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch user applications ──
  const fetchApplications = useCallback(async () => {
    if (!token) return;
    setAppsLoading(true);
    try {
      const res = await fetch("/api/careers/apply", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setApplications(data.data || []);
    } catch {
      // silently fail
    } finally {
      setAppsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCareers();
  }, [fetchCareers]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ── Derived filter options ──
  const departments = [...new Set(careers.map((c) => c.department).filter(Boolean))];
  const locations = [...new Set(careers.map((c) => c.location).filter(Boolean))];

  const filteredCareers = careers.filter((c) => {
    if (deptFilter !== "all" && c.department !== deptFilter) return false;
    if (locFilter !== "all" && c.location !== locFilter) return false;
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    return true;
  });

  // ── Handle apply click ──
  const handleApplyClick = (career: Career) => {
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    setSelectedCareer(career);
    setCoverLetter("");
    setResumeFile(null);
    setApplyOpen(true);
  };

  // ── Submit application ──
  const handleSubmitApplication = async () => {
    if (!selectedCareer || !token) return;
    if (!coverLetter.trim() && !resumeFile) {
      toast.error("Please provide a cover letter or upload a resume.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("career_id", selectedCareer.id);
      if (coverLetter.trim()) formData.append("cover_letter", coverLetter.trim());
      if (resumeFile) formData.append("resume", resumeFile);

      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Application submitted successfully!");
        setApplyOpen(false);
        fetchApplications();
      } else {
        toast.error(data.error || "Failed to submit application.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Resume file validation ──
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      toast.error("Only PDF, DOC, or DOCX files are accepted.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB.");
      e.target.value = "";
      return;
    }
    setResumeFile(file);
  };

  return (
    <div className="min-h-screen">
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
              Careers
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-foreground"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <span className="text-gradient-cyan">Join Our Team</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-foreground/80 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed"
          >
            Build the future of cybersecurity and AI with us. Explore career
            opportunities at ABWcurious and be part of a team that&apos;s shaping
            tomorrow&apos;s technology landscape.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Filter Bar ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 -mt-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="glass-card p-4 sm:p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3 text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter Jobs</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Department */}
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="bg-background/50 border-border">
                  <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location */}
              <Select value={locFilter} onValueChange={setLocFilter}>
                <SelectTrigger className="bg-background/50 border-border">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-background/50 border-border">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Job Listings ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-card p-5 animate-pulse"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-6 w-48 rounded bg-foreground/5" />
                    <div className="h-6 w-20 rounded bg-foreground/5" />
                  </div>
                  <div className="h-4 w-32 rounded bg-foreground/5 mb-2" />
                  <div className="h-4 w-24 rounded bg-foreground/5 mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-foreground/5" />
                    <div className="h-3 w-3/4 rounded bg-foreground/5" />
                  </div>
                  <div className="mt-4 h-9 w-28 rounded-lg bg-foreground/5" />
                </div>
              ))}
            </div>
          ) : filteredCareers.length === 0 ? (
            <motion.div
              className="glass-card p-10 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No positions found
              </h3>
              <p className="text-muted-foreground text-sm">
                {careers.length === 0
                  ? "There are no open positions at the moment. Check back soon!"
                  : "Try adjusting your filters to see more results."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCareers.map((career) => {
                const salary = formatSalary(career.salary_min, career.salary_max);
                return (
                  <motion.div key={career.id} variants={cardVariants}>
                    <Card className="glass-card overflow-hidden hover:border-primary/20 transition-all duration-500 group">
                      <CardContent className="p-5 sm:p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3
                            className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors"
                            style={{ fontFamily: "var(--font-space-grotesk)" }}
                          >
                            {career.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`shrink-0 text-xs ${JOB_TYPE_COLORS[career.type] || "bg-secondary text-secondary-foreground border-border"}`}
                          >
                            {career.type}
                          </Badge>
                        </div>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-muted-foreground">
                          {career.department && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {career.department}
                            </span>
                          )}
                          {career.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {career.location}
                            </span>
                          )}
                          {salary && (
                            <span className="flex items-center gap-1 text-primary">
                              <DollarSign className="w-3.5 h-3.5" />
                              {salary}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-foreground/80 text-sm leading-relaxed mb-4 line-clamp-3">
                          {career.description}
                        </p>

                        {/* Apply button */}
                        <Button
                          onClick={() => handleApplyClick(career)}
                          className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm py-2.5 px-5 rounded-xl hover:shadow-[0_0_20px_var(--glow-color)] transition-all duration-300"
                        >
                          Apply Now
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── My Applications ── */}
      {user && (
        <section className="relative px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2
                className="text-2xl sm:text-3xl font-bold text-foreground mb-6"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                <span className="text-gradient-cyan">My Applications</span>
              </h2>

              {appsLoading ? (
                <div className="glass-card p-6 animate-pulse space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-lg bg-foreground/5" />
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">
                    You haven&apos;t applied to any positions yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {app.career?.title || "Unknown Position"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {app.career?.department && `${app.career.department} • `}
                            Applied {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize shrink-0 ${STATUS_COLORS[app.status] || ""}`}
                      >
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Application Modal ── */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="glass-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle
              className="text-foreground"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Apply for {selectedCareer?.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Submit your application for this position at ABWcurious.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Career summary */}
            {selectedCareer && (
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {selectedCareer.department && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {selectedCareer.department}
                  </span>
                )}
                {selectedCareer.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedCareer.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedCareer.type}
                </span>
              </div>
            )}

            {/* Cover letter */}
            <div className="space-y-2">
              <Label htmlFor="cover-letter" className="text-foreground text-sm font-medium">
                Cover Letter
              </Label>
              <Textarea
                id="cover-letter"
                placeholder="Tell us why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="bg-background/50 border-border min-h-[120px] resize-y"
              />
            </div>

            {/* Resume upload */}
            <div className="space-y-2">
              <Label htmlFor="resume" className="text-foreground text-sm font-medium">
                Resume (PDF, DOC, DOCX — max 5MB)
              </Label>
              <div className="relative">
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="bg-background/50 border-border file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>
              {resumeFile && (
                <p className="text-xs text-primary flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  {resumeFile.name}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmitApplication}
              disabled={submitting}
              className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-2.5 rounded-xl hover:shadow-[0_0_20px_var(--glow-color)] transition-all duration-300"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Login Prompt Dialog ── */}
      <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
        <DialogContent className="glass-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle
              className="text-foreground"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Login Required
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Please log in to apply for job positions.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button
              onClick={() => {
                setLoginPromptOpen(false);
                // Open the auth dialog by dispatching a custom event
                window.dispatchEvent(new CustomEvent("abwcurious:open-auth", { detail: { mode: "login" } }));
              }}
              className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-2.5 rounded-xl"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login to Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
