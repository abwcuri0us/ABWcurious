"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  BookOpen,
  Building2,
  ChevronRight,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Target,
  Lightbulb,
  TrendingUp,
  Calendar,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

/* ──────────── Types ──────────── */

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  client_name: string | null;
  industry: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

interface CaseStudyDetail extends CaseStudy {
  content: string;
}

/* ──────────── Animation Variants ──────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const heroVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/* ──────────── Industries for filter ──────────── */

const INDUSTRIES = [
  "All",
  "Healthcare",
  "Finance",
  "Education",
  "E-commerce",
  "Manufacturing",
  "Government",
  "Real Estate",
  "Logistics",
  "Technology",
  "Retail",
  "Other",
];

/* ──────────── Case Study Card ──────────── */

function CaseStudyCard({
  study,
  onClick,
  index,
}: {
  study: CaseStudy;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="group overflow-hidden border border-border/40 hover:border-primary/30 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
        onClick={onClick}
      >
        {/* Cover Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted/40">
          {study.cover_image ? (
            <Image
              src={study.cover_image}
              alt={study.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/5 to-primary/10">
              <BookOpen className="h-12 w-12 text-primary/30" />
            </div>
          )}
          {study.is_featured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-amber-500/90 text-white text-[10px] font-semibold border-0">
                Featured
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-5 space-y-3">
          {/* Industry & Date */}
          <div className="flex items-center gap-2 flex-wrap">
            {study.industry && (
              <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
                {study.industry}
              </Badge>
            )}
            {study.published_at && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(study.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {study.title}
          </h3>

          {/* Excerpt */}
          {study.excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {study.excerpt}
            </p>
          )}

          {/* Client */}
          {study.client_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              <span>{study.client_name}</span>
            </div>
          )}

          {/* Tags */}
          {study.tags && study.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {study.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] font-normal px-1.5 py-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Read more */}
          <div className="flex items-center gap-1 pt-1 text-sm font-medium text-primary/70 group-hover:text-primary transition-colors">
            <span>Read case study</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ──────────── Case Study Detail View ──────────── */

function CaseStudyDetail({
  study,
  onBack,
}: {
  study: CaseStudyDetail;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Case Studies</span>
      </button>

      {/* Hero Image */}
      {study.cover_image && (
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-8 bg-muted/40">
          <Image
            src={study.cover_image}
            alt={study.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {study.industry && (
          <Badge variant="secondary" className="text-xs font-medium">
            {study.industry}
          </Badge>
        )}
        {study.client_name && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span>{study.client_name}</span>
          </div>
        )}
        {study.published_at && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(study.published_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
        {study.title}
      </h1>

      {/* Excerpt */}
      {study.excerpt && (
        <p className="text-lg text-muted-foreground leading-relaxed mb-8 border-l-2 border-primary/30 pl-4">
          {study.excerpt}
        </p>
      )}

      {/* Tags */}
      {study.tags && study.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {study.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Challenge, Solution, Results */}
      <div className="space-y-8">
        {study.challenge && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-red-400" />
              <h2 className="text-xl font-semibold text-foreground">The Challenge</h2>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
              {study.challenge}
            </div>
          </motion.section>
        )}

        {study.solution && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-semibold text-foreground">Our Solution</h2>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
              {study.solution}
            </div>
          </motion.section>
        )}

        {study.results && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-foreground">Results</h2>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
              {study.results}
            </div>
          </motion.section>
        )}

        {/* Full Content */}
        {study.content && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: study.content }}
            />
          </motion.section>
        )}
      </div>

      {/* CTA */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Want similar results?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Let&apos;s discuss how we can help transform your business.
            </p>
          </div>
          <Link href="#contact">
            <Button className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">
              <ExternalLink className="h-4 w-4 mr-2" />
              Get in Touch
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────── Main Case Studies Page ──────────── */

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedStudy, setSelectedStudy] = useState<CaseStudyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchCaseStudies = useCallback(async (industry?: string, search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (industry && industry !== "All") params.set("industry", industry);
      if (search) params.set("search", search);

      const res = await fetch(`/api/case-studies?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch case studies");
      const json = await res.json();
      setCaseStudies(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaseStudies();
  }, [fetchCaseStudies]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      fetchCaseStudies(selectedIndustry, value);
    },
    [fetchCaseStudies, selectedIndustry]
  );

  const handleIndustryChange = useCallback(
    (industry: string) => {
      setSelectedIndustry(industry);
      fetchCaseStudies(industry, searchQuery);
    },
    [fetchCaseStudies, searchQuery]
  );

  const handleStudyClick = useCallback(async (study: CaseStudy) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/case-studies/${study.slug}`);
      if (!res.ok) throw new Error("Failed to fetch case study");
      const json = await res.json();
      setSelectedStudy(json.data);
    } catch {
      // If slug fetch fails, use the list data (minus content)
      setSelectedStudy(study as CaseStudyDetail);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /* Detail View */
  if (selectedStudy) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {detailLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <CaseStudyDetail
            study={selectedStudy}
            onBack={() => setSelectedStudy(null)}
          />
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      {/* ── Hero Section ── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={heroVariants} className="space-y-4">
            <Badge
              variant="secondary"
              className="px-3 py-1 text-xs font-medium tracking-wide uppercase"
            >
              <BookOpen className="h-3 w-3 mr-1.5" />
              Success Stories
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
              Case Studies
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore our successful projects and see how ABWcurious delivers innovative
              technology solutions that drive real business outcomes for our clients.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Search & Filters ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search case studies..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-card/80 border-border/40"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle (mobile) */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>

            {/* Industry Filters (desktop) */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium mr-1">
                Industry:
              </span>
              {INDUSTRIES.slice(0, 6).map((industry) => (
                <button
                  key={industry}
                  onClick={() => handleIndustryChange(industry)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-all duration-200 ${
                    selectedIndustry === industry
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>

          {/* Expandable Filters (mobile) */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden sm:hidden mt-3"
              >
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-card/80 border border-border/40">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => {
                        handleIndustryChange(industry);
                        setShowFilters(false);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${
                        selectedIndustry === industry
                          ? "bg-primary text-primary-foreground font-medium"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Case Studies Grid ── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground text-sm">
                Loading case studies...
              </span>
            </div>
          ) : error ? (
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-destructive/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Unable to load case studies
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                {error}
              </p>
              <Button
                variant="outline"
                onClick={() => fetchCaseStudies(selectedIndustry, searchQuery)}
              >
                Try Again
              </Button>
            </motion.div>
          ) : caseStudies.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No case studies found
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {searchQuery || selectedIndustry !== "All"
                  ? "Try adjusting your search or filters."
                  : "Case studies will be added soon. Check back later!"}
              </p>
              {(searchQuery || selectedIndustry !== "All") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedIndustry("All");
                    fetchCaseStudies();
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <>
              {/* Results count */}
              <motion.p variants={itemVariants} className="text-sm text-muted-foreground mb-6">
                Showing {caseStudies.length} case study{caseStudies.length !== 1 ? "ies" : ""}
                {selectedIndustry !== "All" && (
                  <span>
                    {" "}
                    in <span className="font-medium text-foreground">{selectedIndustry}</span>
                  </span>
                )}
              </motion.p>

              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {caseStudies.map((study, index) => (
                  <CaseStudyCard
                    key={study.id}
                    study={study}
                    index={index}
                    onClick={() => handleStudyClick(study)}
                  />
                ))}
              </motion.div>
            </>
          )}
        </div>
      </section>
    </motion.div>
  );
}
