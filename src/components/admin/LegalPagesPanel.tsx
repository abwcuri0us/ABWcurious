'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Scale,
  Edit3,
  Save,
  Loader2,
  Clock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeHtml } from '@/lib/sanitize';

interface LegalPage {
  id: string;
  type: string;
  title: string;
  content: string;
  updated_at: string;
  updated_by: string | null;
}

const LEGAL_PAGE_TYPES = [
  { type: 'terms', title: 'Terms & Conditions' },
  { type: 'privacy', title: 'Privacy Policy' },
  { type: 'cookies', title: 'Cookie Policy' },
  { type: 'disclaimer', title: 'Disclaimer' },
  { type: 'refund', title: 'Refund Policy' },
];

interface LegalPagesPanelProps {
  token: string;
}

export default function LegalPagesPanel({ token }: LegalPagesPanelProps) {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/legal', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPages(data.data);
      }
    } catch {
      toast.error('Failed to load legal pages.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const openEditor = (type: string) => {
    const existing = pages.find((p) => p.type === type);
    const template = LEGAL_PAGE_TYPES.find((t) => t.type === type);
    setEditTitle(existing?.title || template?.title || type);
    setEditContent(existing?.content || '');
    setEditingType(type);
    // Set editor content after a tick
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = existing?.content || '';
      }
    }, 100);
  };

  const handleSave = async () => {
    if (!editingType) return;

    const rawContent = editorRef.current?.innerHTML || editContent;
    const htmlContent = sanitizeHtml(rawContent);

    setSaving(true);
    try {
      const res = await fetch('/api/admin/legal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: editingType,
          title: editTitle,
          content: htmlContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Legal page updated.');
        setEditingType(null);
        fetchPages();
      } else {
        toast.error(data.error || 'Failed to save.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const getPageByType = (type: string) => pages.find((p) => p.type === type);

  // Editor view
  if (editingType) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingType(null)}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            ←
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
              Edit: {editTitle}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update legal page content
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Title</label>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-lg h-11 px-3 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Content</label>
            {/* Simple Toolbar */}
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
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('formatBlock', 'h1')} title="Heading 1">
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('formatBlock', 'h2')} title="Heading 2">
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('formatBlock', 'h3')} title="Heading 3">
                <Heading3 className="h-4 w-4" />
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
                <List className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('insertOrderedList')} title="Numbered List">
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-multiline="true"
              aria-label="Legal page content editor"
              className="min-h-[400px] p-4 border border-border rounded-b-xl bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/30 prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(editContent) }}
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setEditingType(null)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
            >
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save</>}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
          Legal Pages
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Edit legal content for your website
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {LEGAL_PAGE_TYPES.map((template) => {
            const existing = getPageByType(template.type);
            return (
              <Card key={template.type} className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{template.title}</p>
                      {existing ? (
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(existing.updated_at).toLocaleDateString()}
                          </span>
                          {existing.updated_by && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {existing.updated_by}
                            </span>
                          )}
                          <Badge variant="outline" className="text-[10px] h-5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                            Saved
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-500">No content yet</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => openEditor(template.type)}
                    className="shrink-0"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
