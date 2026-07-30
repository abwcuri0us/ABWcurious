"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Tag, Share2, BookOpen, Eye, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import dynamic from "next/dynamic";

const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false, loading: () => null });

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail_url?: string;
  category: string;
  tags: string[];
  reading_time: number;
  view_count: number;
  published_at: string;
  author?: { full_name: string; avatar_url?: string; bio?: string };
}

type Props = { params: Promise<{ slug: string }> };

export default function BlogPostPage({ params }: Props) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/blogs/${slug}`)
      .then((res) => {
        if (!res.ok) { setNotFound(true); return null; }
        return res.json();
      })
      .then((data) => {
        if (data?.blog) setPost(data.blog);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="max-w-3xl mx-auto px-4 pt-32 pb-24 animate-pulse">
            <div className="h-4 w-24 bg-muted/40 rounded mb-8" />
            <div className="h-10 bg-muted/40 rounded-xl mb-4 w-full" />
            <div className="h-6 bg-muted/30 rounded-xl mb-8 w-3/4" />
            <div className="h-64 bg-muted/30 rounded-2xl mb-8" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted/30 rounded mb-3 w-full last:w-2/3" />
            ))}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center px-4">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-3">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">This article doesn&apos;t exist or has been removed.</p>
            <Link href="/blogs" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 pb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Breadcrumb */}
            <Link href="/blogs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> All Articles
            </Link>

            {/* Category + Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" /> {post.reading_time ?? 5} min read
              </span>
              {post.view_count > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" /> {post.view_count.toLocaleString()} views
                </span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-5" style={{ fontFamily: "var(--font-sora)" }}>
              {post.title}
            </h1>

            {/* Author */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-border/40">
              <div className="flex items-center gap-3">
                {post.author?.avatar_url ? (
                  <Image src={post.author.avatar_url} alt={post.author.full_name} width={40} height={40} className="rounded-full ring-2 ring-border/40" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                    {(post.author?.full_name ?? "A")[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{post.author?.full_name ?? "ABWcurious Team"}</p>
                  {post.author?.bio && <p className="text-xs text-muted-foreground line-clamp-1">{post.author.bio}</p>}
                </div>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/40"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            {/* Thumbnail */}
            {post.thumbnail_url && (
              <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden mb-10 bg-muted/20">
                <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" priority />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-code:text-cyan-400 prose-code:bg-muted/40 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-strong:text-foreground prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border/40">
                {post.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs text-muted-foreground bg-muted/40 border border-border/40">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer nav */}
            <div className="flex items-center justify-between mt-8">
              <button onClick={handleShare} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="w-4 h-4" /> Share article
              </button>
              <Link href="/blogs" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
                More articles <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          </motion.div>
        </article>
      </main>
      <Footer />
      <AIChatbot />
    </>
  );
}
