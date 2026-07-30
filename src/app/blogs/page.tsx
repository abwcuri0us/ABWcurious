"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Clock, Tag, TrendingUp, PenLine, ArrowRight, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import dynamic from "next/dynamic";

const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false, loading: () => null });

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_url?: string;
  category: string;
  tags: string[];
  status: string;
  reading_time: number;
  view_count: number;
  published_at: string;
  author?: { full_name: string; avatar_url?: string };
}

const CATEGORIES = ["All", "Technology", "Cybersecurity", "AI & ML", "Software Dev", "Cloud", "Company News", "Tutorial"];

const CATEGORY_COLORS: Record<string, string> = {
  "Technology": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Cybersecurity": "bg-red-500/10 text-red-400 border-red-500/20",
  "AI & ML": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Software Dev": "bg-green-500/10 text-green-400 border-green-500/20",
  "Cloud": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Company News": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Tutorial": "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_COLORS[category] ?? "bg-muted/40 text-muted-foreground border-border/40";
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{category}</span>;
}

function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <Link href={`/blogs/${post.slug}`} className={`group block ${featured ? "" : ""}`}>
      <article className={`h-full rounded-2xl border border-border/40 overflow-hidden bg-card/30 hover:bg-card/60 hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 ${featured ? "flex flex-col lg:flex-row" : "flex flex-col"}`}>
        {/* Thumbnail */}
        <div className={`relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 ${featured ? "lg:w-1/2 h-56 lg:h-auto" : "h-48"} shrink-0`}>
          {post.thumbnail_url ? (
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-muted-foreground/20" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <CategoryBadge category={post.category} />
          </div>
        </div>

        {/* Content */}
        <div className={`flex flex-col ${featured ? "p-6 lg:p-8" : "p-5"} flex-1`}>
          <h3 className={`font-bold text-foreground leading-snug group-hover:text-primary transition-colors ${featured ? "text-xl lg:text-2xl" : "text-base"} line-clamp-2`}>
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">{post.excerpt}</p>

          <div className="flex items-center gap-3 mt-auto pt-4 text-xs text-muted-foreground">
            {post.author?.avatar_url ? (
              <Image src={post.author.avatar_url} alt={post.author.full_name} width={24} height={24} className="rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                {post.author?.full_name?.[0] ?? "A"}
              </div>
            )}
            <span>{post.author?.full_name ?? "ABWcurious Team"}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.reading_time ?? 5} min</span>
            {post.published_at && (
              <>
                <span>·</span>
                <span>{new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </>
            )}
          </div>

          {featured && (
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 text-sm text-primary font-medium group-hover:gap-2.5 transition-all">
                Read article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 9;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        status: "published",
      });
      if (activeCategory !== "All") params.set("category", activeCategory);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/blogs?${params}`);
      const data = await res.json();
      setPosts(data.blogs ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, debouncedSearch]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setPage(1); }, [activeCategory, debouncedSearch]);

  const featuredPosts = posts.slice(0, 2);
  const gridPosts = posts.slice(2);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-32 pb-16 px-4 sm:px-6 bg-gradient-to-b from-muted/20 to-transparent">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-6">
                <TrendingUp className="w-3.5 h-3.5" />Insights & Articles
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-sora)" }}>
                The ABWcurious <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Blog</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Expert articles on cybersecurity, AI, software development, cloud, and emerging technology trends.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-11 pr-5 py-3 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </motion.div>

            {/* Write CTA */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4">
              <Link href="/blogs/write" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                <PenLine className="w-3.5 h-3.5" /> Write your own article
              </Link>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-muted/30 text-muted-foreground border-border/40 hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No articles found.</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Try a different search or category.</p>
            </div>
          ) : (
            <>
              {/* Featured posts */}
              {featuredPosts.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {featuredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} featured />
                  ))}
                </div>
              )}

              {/* Grid posts */}
              {gridPosts.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {gridPosts.map((post) => (
                    <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                      <BlogCard post={post} />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <AIChatbot />
    </>
  );
}
