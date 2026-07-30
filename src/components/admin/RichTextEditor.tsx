"use client";

import React, { useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Youtube,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Quote,
  Code,
  Minus,
  Link2,
  Palette,
  Eraser,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  ChevronDown,
  Highlighter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  coverImage?: string;
  onCoverImageChange?: (url: string) => void;
  token?: string;
  placeholder?: string;
  minHeight?: string;
}

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function countImagesInHtml(html: string): number {
  const matches = html.match(/<img\s/gi);
  return matches ? matches.length : 0;
}

const PRESET_COLORS = [
  { label: "Default", value: "" },
  { label: "Black", value: "#000000" },
  { label: "Dark Gray", value: "#4B5563" },
  { label: "Gray", value: "#9CA3AF" },
  { label: "Red", value: "#EF4444" },
  { label: "Orange", value: "#F97316" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Yellow", value: "#EAB308" },
  { label: "Green", value: "#22C55E" },
  { label: "Teal", value: "#14B8A6" },
  { label: "Cyan", value: "#06B6D4" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Indigo", value: "#6366F1" },
  { label: "Purple", value: "#A855F7" },
  { label: "Pink", value: "#EC4899" },
  { label: "Rose", value: "#F43F5E" },
];

function ToolbarButton({
  onClick,
  title,
  disabled,
  active,
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 shrink-0 ${active ? "bg-accent text-accent-foreground" : ""}`}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {title}
      </TooltipContent>
    </Tooltip>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-border mx-1 shrink-0" />;
}

export default function RichTextEditor({
  value,
  onChange,
  coverImage = "",
  onCoverImageChange,
  token,
  placeholder = "Start writing...",
  minHeight = "300px",
}: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [youtubeDialog, setYoutubeDialog] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [linkDialog, setLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyleKit,
      Superscript,
      Subscript,
    ],
    content: value,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rich-text-editor prose prose-sm dark:prose-invert max-w-none focus:outline-none",
      },
    },
  });

  // Sync external value changes into the editor (only when not focused)
  const syncingRef = React.useRef(false);
  React.useEffect(() => {
    if (!editor || syncingRef.current) return;
    if (editor.isFocused) return; // don't overwrite while user is typing
    const currentHTML = editor.getHTML();
    if (value !== currentHTML) {
      syncingRef.current = true;
      editor.commands.setContent(value || "", { emitUpdate: false });
      syncingRef.current = false;
    }
  }, [value, editor]);

  const imageCount = editor ? countImagesInHtml(editor.getHTML()) : countImagesInHtml(value);

  const uploadFile = async (
    file: File,
    type: "content-image" | "content-cover"
  ): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.url || data.filePath || null;
    } catch {
      return null;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      e.target.value = "";
      return;
    }

    if (imageCount >= 2) {
      alert("Maximum 2 images allowed per post");
      e.target.value = "";
      return;
    }

    setUploadingImage(true);
    const url = await uploadFile(file, "content-image");
    setUploadingImage(false);

    if (url && editor) {
      editor.chain().focus().setImage({ src: url, alt: "Content image" }).run();
    }

    e.target.value = "";
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Cover image must be less than 2MB");
      e.target.value = "";
      return;
    }

    setUploadingCover(true);
    const url = await uploadFile(file, "content-cover");
    setUploadingCover(false);

    if (url) {
      onCoverImageChange?.(url);
    }

    e.target.value = "";
  };

  const removeCoverImage = () => {
    onCoverImageChange?.("");
  };

  const insertYouTube = useCallback(() => {
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (videoId && editor) {
      const html = `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute;top:0;left:0;width:100%;height:100%" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      editor.chain().focus().insertContent(html).run();
    }
    setYoutubeDialog(false);
    setYoutubeUrl("");
  }, [youtubeUrl, editor]);

  const insertLink = useCallback(() => {
    if (!linkUrl || !editor) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;

    if (linkText) {
      // Insert a link with custom text
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: linkText,
          marks: [{ type: "link", attrs: { href: url, target: "_blank" } }],
        })
        .run();
    } else {
      // Apply link to selected text
      editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
    }

    setLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
  }, [linkUrl, linkText, editor]);

  const applyTextColor = (color: string) => {
    if (!editor) return;
    if (color === "") {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
  };

  if (!editor) {
    return (
      <div className="space-y-3">
        <div className="min-h-[300px] rounded-xl border border-border flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-3">
        {/* Cover Image Section */}
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Cover Image</Label>
          <div className="flex items-center gap-3">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              disabled={uploadingCover}
              onClick={() => coverInputRef.current?.click()}
            >
              {uploadingCover ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              Upload Cover
            </Button>
            {coverImage && (
              <div className="relative group">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="h-12 w-20 object-cover rounded border border-border"
                />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div>
          {/* Toolbar */}
          <div className="border border-border border-b-0 rounded-t-xl bg-secondary/30 p-1.5 flex flex-wrap items-center gap-0.5">
            {/* Heading Dropdown */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 px-2 text-xs font-medium shrink-0"
                    >
                      <Type className="w-3.5 h-3.5" />
                      Heading
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Text style
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().setParagraph().run()}
                >
                  <Type className="w-4 h-4 mr-2" />
                  <span>Paragraph</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                  <Heading1 className="w-4 h-4 mr-2" />
                  <span>Heading 1</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  <Heading2 className="w-4 h-4 mr-2" />
                  <span>Heading 2</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                  <Heading3 className="w-4 h-4 mr-2" />
                  <span>Heading 3</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ToolbarDivider />

            {/* Text Formatting Group */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold (Ctrl+B)"
              active={editor.isActive("bold")}
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic (Ctrl+I)"
              active={editor.isActive("italic")}
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline (Ctrl+U)"
              active={editor.isActive("underline")}
            >
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
              active={editor.isActive("strike")}
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              title="Subscript"
              active={editor.isActive("subscript")}
            >
              <SubscriptIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              title="Superscript"
              active={editor.isActive("superscript")}
            >
              <SuperscriptIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              title="Highlight"
              active={editor.isActive("highlight")}
            >
              <Highlighter className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Text Color Picker */}
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                    >
                      <Palette className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Text color
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="grid grid-cols-4 gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.label}
                      type="button"
                      title={color.label}
                      onClick={() => applyTextColor(color.value)}
                      className="h-7 w-7 rounded border border-border hover:scale-110 transition-transform flex items-center justify-center"
                      style={{
                        backgroundColor: color.value || "transparent",
                      }}
                    >
                      {color.value === "" && (
                        <Eraser className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Remove Formatting */}
            <ToolbarButton
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
              title="Remove formatting"
            >
              <Eraser className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Block Elements Group */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Blockquote"
              active={editor.isActive("blockquote")}
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Code block"
              active={editor.isActive("codeBlock")}
            >
              <Code className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet List"
              active={editor.isActive("bulletList")}
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered List"
              active={editor.isActive("orderedList")}
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            >
              <Minus className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Alignment Group */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              title="Align Left"
              active={editor.isActive({ textAlign: "left" })}
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              title="Align Center"
              active={editor.isActive({ textAlign: "center" })}
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              title="Align Right"
              active={editor.isActive({ textAlign: "right" })}
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Link */}
            <ToolbarButton
              onClick={() => {
                // Pre-fill with existing link if cursor is on one
                const existingLink = editor.getAttributes("link").href;
                if (existingLink) {
                  setLinkUrl(existingLink);
                } else {
                  setLinkUrl("");
                }
                setLinkText("");
                setLinkDialog(true);
              }}
              title="Insert Link"
              active={editor.isActive("link")}
            >
              <Link2 className="w-4 h-4" />
            </ToolbarButton>

            {/* Unlink */}
            {editor.isActive("link") && (
              <ToolbarButton
                onClick={() => editor.chain().focus().unsetLink().run()}
                title="Remove Link"
              >
                <X className="w-4 h-4" />
              </ToolbarButton>
            )}

            {/* Insert YouTube */}
            <ToolbarButton
              onClick={() => setYoutubeDialog(true)}
              title="Insert YouTube Video"
            >
              <Youtube className="w-4 h-4" />
            </ToolbarButton>

            {/* Upload Content Image */}
            <div className="relative flex items-center gap-1 shrink-0">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={uploadingImage || imageCount >= 2}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Upload Content Image ({imageCount}/2)
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Editor Area */}
          <div
            className="border border-border rounded-b-xl bg-background overflow-hidden"
            style={{ minHeight }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Link Dialog */}
        <Dialog open={linkDialog} onOpenChange={setLinkDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
              <DialogDescription className="sr-only">
                Enter a URL and optional display text to insert a hyperlink.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Display Text (optional)</Label>
                <Input
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link text (leave empty to use selected text)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") insertLink();
                  }}
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") insertLink();
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLinkDialog(false)}>
                Cancel
              </Button>
              <Button onClick={insertLink} disabled={!linkUrl}>
                Insert Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* YouTube URL Dialog */}
        <Dialog open={youtubeDialog} onOpenChange={setYoutubeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert YouTube Video</DialogTitle>
              <DialogDescription className="sr-only">
                Enter a YouTube URL to embed a video in your content.
              </DialogDescription>
            </DialogHeader>
            <div>
              <Label>YouTube URL</Label>
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") insertYouTube();
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setYoutubeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={insertYouTube}>Embed</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <style jsx global>{`
          .tiptap {
            outline: none;
            padding: 1.25rem;
            min-height: 300px;
            line-height: 1.75;
            font-size: 0.9375rem;
            color: var(--foreground);
          }
          .tiptap p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: var(--muted-foreground);
            pointer-events: none;
            height: 0;
          }
          .tiptap h1 {
            font-size: 1.875rem;
            font-weight: 700;
            line-height: 1.3;
            margin: 1rem 0 0.5rem;
          }
          .tiptap h2 {
            font-size: 1.5rem;
            font-weight: 600;
            line-height: 1.35;
            margin: 0.875rem 0 0.5rem;
          }
          .tiptap h3 {
            font-size: 1.25rem;
            font-weight: 600;
            line-height: 1.4;
            margin: 0.75rem 0 0.375rem;
          }
          .tiptap p {
            margin: 0.5rem 0;
          }
          .tiptap blockquote {
            border-left: 3px solid var(--primary);
            padding-left: 1rem;
            margin: 0.75rem 0;
            color: var(--muted-foreground);
            font-style: italic;
          }
          .tiptap pre {
            background-color: var(--secondary);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            padding: 0.875rem 1rem;
            margin: 0.75rem 0;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
            font-size: 0.8125rem;
            line-height: 1.6;
            overflow-x: auto;
            white-space: pre-wrap;
            word-break: break-word;
          }
          .tiptap code {
            background-color: var(--secondary);
            border-radius: 0.25rem;
            padding: 0.125rem 0.375rem;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
            font-size: 0.8125rem;
          }
          .tiptap pre code {
            background: none;
            padding: 0;
            border-radius: 0;
          }
          .tiptap img {
            max-width: 100%;
            border-radius: 8px;
            margin: 8px 0;
          }
          .tiptap a {
            color: var(--primary);
            text-decoration: underline;
            cursor: pointer;
          }
          .tiptap ul,
          .tiptap ol {
            padding-left: 1.5em;
            margin: 0.5rem 0;
          }
          .tiptap li {
            margin: 0.25em 0;
          }
          .tiptap hr {
            border: none;
            border-top: 1px solid var(--border);
            margin: 1rem 0;
          }
          .tiptap iframe {
            max-width: 100%;
          }
          .tiptap mark {
            background-color: #fef08a;
            border-radius: 0.2em;
            padding: 0.1em 0.2em;
          }
          .dark .tiptap mark {
            background-color: #854d0e;
            color: #fef08a;
          }
          .tiptap div[style*="padding-bottom"] {
            margin: 0.75rem 0;
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
}
