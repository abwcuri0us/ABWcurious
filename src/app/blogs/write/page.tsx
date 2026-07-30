"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, X, Eye, EyeOff, Save, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

const BlogEditor = dynamic(() => import("@/components/admin/BlogEditor"), {
  ssr: false,
  loading: () => <div className="h-96 rounded-xl bg-muted/20 animate-pulse" />,
});

const CATEGORIES = ["Technology", "Cybersecurity", "AI & ML", "Software Dev", "Cloud", "Company News", "Tutorial", "Opinion", "Case Study"];

export default function WriteBlogPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Technology");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<"published" | "private" | "draft">("published");
  const [thumbnail, setThumbnail] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const authToken = (user as { access_token?: string } | null)?.access_token;

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-3">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">You need to be logged in to write a blog post.</p>
            <Link href="/blogs" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleThumbnailUpload = async (file: File) => {
    if (!authToken) { toast.error("Authentication required"); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "thumbnail");
    try {
      const res = await fetch("/api/blogs/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setThumbnail(data.url);
      toast.success("Thumbnail uploaded!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handlePublish = async (publishStatus: typeof status) => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!content || content === "<p></p>") { toast.error("Content is required"); return; }
    if (!authToken) { toast.error("Authentication required"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title, content, excerpt: excerpt || undefined,
          category, tags, status: publishStatus,
          thumbnail_url: thumbnail || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to publish");
      toast.success(publishStatus === "published" ? "Article published!" : publishStatus === "private" ? "Saved privately!" : "Saved as draft!");
      router.push(publishStatus === "published" ? `/blogs/${data.blog.slug}` : "/blogs");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/blogs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePublish("draft")}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Draft
              </button>
              <button
                onClick={() => handlePublish(status)}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {status === "private" ? "Save Privately" : "Publish"}
              </button>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title..."
                className="w-full text-3xl sm:text-4xl font-bold text-foreground placeholder:text-muted-foreground/40 bg-transparent outline-none border-none"
                style={{ fontFamily: "var(--font-sora)" }}
              />
            </div>

            {/* Thumbnail */}
            <div>
              {thumbnail ? (
                <div className="relative rounded-2xl overflow-hidden h-56">
                  <Image src={thumbnail} alt="Thumbnail" fill className="object-cover" />
                  <button
                    onClick={() => setThumbnail("")}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-48 rounded-2xl border-2 border-dashed border-border/40 hover:border-primary/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-all group"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-7 h-7 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Add cover image</span>
                      <span className="text-xs text-muted-foreground/60">JPEG, PNG, WebP · Max 5MB</span>
                    </>
                  )}
                </button>
              )}
              <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleThumbnailUpload(f); e.target.value = ""; }} />
            </div>

            {/* Editor */}
            <BlogEditor
              content={content}
              onChange={setContent}
              authToken={authToken}
              placeholder="Share your knowledge, experience, or insights..."
            />

            {/* Sidebar settings */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/40">
              {/* Excerpt */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Excerpt (optional)</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A short summary of your article (auto-generated if empty)..."
                  rows={2}
                  maxLength={400}
                  className="w-full px-4 py-3 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border/60 bg-background text-sm text-foreground outline-none focus:border-primary/40"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Visibility</label>
                <div className="flex gap-2">
                  {[
                    { value: "published", label: "Public", icon: Eye },
                    { value: "private", label: "Private", icon: EyeOff },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatus(value as typeof status)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        status === value
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 border border-border/40 text-xs text-muted-foreground">
                      #{tag}
                      <button onClick={() => setTags(tags.filter(t => t !== tag))}><X className="w-3 h-3 hover:text-foreground" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Add a tag... (press Enter)"
                    className="flex-1 px-4 py-2 rounded-xl border border-border/60 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40"
                  />
                  <button onClick={addTag} className="px-4 py-2 rounded-xl bg-muted/40 text-sm text-foreground hover:bg-muted/60 transition-all">Add</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
