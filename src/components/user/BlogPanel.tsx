'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  ImageIcon,
  Loader2,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Code,
  Palette,
  Type,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeHtml } from '@/lib/sanitize';

const BLOG_CATEGORIES = [
  'Science & Technology',
  'Nature',
  'Cybersecurity',
  'AI & ML',
  'Education',
  'Business',
  'Other',
];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  published: boolean;
  author_id: string;
  category_id: string | null;
  category?: { id: string; name: string; slug: string } | null;
  created_at: string;
  updated_at: string;
}

interface BlogPanelProps {
  token: string;
  userId: string;
  userRole: string;
}

export default function BlogPanel({ token, userId, userRole }: BlogPanelProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  // Editor form state
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formPublished, setFormPublished] = useState(false);
  const [formCategory, setFormCategory] = useState('');

  // Color picker state
  const [showColorPicker, setShowColorPicker] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/user/blogs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.data || []);
      }
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const resetForm = () => {
    setFormTitle('');
    setFormSlug('');
    setFormExcerpt('');
    setFormContent('');
    setFormCoverImage('');
    setFormPublished(false);
    setFormCategory('');
    setEditingPost(null);
  };

  const openCreateEditor = () => {
    resetForm();
    setView('editor');
  };

  const openEditEditor = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormExcerpt(post.excerpt || '');
    setFormContent(post.content || '');
    setFormCoverImage(post.cover_image || '');
    setFormPublished(post.published);
    setFormCategory(post.category?.name || '');
    setView('editor');
  };

  const handleTitleChange = (value: string) => {
    setFormTitle(value);
    if (!editingPost) {
      setFormSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 200)
      );
    }
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formContent.trim() || formContent.trim().length < 10) {
      toast.error('Content must be at least 10 characters');
      return;
    }

    setSaving(true);
    try {
      if (editingPost) {
        const res = await fetch('/api/user/blogs', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: editingPost.id,
            title: formTitle,
            slug: formSlug || undefined,
            excerpt: formExcerpt || undefined,
            content: formContent,
            coverImage: formCoverImage || undefined,
            published: formPublished,
            categoryId: formCategory || undefined,
          }),
        });
        if (res.ok) {
          toast.success('Blog post updated!');
        } else {
          const data = await res.json();
          toast.error(data.error || 'Failed to update post');
        }
      } else {
        const res = await fetch('/api/user/blogs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: formTitle,
            slug: formSlug || undefined,
            excerpt: formExcerpt || undefined,
            content: formContent,
            coverImage: formCoverImage || undefined,
            published: formPublished,
            categoryId: formCategory || undefined,
          }),
        });
        if (res.ok) {
          toast.success('Blog post created!');
        } else {
          const data = await res.json();
          toast.error(data.error || 'Failed to create post');
        }
      }
      setView('list');
      resetForm();
      fetchPosts();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/user/blogs?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Blog post deleted');
        fetchPosts();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete post');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Rich text editor helpers
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertHeading = (level: number) => {
    const tag = `H${level}`;
    execCommand('formatBlock', tag);
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertCodeBlock = () => {
    const code = window.prompt('Enter code:');
    if (code) {
      execCommand('insertHTML', `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
    }
  };

  const insertVideo = () => {
    const url = window.prompt('Enter YouTube video URL:');
    if (url) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (match) {
        const embedUrl = `https://www.youtube.com/embed/${match[1]}`;
        execCommand('insertHTML', `<iframe src="${embedUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe><br/>`);
      } else {
        toast.error('Invalid YouTube URL');
      }
    }
  };

  const insertFontSize = (size: string) => {
    execCommand('fontSize', size);
  };

  const insertFontColor = (color: string) => {
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const basicColors = [
    '#000000', '#333333', '#666666', '#999999',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
  ];

  if (view === 'editor') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setView('list'); resetForm(); }} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
            {editingPost ? 'Edit Post' : 'New Blog Post'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <Label htmlFor="blog-title">Title</Label>
              <Input
                id="blog-title"
                value={formTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter blog post title..."
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="blog-slug">Slug</Label>
                <Input
                  id="blog-slug"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="auto-generated-from-title"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="blog-category">Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOG_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Content</Label>
              {/* Toolbar */}
              <div className="flex items-center flex-wrap gap-1 mt-1.5 mb-1 p-1.5 border border-border rounded-t-lg bg-card/50">
                {/* Text Formatting */}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('bold')} title="Bold (Ctrl+B)">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('italic')} title="Italic (Ctrl+I)">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('underline')} title="Underline (Ctrl+U)">
                  <Underline className="h-4 w-4" />
                </Button>

                <div className="w-px h-5 bg-border mx-1" />

                {/* Headings */}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertHeading(1)} title="Heading 1">
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertHeading(2)} title="Heading 2">
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertHeading(3)} title="Heading 3">
                  <Heading3 className="h-4 w-4" />
                </Button>

                <div className="w-px h-5 bg-border mx-1" />

                {/* Lists */}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('insertOrderedList')} title="Numbered List">
                  <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="w-px h-5 bg-border mx-1" />

                {/* Font Size */}
                <Select onValueChange={insertFontSize}>
                  <SelectTrigger className="h-8 w-20 text-xs">
                    <Type className="h-3.5 w-3.5 mr-1" />
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Small</SelectItem>
                    <SelectItem value="3">Normal</SelectItem>
                    <SelectItem value="5">Large</SelectItem>
                    <SelectItem value="7">Huge</SelectItem>
                  </SelectContent>
                </Select>

                {/* Font Color */}
                <div className="relative">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowColorPicker(!showColorPicker)} title="Font Color">
                    <Palette className="h-4 w-4" />
                  </Button>
                  {showColorPicker && (
                    <div className="absolute top-full left-0 z-50 mt-1 p-2 bg-card border border-border rounded-lg shadow-xl">
                      <div className="grid grid-cols-6 gap-1">
                        {basicColors.map((color) => (
                          <button
                            key={color}
                            className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => insertFontColor(color)}
                            title={color}
                            type="button"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-px h-5 bg-border mx-1" />

                {/* Link */}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={insertLink} title="Insert Hyperlink">
                  <LinkIcon className="h-4 w-4" />
                </Button>

                {/* Image */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const url = window.prompt('Enter image URL:');
                    if (url) execCommand('insertImage', url);
                  }}
                  title="Insert Image"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>

                {/* Video */}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={insertVideo} title="Insert YouTube Video">
                  <Video className="h-4 w-4" />
                </Button>

                {/* Code Block */}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={insertCodeBlock} title="Insert Code Block">
                  <Code className="h-4 w-4" />
                </Button>
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                aria-multiline="true"
                aria-label="Blog post content editor"
                className="min-h-[300px] p-4 border border-border border-t-0 rounded-b-lg bg-card/30 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                onInput={(e) => setFormContent(sanitizeHtml(e.currentTarget.innerHTML))}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(formContent) }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="published-toggle" className="text-sm font-medium">
                    Publish
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={formPublished ? 'default' : 'secondary'} className="text-xs">
                      {formPublished ? 'Published' : 'Draft'}
                    </Badge>
                    <Switch
                      id="published-toggle"
                      checked={formPublished}
                      onCheckedChange={setFormPublished}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="blog-excerpt">Excerpt</Label>
                  <Textarea
                    id="blog-excerpt"
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    placeholder="Brief summary of your post..."
                    className="mt-1.5"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="blog-cover">Cover Image URL</Label>
                  <Input
                    id="blog-cover"
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="mt-1.5"
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingPost ? 'Update Post' : 'Create Post'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
          My Blog Posts
        </h2>
        <Button onClick={openCreateEditor} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          New Post
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-1">No blog posts yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Start writing your first blog post!</p>
            <Button onClick={openCreateEditor} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Create Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground truncate">{post.title}</h3>
                      <Badge variant={post.published ? 'default' : 'secondary'} className="text-xs shrink-0">
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                      {post.category && (
                        <Badge variant="outline" className="text-xs shrink-0">{post.category.name}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {post.excerpt || 'No excerpt'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Updated {new Date(post.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditEditor(post)} aria-label={`Edit post: ${post.title}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(post)} aria-label={`Delete post: ${post.title}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
