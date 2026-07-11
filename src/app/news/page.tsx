'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Clock, Tag, AlertTriangle, Building2,
  Shield, Newspaper, Search, Plus, X, Calendar,
  RefreshCw, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatDate, timeAgo } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

/* ─── Types ────────────────────────────────────── */
interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  isPublished: boolean;
  publishedAt: string | null;
  created_at: string;
  updated_at: string;
  authorId: string | null;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

/* ─── Constants ────────────────────────────────── */
const newsCategories = ['All', 'Company', 'Industry', 'Security Alert'] as const;

const categoryConfig: Record<string, { color: string; icon: React.ElementType }> = {
  'Company': { color: 'bg-primary/10 text-primary', icon: Building2 },
  'Industry': { color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: Newspaper },
  'Security Alert': { color: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: AlertTriangle },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ─── Helpers ──────────────────────────────────── */

function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('abwcurious_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ─── Component ────────────────────────────────── */
export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddNews, setShowAddNews] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form
  const [formTitle, setFormTitle] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formCategory, setFormCategory] = useState('Company');
  const [formPublished, setFormPublished] = useState(true);

  const isAdmin = authUser?.role === 'admin' || authUser?.role === 'editor';

  /* ─── Fetch News ─── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('limit', '50');
        if (activeCategory !== 'All') params.set('category', activeCategory);
        if (searchQuery.trim()) params.set('search', searchQuery.trim());

        const res = await fetch(`/api/news?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch news');
        const json = await res.json();
        if (!cancelled) setNews(json.data || []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeCategory, searchQuery, retryKey]);

  // Initialize auth user from localStorage (client-only)
  useEffect(() => {
    setAuthUser(getAuthUser());
  }, []);

  /* ─── Submit News ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('abwcurious_token') : null;
      const user = getAuthUser();
      if (!token || !user) { setFormError('Authentication required.'); return; }

      const res = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Email': user.email,
        },
        body: JSON.stringify({
          title: formTitle,
          excerpt: formExcerpt,
          content: formContent,
          coverImage: formCoverImage || undefined,
          category: formCategory,
          isPublished: formPublished,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error || 'Failed'); return; }

      setFormTitle(''); setFormExcerpt(''); setFormContent('');
      setFormCoverImage(''); setFormCategory('Company'); setFormPublished(true);
      setShowAddNews(false);
      setRetryKey((k) => k + 1);
    } catch { setFormError('Network error.'); } finally { setSubmitting(false); }
  };

  const featuredArticle = news[0] || null;
  const otherArticles = featuredArticle ? news.slice(1) : news;

  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <a href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </a>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="ABWcurious Logo" width={40} height={40} className="h-10 w-10 object-contain" unoptimized />
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <span className="text-gradient-cyan">ABW</span>
              <span className="text-foreground">curious</span>
            </span>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowAddNews(true)} className="btn-glow bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" /> Add News
            </Button>
          )}
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            News & <span className="text-gradient-cyan">Updates</span>
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl">
            Stay informed with the latest company announcements, industry developments, and security alerts from ABWcurious.
          </p>
        </motion.div>

        {/* Search & Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <Input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {newsCategories.map((cat) => {
              const config = categoryConfig[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'glass-card text-foreground/70 hover:text-foreground hover:bg-primary/10'
                  }`}
                >
                  {config?.icon && <config.icon className="w-3.5 h-3.5" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="space-y-6 mb-20">
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-6 flex flex-col gap-3">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="glass-card p-10 text-center mb-12">
            <X className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-foreground/70 font-medium mb-2">Failed to load news</p>
            <p className="text-foreground/50 text-sm mb-4">{error}</p>
            <Button variant="outline" onClick={() => setRetryKey((k) => k + 1)} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && news.length === 0 && (
          <div className="glass-card p-10 text-center mb-12">
            <Newspaper className="w-10 h-10 text-foreground/30 mx-auto mb-3" />
            <p className="text-foreground/70 font-medium mb-2">No news articles yet</p>
            <p className="text-foreground/50 text-sm">Check back soon for the latest updates and announcements.</p>
          </div>
        )}

        {/* Featured Article */}
        {!loading && !error && featuredArticle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <button
              onClick={() => setExpandedId(expandedId === featuredArticle.id ? null : featuredArticle.id)}
              className="block w-full text-left group"
            >
              <div className="glass-card p-6 sm:p-8 hover:glow-cyan transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-primary to-primary/30" />
                {featuredArticle.coverImage && (
                  <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden mb-4">
                    <Image src={featuredArticle.coverImage} alt={featuredArticle.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  {(() => {
                    const cfg = categoryConfig[featuredArticle.category];
                    if (!cfg) return null;
                    const Ic = cfg.icon;
                    return (
                      <Badge className={`${cfg.color} border-0 text-xs`}>
                        <Ic className="w-3 h-3 mr-1" />
                        {featuredArticle.category}
                      </Badge>
                    );
                  })()}
                  <Badge variant="outline" className="text-xs border-foreground/20 text-foreground/50">
                    Featured
                  </Badge>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors"
                  style={{ fontFamily: 'var(--font-space-grotesk)' }}
                >
                  {featuredArticle.title}
                </h2>
                <p className="text-foreground/70 mb-4 max-w-3xl">{featuredArticle.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-foreground/50">
                  <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {timeAgo(featuredArticle.publishedAt || featuredArticle.created_at)}</span>
                  {expandedId === featuredArticle.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </button>
            <AnimatePresence>
              {expandedId === featuredArticle.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card p-6 sm:p-8 mt-2 overflow-hidden"
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/80 leading-relaxed">
                    {featuredArticle.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* News Grid */}
        {!loading && !error && otherArticles.length > 0 && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <h2
              className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-space-grotesk)' }}
            >
              <Newspaper className="w-6 h-6 text-primary" /> Latest News
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
              {otherArticles.map((article) => (
                <motion.div key={article.id} variants={itemVariants}>
                  <button
                    onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                    className="block w-full text-left group h-full"
                  >
                    <div className="glass-card p-5 sm:p-6 hover:glow-cyan transition-all duration-300 flex flex-col h-full">
                      {article.coverImage && (
                        <div className="relative w-full h-36 rounded-lg overflow-hidden mb-3">
                          <Image src={article.coverImage} alt={article.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        {categoryConfig[article.category] && (
                          <Badge className={`${categoryConfig[article.category].color} border-0 text-xs`}>
                            {article.category}
                          </Badge>
                        )}
                      </div>
                      <h3
                        className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2"
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}
                      >
                        {article.title}
                      </h3>
                      <p className="text-sm text-foreground/60 mb-4 line-clamp-3 flex-1">{article.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-foreground/50">
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(article.publishedAt || article.created_at)}</span>
                        {expandedId === article.id ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />}
                      </div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedId === article.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-card p-6 mt-2 overflow-hidden"
                      >
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground/80 leading-relaxed">
                          {article.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        <div className="mt-12 text-center">
          <a href="/" className="text-primary hover:underline text-sm">Return to ABWcurious.com</a>
        </div>
      </div>

      {/* ─── Add News Dialog (Admin Only) ─── */}
      {isAdmin && showAddNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddNews(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass-card p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10"
          >
            <button onClick={() => setShowAddNews(false)} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
              <Plus className="w-5 h-5 text-primary" /> Add News Article
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Title *</label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="News headline" required className="bg-background/50" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Excerpt</label>
                <Input value={formExcerpt} onChange={(e) => setFormExcerpt(e.target.value)} placeholder="Brief summary" className="bg-background/50" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Content *</label>
                <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} placeholder="Full article content..." rows={6} required className="w-full min-h-24 rounded-md border border-input bg-background/50 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Cover Image URL</label>
                  <Input value={formCoverImage} onChange={(e) => setFormCoverImage(e.target.value)} placeholder="https://..." type="url" className="bg-background/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background/50 px-3 text-sm">
                    <option value="Company">Company</option>
                    <option value="Industry">Industry</option>
                    <option value="Security Alert">Security Alert</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="news-publish" checked={formPublished} onChange={(e) => setFormPublished(e.target.checked)} className="rounded border-input" />
                <label htmlFor="news-publish" className="text-sm text-foreground/70">Publish immediately</label>
              </div>
              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddNews(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="btn-glow bg-primary text-primary-foreground gap-2">
                  {submitting ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</> : <><ExternalLink className="w-4 h-4" /> Publish</>}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
