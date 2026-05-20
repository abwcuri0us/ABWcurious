'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image as ImageIcon,
  Save,
  Trash2,
  Edit3,
  Eye,
  FileText,
  Loader2,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Link as LinkIcon,
  Youtube,
  Palette,
  Type,
  Search,
  Filter,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { sanitizeHtml } from '@/lib/sanitize';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  published: boolean;
  authorId: string;
  categoryId: string | null;
  author: { id: string; name: string | null; email: string };
  category: { id: string; name: string; slug: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogEditorProps {
  token: string;
  userId: string;
}

const BLOG_CATEGORIES = [
  'Cybersecurity',
  'AI & Machine Learning',
  'Web Development',
  'DevSecOps',
  'Cloud Computing',
  'Education',
  'Company News',
  'Technology',
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
const FONT_COLORS = ['#000000', '#333333', '#666666', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];

export default function BlogEditor({ token, userId }: BlogEditorProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(false);
  const [categoryId, setCategoryId] = useState<string>('');
  const [slugManual, setSlugManual] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('');

  // Upload state
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Font size/color picker state
  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontColor, setShowFontColor] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blogs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch {
      toast.error('Failed to fetch blog posts.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const resetForm = useCallback(() => {
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setCoverImage('');
    setPublished(false);
    setCategoryId('');
    setSlugManual(false);
    setEditingPost(null);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManual) {
      setSlug(generateSlug(value));
    }
  };

  const handleNewPost = () => {
    resetForm();
    setView('editor');
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt || '');
    setContent(post.content || '');
    setCoverImage(post.coverImage || '');
    setPublished(post.published);
    setCategoryId(post.category?.id || '');
    if (editorRef.current) {
      editorRef.current.innerHTML = post.content || '';
    }
    setView('editor');
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'blog-image');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setCoverImage(data.url);
        toast.success('Cover image uploaded.');
      } else {
        toast.error(data.error || 'Failed to upload image.');
      }
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'blog-image');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        execCommand('insertImage', data.url);
        toast.success('Image inserted.');
      } else {
        toast.error(data.error || 'Failed to upload image.');
      }
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }
    if (!slug.trim()) {
      toast.error('Slug is required.');
      return;
    }

    const rawContent = editorRef.current?.innerHTML || content;
    const htmlContent = sanitizeHtml(rawContent);
    if (!htmlContent || htmlContent === '<br>') {
      toast.error('Content is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingPost) {
        const res = await fetch('/api/admin/blogs', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: editingPost.id,
            title,
            slug,
            excerpt: excerpt || undefined,
            content: htmlContent,
            cover_image: coverImage || undefined,
            published,
            category_id: categoryId || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Blog post updated successfully.');
          fetchPosts();
          setView('list');
          resetForm();
        } else {
          toast.error(data.error || 'Failed to update blog post.');
        }
      } else {
        const res = await fetch('/api/admin/blogs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            slug,
            excerpt: excerpt || undefined,
            content: htmlContent,
            cover_image: coverImage || undefined,
            published,
            author_id: userId,
            category_id: categoryId || undefined,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Blog post created successfully.');
          fetchPosts();
          setView('list');
          resetForm();
        } else {
          toast.error(data.error || 'Failed to create blog post.');
        }
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const res = await fetch(`/api/admin/blogs?id=${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Blog post deleted.');
        fetchPosts();
      } else {
        toast.error(data.error || 'Failed to delete blog post.');
      }
    } catch {
      toast.error('Network error.');
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertHeading = (tag: string) => {
    execCommand('formatBlock', tag);
  };

  const insertCodeBlock = () => {
    const selection = window.getSelection();
    const text = selection?.toString() || 'code here';
    execCommand('insertHTML', `<pre><code>${text}</code></pre>`);
  };

  const insertLink = () => {
    if (linkUrl.trim()) {
      const selection = window.getSelection();
      const text = selection?.toString() || linkUrl;
      execCommand('insertHTML', `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`);
      setShowLinkDialog(false);
      setLinkUrl('');
    }
  };

  const insertYoutube = () => {
    if (youtubeUrl.trim()) {
      const videoId = youtubeUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/)?.[1];
      if (videoId) {
        execCommand('insertHTML', `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe><br/>`);
        setShowYoutubeDialog(false);
        setYoutubeUrl('');
      } else {
        toast.error('Invalid YouTube URL.');
      }
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'published' ? post.published : !post.published);
    const matchesAuthor = !authorFilter || (post.author?.name || '').toLowerCase().includes(authorFilter.toLowerCase()) || (post.author?.email || '').toLowerCase().includes(authorFilter.toLowerCase());
    return matchesStatus && matchesAuthor;
  });

  // List View
  if (view === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
              Blog & News
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your blog posts and news articles
            </p>
          </div>
          <Button
            onClick={handleNewPost}
            className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] bg-secondary/50 border-border h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              placeholder="Filter by author..."
              className="pl-9 bg-secondary/50 border-border h-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No blog posts yet. Create your first post!</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Author</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Category</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Updated</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-medium max-w-[300px]">
                      <div className="truncate">{post.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{post.slug}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">
                      {post.author?.name || post.author?.email?.split('@')[0] || 'Unknown'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {post.category ? (
                        <Badge variant="outline" className="text-xs">{post.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={post.published ? 'default' : 'secondary'}
                        className={
                          post.published
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPost(post)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          aria-label={`Edit post: ${post.title}`}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          aria-label={`Delete post: ${post.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  }

  // Editor View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setView('list');
            resetForm();
          }}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            {editingPost ? 'Edit Post' : 'New Post'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {editingPost ? 'Update your blog post' : 'Write a new blog post'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Title */}
        <div>
          <Label htmlFor="blog-title" className="text-sm font-medium mb-1.5 block">
            Title
          </Label>
          <Input
            id="blog-title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter blog post title..."
            className="bg-secondary/50 border-border h-11"
          />
        </div>

        {/* Slug + Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="blog-slug" className="text-sm font-medium mb-1.5 block">
              Slug
            </Label>
            <Input
              id="blog-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManual(true);
              }}
              placeholder="post-url-slug"
              className="bg-secondary/50 border-border h-11"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full bg-secondary/50 border-border h-11">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {BLOG_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-')}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <Label htmlFor="blog-excerpt" className="text-sm font-medium mb-1.5 block">
            Excerpt
          </Label>
          <Textarea
            id="blog-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief summary of the post..."
            rows={2}
            className="bg-secondary/50 border-border resize-none"
          />
        </div>

        {/* Cover Image */}
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Cover Image</Label>
          <div className="flex gap-3 items-center">
            <Input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg or upload"
              className="bg-secondary/50 border-border h-11 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="h-11 shrink-0"
            >
              {uploadingCover ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload
            </Button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>
          {coverImage && (
            <div className="mt-2 relative">
              <img src={coverImage} alt="Cover preview" className="h-32 w-auto rounded-lg object-cover border border-border" />
            </div>
          )}
        </div>

        {/* Rich Text Editor */}
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Content</Label>
          {/* Toolbar */}
          <div className="flex items-center gap-0.5 p-2 border border-border border-b-0 rounded-t-xl bg-secondary/30 flex-wrap">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('bold')} title="Bold">
              <Bold className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('italic')} title="Italic">
              <Italic className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('underline')} title="Underline">
              <Underline className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-border mx-1" />
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertHeading('h1')} title="Heading 1">
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertHeading('h2')} title="Heading 2">
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertHeading('h3')} title="Heading 3">
              <Heading3 className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-border mx-1" />
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
              <List className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('insertOrderedList')} title="Numbered List">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px h-5 bg-border mx-1" />
            {/* Font Size */}
            <div className="relative">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowFontSize(!showFontSize); setShowFontColor(false); }} title="Font Size">
                <Type className="h-4 w-4" />
              </Button>
              {showFontSize && (
                <div className="absolute top-full left-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg p-1 min-w-[80px]">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => { execCommand('fontSize', '7'); editorRef.current?.focus(); setShowFontSize(false); }}
                      className="w-full text-left px-2 py-1 text-xs hover:bg-secondary/50 rounded"
                      style={{ fontSize: size }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Font Color */}
            <div className="relative">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setShowFontColor(!showFontColor); setShowFontSize(false); }} title="Font Color">
                <Palette className="h-4 w-4" />
              </Button>
              {showFontColor && (
                <div className="absolute top-full left-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1">
                  {FONT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => { execCommand('foreColor', color); setShowFontColor(false); }}
                      className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="w-px h-5 bg-border mx-1" />
            {/* Link */}
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowLinkDialog(true)} title="Insert Link">
              <LinkIcon className="h-4 w-4" />
            </Button>
            {/* Image Upload */}
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => imageInputRef.current?.click()} title="Upload Image" disabled={uploadingImage}>
              {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            </Button>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleContentImageUpload} />
            {/* YouTube */}
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowYoutubeDialog(true)} title="Embed YouTube">
              <Youtube className="h-4 w-4" />
            </Button>
            {/* Code Block */}
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={insertCodeBlock} title="Code Block">
              <Code className="h-4 w-4" />
            </Button>
          </div>
          {/* Editor Area */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Blog post content editor"
            className="min-h-[300px] p-4 border border-border rounded-b-xl bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/30 prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
          />
        </div>

        {/* Publish Toggle & Save */}
        <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Switch
              id="blog-published"
              checked={published}
              onCheckedChange={setPublished}
            />
            <Label htmlFor="blog-published" className="text-sm font-medium flex items-center gap-2">
              {published ? (
                <><Eye className="h-4 w-4 text-emerald-500" /> Published</>
              ) : (
                <><FileText className="h-4 w-4 text-amber-500" /> Draft</>
              )}
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setView('list');
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> {editingPost ? 'Update Post' : 'Save Post'}</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Insert Link
            </DialogTitle>
          </DialogHeader>
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="bg-secondary/50 border-border h-11"
            onKeyDown={(e) => e.key === 'Enter' && insertLink()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
            <Button onClick={insertLink} className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTube Dialog */}
      <Dialog open={showYoutubeDialog} onOpenChange={setShowYoutubeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              Embed YouTube Video
            </DialogTitle>
          </DialogHeader>
          <Input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="bg-secondary/50 border-border h-11"
            onKeyDown={(e) => e.key === 'Enter' && insertYoutube()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowYoutubeDialog(false)}>Cancel</Button>
            <Button onClick={insertYoutube} className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">Embed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
