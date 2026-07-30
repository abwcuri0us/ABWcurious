"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useCallback, useRef } from "react";
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Quote, Heading1, Heading2, Heading3, Image as ImageIcon,
  Link as LinkIcon, Undo, Redo,
  Minus, Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BlogEditorProps {
  content?: string;
  onChange: (html: string) => void;
  authToken?: string;
  disabled?: boolean;
  placeholder?: string;
}

function ToolbarButton({ onClick, active, disabled, children, title }: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded text-xs transition-all ${
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default function BlogEditor({ content = "", onChange, authToken, disabled, placeholder }: BlogEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: "rounded-xl max-w-full mx-auto my-4" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-400 underline" },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Start writing your article...",
      }),
      CharacterCount.configure({ limit: 50000 }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    if (!authToken) {
      toast.error("Login required to upload images");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "content");

    const toastId = toast.loading("Uploading image...");
    try {
      const res = await fetch("/api/blogs/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      editor?.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      toast.success("Image uploaded!", { id: toastId });
    } catch (err) {
      toast.error((err as Error).message, { id: toastId });
    }
  }, [editor, authToken]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  };

  const setLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url === null) return;
    if (url === "") { editor?.chain().focus().unsetLink().run(); return; }
    editor?.chain().focus().setLink({ href: url, target: "_blank" }).run();
  }, [editor]);

  if (!editor) return null;

  const iconSize = "w-3.5 h-3.5";

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border/40 bg-muted/20">
        {/* History */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo className={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo className={iconSize} /></ToolbarButton>
        <div className="w-px h-5 bg-border/60 mx-1" />

        {/* Headings */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="H1"><Heading1 className={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2"><Heading2 className={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3"><Heading3 className={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} title="Paragraph"><Type className={iconSize} /></ToolbarButton>
        <div className="w-px h-5 bg-border/60 mx-1" />

        {/* Marks */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold className={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic className={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><Strikethrough className={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code"><Code className={iconSize} /></ToolbarButton>
        <div className="w-px h-5 bg-border/60 mx-1" />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List"><List className={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List"><ListOrdered className={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote"><Quote className={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus className={iconSize} /></ToolbarButton>
        <div className="w-px h-5 bg-border/60 mx-1" />

        {/* Link & Image */}
        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Insert Link"><LinkIcon className={iconSize} /></ToolbarButton>
        <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Insert Image"><ImageIcon className={iconSize} /></ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        {/* Word/char count */}
        <div className="ml-auto text-xs text-muted-foreground/60 tabular-nums pr-1">
          {editor.storage.characterCount.words()} words
        </div>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="min-h-[400px] p-5 prose prose-neutral dark:prose-invert max-w-none text-sm focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[380px] [&_.ProseMirror_p.is-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-empty:first-child::before]:text-muted-foreground/40 [&_.ProseMirror_p.is-empty:first-child::before]:float-left [&_.ProseMirror_p.is-empty:first-child::before]:pointer-events-none"
      />
    </div>
  );
}
