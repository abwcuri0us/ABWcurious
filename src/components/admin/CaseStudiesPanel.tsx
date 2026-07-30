"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Trash2, Edit } from "lucide-react";

export default function CaseStudiesPanel() {
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", excerpt: "", content: "", coverImage: "", isPublished: true });

  const fetchCaseStudies = async () => {
    try {
      const res = await fetch("/api/case-studies");
      const data = await res.json();
      if (res.ok) setCaseStudies(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/case-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Case study created successfully!");
        setFormData({ title: "", excerpt: "", content: "", coverImage: "", isPublished: true });
        setIsCreating(false);
        fetchCaseStudies();
      } else {
        toast.error("Failed to create case study.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this case study?")) return;
    try {
      const res = await fetch(`/api/case-studies?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully.");
        fetchCaseStudies();
      } else {
        toast.error("Failed to delete.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Case Studies</h2>
        <p className="text-muted-foreground">Manage client success stories</p>
      </div>

      {isCreating ? (
        <div className="p-6 rounded-2xl border border-border bg-card mb-8">
          <h3 className="text-xl font-bold mb-4">Add New Case Study</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <Textarea placeholder="Short Excerpt" required value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} />
            <Input placeholder="Cover Image URL" value={formData.coverImage} onChange={e => setFormData({ ...formData, coverImage: e.target.value })} />
            <Textarea placeholder="Full Content" rows={6} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
            <div className="flex gap-2">
              <Button type="submit">Save Case Study</Button>
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-6">
          <Button onClick={() => setIsCreating(true)}><Plus className="mr-2 size-4" /> Add Case Study</Button>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading case studies...</p>
        ) : caseStudies.length === 0 ? (
          <p className="text-muted-foreground">No case studies found.</p>
        ) : (
          caseStudies.map((cs) => (
            <div key={cs.id} className="p-5 rounded-2xl border border-border bg-card relative">
              <h4 className="font-bold text-lg mb-2">{cs.title}</h4>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{cs.description}</p>
              {cs.results && <p className="text-sm text-green-400 font-medium mb-4">{cs.results}</p>}
              <Button variant="destructive" size="sm" onClick={() => handleDelete(cs.id)} className="absolute top-4 right-4">
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
