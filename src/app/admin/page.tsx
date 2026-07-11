"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Shield, FileText, ArrowLeft, Plus, Pencil, Trash2,
  Search, Menu, LogOut, Newspaper, Calendar, Briefcase, Mail, AlertTriangle,
  CheckCircle2, Loader2, Globe, MapPin, Clock, Building, Zap, Star,
  MessageSquare, Lightbulb, ShoppingBag, Handshake, GraduationCap, FlaskConical,
  Wrench, Activity, BarChart3, ChevronLeft, ChevronRight, X, Send,
  Eye, ToggleLeft, Server, Cpu, HardDrive, Wifi, TrendingUp, TrendingDown,
  ExternalLink, Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import RichTextEditor from "@/components/admin/RichTextEditor";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserInfo { name: string; email: string; avatar?: string; }
interface UserRecord { id: string; email: string; name: string | null; role: string; isActive: boolean; phone?: string | null; avatar?: string | null; created_at: string; updated_at: string; }
interface RoleRecord { id: string; name: string; description: string | null; permissions: string; isSystem: boolean; created_at: string; updated_at: string; }
interface NewsRecord { id: string; title: string; slug: string; excerpt: string | null; content: string; coverImage: string | null; category: string; isPublished: boolean; publishedAt: string | null; created_at: string; updated_at: string; }
interface EventRecord { id: string; title: string; slug: string; description: string | null; content: string; coverImage: string | null; eventType: string; location: string | null; eventDate: string; endDate: string | null; registrationUrl: string | null; isPublished: boolean; publishedAt: string | null; created_at: string; updated_at: string; }
interface CareerRecord { id: string; title: string; slug: string; description: string; requirements: string; location: string; jobType: string; department: string; experience: string; salary: string | null; isRemote: boolean; isActive: boolean; postedAt: string; closedAt: string | null; created_at: string; updated_at: string; }
interface NewsletterIssueRecord { id: string; title: string; slug: string; content: string; issueNumber: number; coverImage: string | null; isPublished: boolean; publishedAt: string | null; created_at: string; updated_at: string; }
interface StatusIncidentRecord { id: string; title: string; description: string; severity: string; service: string; status: string; startedAt: string; resolvedAt: string | null; created_at: string; updated_at: string; }
interface OrderRecord { id: string; name: string; email: string; phone?: string | null; company?: string | null; orderType: string; description: string; budget?: string | null; timeline?: string | null; status: string; notes?: string | null; created_at: string; updated_at: string; }
interface PartnershipRecord { id: string; name: string; email: string; phone?: string | null; company?: string | null; website?: string | null; partnerType: string; message: string; status: string; notes?: string | null; created_at: string; updated_at: string; }
interface InternshipRecord { id: string; name: string; email: string; phone?: string | null; college?: string | null; degree?: string | null; graduationYear?: string | null; role?: string | null; resumeUrl?: string | null; portfolioUrl?: string | null; message: string; status: string; notes?: string | null; created_at: string; updated_at: string; }
interface ResearchRecord { id: string; name: string; email: string; organization?: string | null; researchTopic: string; description: string; collaborationType?: string | null; status: string; notes?: string | null; created_at: string; updated_at: string; }
interface FeedbackRecord { id: string; name: string; email: string; rating: number; category: string; message: string; isAnonymous: boolean; status: string; adminReply?: string | null; created_at: string; updated_at: string; }
interface SuggestionRecord { id: string; name?: string | null; email?: string | null; category: string; title: string; description: string; priority: string; status: string; adminNotes?: string | null; created_at: string; updated_at: string; }
interface MaintenanceRecord { id: string; title: string; description: string; service: string; scheduledStart: string; scheduledEnd: string; status: string; createdBy?: string | null; created_at: string; updated_at: string; }
interface ChatLogRecord { id: string; sessionId: string; userMessage: string; botResponse: string; ipAddress?: string | null; userAgent?: string | null; created_at: string; }

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_PERMISSIONS = [
  "news:write", "events:write", "careers:write",
  "status:write", "newsletter:write", "users:manage", "roles:manage",
  "orders:manage", "partnerships:manage", "internships:manage",
  "research:manage", "feedback:manage", "suggestions:manage",
  "maintenance:manage", "chat:manage",
];

const SIDEBAR_SECTIONS = [
  { group: "OVERVIEW", items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { group: "CONTENT", items: [
    { id: "news", label: "News", icon: Newspaper },
    { id: "events", label: "Events & Webinars", icon: Calendar },
    { id: "careers", label: "Careers", icon: Briefcase },
    { id: "newsletter", label: "Newsletter", icon: Mail },
  ]},
  { group: "BUSINESS", items: [
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "partnerships", label: "Partnerships", icon: Handshake },
    { id: "internships", label: "Internships", icon: GraduationCap },
    { id: "research", label: "Research", icon: FlaskConical },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "suggestions", label: "Suggestions", icon: Lightbulb },
  ]},
  { group: "SYSTEM", items: [
    { id: "users-roles", label: "Users & Roles", icon: Users },
    { id: "status-maintenance", label: "Status & Maintenance", icon: AlertTriangle },
    { id: "chat-monitor", label: "Chat Monitor", icon: MessageSquare },
    { id: "performance", label: "Performance", icon: Activity },
  ]},
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  reviewing: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  accepted: "bg-green-500/10 text-green-400 border-green-500/20",
  shortlisted: "bg-green-500/10 text-green-400 border-green-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  implemented: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  addressed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  investigating: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  identified: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  monitoring: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  considering: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  planned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

const SEVERITY_COLORS: Record<string, string> = {
  minor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  major: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function authHeaders(email: string): HeadersInit {
  return { "Content-Type": "application/json", "X-User-Email": email };
}

function StatusBadge({ status }: { status: string }) {
  return <Badge variant="outline" className={`${STATUS_COLORS[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"} text-xs`}>{status.replace(/_/g, " ")}</Badge>;
}

function StarRating({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"} ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
          onClick={() => interactive && onChange?.(i)}
        />
      ))}
    </div>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-[var(--glass-border)] bg-[var(--glass-card-bg)] backdrop-blur-md ${className}`}>{children}</div>;
}

/* ── Extracted sub-components (must be outside render to avoid re-creation) ── */

function AdminSidebarContent({
  sidebarCollapsed,
  activeTab,
  onTabClick,
  onLogout,
  userInfo,
}: {
  sidebarCollapsed: boolean;
  activeTab: string;
  onTabClick: (id: string) => void;
  onLogout: () => void;
  userInfo: UserInfo | null;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className={`p-4 flex items-center gap-3 border-b border-[var(--glass-border)] ${sidebarCollapsed ? "justify-center" : ""}`}>
        <Image src="/logo.svg" alt="ABWcurious" width={36} height={36} className="rounded-lg shrink-0" unoptimized />
        {!sidebarCollapsed && (
          <div>
            <h2 className="text-sm font-bold text-gradient-cyan" style={{ fontFamily: "var(--font-space-grotesk)" }}>ABWcurious</h2>
            <p className="text-muted-foreground uppercase tracking-widest" style={{ fontSize: "10px" }}>Admin Panel</p>
          </div>
        )}
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-4" aria-label="Admin navigation">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.group}>
              {!sidebarCollapsed && <p className="px-3 mb-1 text-muted-foreground uppercase tracking-wider font-semibold" style={{ fontSize: "10px" }}>{section.group}</p>}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <TooltipProvider key={item.id} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={() => onTabClick(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"} ${sidebarCollapsed ? "justify-center px-2" : ""}`}
                            aria-current={isActive ? "page" : undefined}>
                            <Icon className="size-4 shrink-0" />
                            {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                          </button>
                        </TooltipTrigger>
                        {sidebarCollapsed && <TooltipContent side="right"><p>{item.label}</p></TooltipContent>}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-3 border-t border-[var(--glass-border)]">
        <div className={`flex items-center gap-3 px-2 py-1.5 ${sidebarCollapsed ? "justify-center" : ""}`}>
          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">{userInfo?.name?.charAt(0)?.toUpperCase() || "A"}</span>
          </div>
          {!sidebarCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userInfo?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{userInfo?.email}</p>
              </div>
              <button onClick={onLogout} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" title="Logout" aria-label="Logout"><LogOut className="size-4" /></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminPageHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>{title}</h1>
        {desc && <p className="text-muted-foreground text-sm mt-1">{desc}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  // ── Auth ──
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // ── UI ──
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [usersSubTab, setUsersSubTab] = useState("users");
  const [statusSubTab, setStatusSubTab] = useState("incidents");

  // ── Data ──
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [news, setNews] = useState<NewsRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [careers, setCareers] = useState<CareerRecord[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterIssueRecord[]>([]);
  const [incidents, setIncidents] = useState<StatusIncidentRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [partnerships, setPartnerships] = useState<PartnershipRecord[]>([]);
  const [internships, setInternships] = useState<InternshipRecord[]>([]);
  const [research, setResearch] = useState<ResearchRecord[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionRecord[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatLogRecord[]>([]);

  // ── Search/Filter ──
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Dialogs ──
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<Record<string, unknown> | null>(null);
  const [detailType, setDetailType] = useState("");
  const [detailNotes, setDetailNotes] = useState("");
  const [detailReply, setDetailReply] = useState("");
  const [detailStatus, setDetailStatus] = useState("");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);

  // ── Editing ──
  const [editingContent, setEditingContent] = useState<{ type: string; data: Record<string, unknown> } | null>(null);

  // ── Forms ──
  const [newsForm, setNewsForm] = useState({ title: "", excerpt: "", content: "", coverImage: "", category: "Company", isPublished: false });
  const [eventForm, setEventForm] = useState({ title: "", description: "", content: "", coverImage: "", eventType: "webinar", location: "", eventDate: "", endDate: "", registrationUrl: "", isPublished: false });
  const [careerForm, setCareerForm] = useState({ title: "", description: "", requirements: "", location: "", jobType: "Full-time", department: "Engineering", experience: "0-1 years", salary: "", isRemote: false, isActive: true });
  const [newsletterForm, setNewsletterForm] = useState({ title: "", content: "", issueNumber: 1, coverImage: "", isPublished: false });
  const [incidentForm, setIncidentForm] = useState({ title: "", description: "", severity: "minor", service: "", status: "investigating", startedAt: "", resolvedAt: "" });
  const [maintenanceForm, setMaintenanceForm] = useState({ title: "", description: "", service: "", scheduledStart: "", scheduledEnd: "", status: "scheduled" });
  const [newUserForm, setNewUserForm] = useState({ email: "", name: "", role: "user" });
  const [newRoleForm, setNewRoleForm] = useState({ name: "", description: "", permissions: [] as string[] });
  const [editRoleForm, setEditRoleForm] = useState({ description: "", permissions: [] as string[] });
  const [saving, setSaving] = useState(false);

  // ── Auth check ──
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = localStorage.getItem("abwcurious_user");
        if (!stored) { setIsAuthed(false); setAuthLoading(false); return; }
        const user: UserInfo = JSON.parse(stored);
        setUserInfo(user);
        const res = await fetch("/api/admin/users?limit=1", { headers: { "X-User-Email": user.email } });
        setIsAuthed(res.ok);
      } catch { setIsAuthed(false); }
      finally { setAuthLoading(false); }
    };
    checkAuth();
  }, []);

  // ── Generic fetch ──
  const fetchData = useCallback(async (endpoint: string, setter: (d: any) => void) => {
    if (!userInfo) return;
    try {
      const res = await fetch(endpoint, { headers: { "X-User-Email": userInfo.email } });
      const data = await res.json();
      if (data.success) setter(data.data);
    } catch { toast.error(`Failed to fetch ${endpoint}`); }
  }, [userInfo]);

  // ── Data fetching per tab ──
  useEffect(() => {
    if (!isAuthed || !userInfo) return;
    const e = userInfo.email;
    const h = { "X-User-Email": e };
    const load = async (url: string, setter: (d: any) => void) => {
      try {
        const r = await fetch(url, { headers: h });
        const d = await r.json();
        if (d.success) setter(d.data);
      } catch { /* silent */ }
    };

    if (activeTab === "dashboard") {
      load("/api/admin/users?limit=100", setUsers);
      load("/api/news?limit=50", setNews);
      load("/api/careers?limit=50", setCareers);
      load("/api/orders?limit=50", setOrders);
      load("/api/partnerships?limit=50", setPartnerships);
      load("/api/internships?limit=50", setInternships);
      load("/api/status-incidents?limit=50", setIncidents);
    } else if (activeTab === "news") {
      load("/api/news?limit=50", setNews);
    } else if (activeTab === "events") {
      load("/api/events?limit=50", setEvents);
    } else if (activeTab === "careers") {
      load("/api/careers?limit=50", setCareers);
    } else if (activeTab === "newsletter") {
      load("/api/newsletter-issues?limit=50", setNewsletters);
    } else if (activeTab === "orders") {
      load("/api/orders?limit=100", setOrders);
    } else if (activeTab === "partnerships") {
      load("/api/partnerships?limit=100", setPartnerships);
    } else if (activeTab === "internships") {
      load("/api/internships?limit=100", setInternships);
    } else if (activeTab === "research") {
      load("/api/research?limit=100", setResearch);
    } else if (activeTab === "feedback") {
      load("/api/feedback?limit=100", setFeedback);
    } else if (activeTab === "suggestions") {
      load("/api/suggestions?limit=100", setSuggestions);
    } else if (activeTab === "users-roles") {
      load("/api/admin/users?limit=100", setUsers);
      load("/api/admin/roles", setRoles);
    } else if (activeTab === "status-maintenance") {
      load("/api/status-incidents?limit=50", setIncidents);
      load("/api/maintenance?limit=50", setMaintenance);
    } else if (activeTab === "chat-monitor") {
      load("/api/chat-logs?limit=200", setChatLogs);
    }
  }, [activeTab, isAuthed, userInfo]);

  // ── Generic CRUD ──
  const apiAction = async (endpoint: string, method: string, body?: Record<string, unknown>, successMsg?: string) => {
    if (!userInfo) return false;
    setSaving(true);
    try {
      const res = await fetch(endpoint, { method, headers: authHeaders(userInfo.email), body: body ? JSON.stringify(body) : undefined });
      const data = await res.json();
      if (data.success) { if (successMsg) toast.success(successMsg); return true; }
      toast.error(data.error || "Operation failed"); return false;
    } catch { toast.error("Operation failed"); return false; }
    finally { setSaving(false); }
  };

  const handleDelete = async (type: string, id: string) => {
    const map: Record<string, string> = {
      news: `/api/news/${id}`, events: `/api/events/${id}`,
      careers: `/api/careers/${id}`, newsletters: `/api/newsletter-issues/${id}`,
      incidents: `/api/status-incidents/${id}`, orders: `/api/orders/${id}`,
      partnerships: `/api/partnerships/${id}`, internships: `/api/internships/${id}`,
      research: `/api/research/${id}`, feedback: `/api/feedback/${id}`,
      suggestions: `/api/suggestions/${id}`, maintenance: `/api/maintenance/${id}`,
      users: `/api/admin/users/${id}`, roles: `/api/admin/roles/${id}`,
    };
    const ok = await apiAction(map[type] || "", "DELETE", undefined, "Deleted successfully");
    if (ok) {
      if (type === "news") fetchData("/api/news?limit=50", setNews);
      else if (type === "events") fetchData("/api/events?limit=50", setEvents);
      else if (type === "careers") fetchData("/api/careers?limit=50", setCareers);
      else if (type === "newsletters") fetchData("/api/newsletter-issues?limit=50", setNewsletters);
      else if (type === "incidents") fetchData("/api/status-incidents?limit=50", setIncidents);
      else if (type === "orders") fetchData("/api/orders?limit=100", setOrders);
      else if (type === "partnerships") fetchData("/api/partnerships?limit=100", setPartnerships);
      else if (type === "internships") fetchData("/api/internships?limit=100", setInternships);
      else if (type === "research") fetchData("/api/research?limit=100", setResearch);
      else if (type === "feedback") fetchData("/api/feedback?limit=100", setFeedback);
      else if (type === "suggestions") fetchData("/api/suggestions?limit=100", setSuggestions);
      else if (type === "maintenance") fetchData("/api/maintenance?limit=50", setMaintenance);
      else if (type === "users") fetchData("/api/admin/users?limit=100", setUsers);
      else if (type === "roles") fetchData("/api/admin/roles", setRoles);
    }
  };

  // ── Content save ──
  const openCreateDialog = (type: string) => {
    setEditingContent(null);
    if (type === "news") setNewsForm({ title: "", excerpt: "", content: "", coverImage: "", category: "Company", isPublished: false });
    else if (type === "events") setEventForm({ title: "", description: "", content: "", coverImage: "", eventType: "webinar", location: "", eventDate: "", endDate: "", registrationUrl: "", isPublished: false });
    else if (type === "careers") setCareerForm({ title: "", description: "", requirements: "", location: "", jobType: "Full-time", department: "Engineering", experience: "0-1 years", salary: "", isRemote: false, isActive: true });
    else if (type === "newsletters") setNewsletterForm({ title: "", content: "", issueNumber: newsletters.length > 0 ? Math.max(...newsletters.map(n => n.issueNumber)) + 1 : 1, coverImage: "", isPublished: false });
    else if (type === "incidents") setIncidentForm({ title: "", description: "", severity: "minor", service: "", status: "investigating", startedAt: new Date().toISOString().slice(0, 16), resolvedAt: "" });
    else if (type === "maintenance") setMaintenanceForm({ title: "", description: "", service: "", scheduledStart: "", scheduledEnd: "", status: "scheduled" });
    setContentDialogOpen(true);
  };

  const openEditDialog = (type: string, item: Record<string, unknown>) => {
    setEditingContent({ type, data: item });
    if (type === "news") { const n = item as unknown as NewsRecord; setNewsForm({ title: n.title, excerpt: n.excerpt || "", content: n.content || "", coverImage: n.coverImage || "", category: n.category || "Company", isPublished: n.isPublished }); }
    else if (type === "events") { const e = item as unknown as EventRecord; setEventForm({ title: e.title, description: e.description || "", content: e.content || "", coverImage: e.coverImage || "", eventType: e.eventType || "webinar", location: e.location || "", eventDate: e.eventDate ? new Date(e.eventDate).toISOString().slice(0, 16) : "", endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 16) : "", registrationUrl: e.registrationUrl || "", isPublished: e.isPublished }); }
    else if (type === "careers") { const c = item as unknown as CareerRecord; setCareerForm({ title: c.title, description: c.description, requirements: c.requirements, location: c.location, jobType: c.jobType, department: c.department, experience: c.experience, salary: c.salary || "", isRemote: c.isRemote, isActive: c.isActive }); }
    else if (type === "newsletters") { const nl = item as unknown as NewsletterIssueRecord; setNewsletterForm({ title: nl.title, content: nl.content, issueNumber: nl.issueNumber, coverImage: nl.coverImage || "", isPublished: nl.isPublished }); }
    else if (type === "incidents") { const inc = item as unknown as StatusIncidentRecord; setIncidentForm({ title: inc.title, description: inc.description, severity: inc.severity, service: inc.service, status: inc.status, startedAt: inc.startedAt ? new Date(inc.startedAt).toISOString().slice(0, 16) : "", resolvedAt: inc.resolvedAt ? new Date(inc.resolvedAt).toISOString().slice(0, 16) : "" }); }
    else if (type === "maintenance") { const m = item as unknown as MaintenanceRecord; setMaintenanceForm({ title: m.title, description: m.description, service: m.service, scheduledStart: m.scheduledStart ? new Date(m.scheduledStart).toISOString().slice(0, 16) : "", scheduledEnd: m.scheduledEnd ? new Date(m.scheduledEnd).toISOString().slice(0, 16) : "", status: m.status }); }
    setContentDialogOpen(true);
  };

  const handleSaveContent = async () => {
    const type = editingContent ? editingContent.type : (activeTab === "newsletter" ? "newsletters" : activeTab === "events" ? "events" : activeTab === "careers" ? "careers" : activeTab === "status-maintenance" && statusSubTab === "incidents" ? "incidents" : "maintenance");
    let endpoint = "", method = "POST", body: Record<string, unknown> = {}, refreshFn: () => void = () => {};

    if (type === "news") {
      const slug = editingContent ? (editingContent.data as Record<string, string>).slug : genSlug(newsForm.title);
      endpoint = editingContent ? `/api/news/${slug}` : "/api/news"; method = editingContent ? "PATCH" : "POST"; body = newsForm as unknown as Record<string, unknown>; refreshFn = () => fetchData("/api/news?limit=50", setNews);
    } else if (type === "events") {
      const slug = editingContent ? (editingContent.data as Record<string, string>).slug : genSlug(eventForm.title);
      endpoint = editingContent ? `/api/events/${slug}` : "/api/events"; method = editingContent ? "PATCH" : "POST"; body = eventForm as unknown as Record<string, unknown>; refreshFn = () => fetchData("/api/events?limit=50", setEvents);
    } else if (type === "careers") {
      const slug = editingContent ? (editingContent.data as Record<string, string>).slug : genSlug(careerForm.title);
      endpoint = editingContent ? `/api/careers/${slug}` : "/api/careers"; method = editingContent ? "PATCH" : "POST"; body = careerForm as unknown as Record<string, unknown>; refreshFn = () => fetchData("/api/careers?limit=50", setCareers);
    } else if (type === "newsletters") {
      const slug = editingContent ? (editingContent.data as Record<string, string>).slug : genSlug(newsletterForm.title);
      endpoint = editingContent ? `/api/newsletter-issues/${slug}` : "/api/newsletter-issues"; method = editingContent ? "PATCH" : "POST"; body = newsletterForm as unknown as Record<string, unknown>; refreshFn = () => fetchData("/api/newsletter-issues?limit=50", setNewsletters);
    } else if (type === "incidents") {
      const id = editingContent ? (editingContent.data as Record<string, string>).id : "";
      endpoint = editingContent ? `/api/status-incidents/${id}` : "/api/status-incidents"; method = editingContent ? "PATCH" : "POST"; body = incidentForm as unknown as Record<string, unknown>; refreshFn = () => fetchData("/api/status-incidents?limit=50", setIncidents);
    } else if (type === "maintenance") {
      const id = editingContent ? (editingContent.data as Record<string, string>).id : "";
      endpoint = editingContent ? `/api/maintenance/${id}` : "/api/maintenance"; method = editingContent ? "PATCH" : "POST"; body = maintenanceForm as unknown as Record<string, unknown>; refreshFn = () => fetchData("/api/maintenance?limit=50", setMaintenance);
    }

    const ok = await apiAction(endpoint, method, body, editingContent ? "Updated successfully" : "Created successfully");
    if (ok) { setContentDialogOpen(false); refreshFn(); }
  };

  // ── Business item detail/status update ──
  const openDetailDialog = (type: string, item: Record<string, unknown>) => {
    setDetailType(type); setDetailItem(item); setDetailNotes((item as Record<string, string>).notes || ""); setDetailReply((item as Record<string, string>).adminReply || ""); setDetailStatus((item as Record<string, string>).status || "new"); setDetailDialogOpen(true);
  };

  const handleDetailSave = async () => {
    if (!userInfo || !detailItem) return;
    const id = (detailItem as Record<string, string>).id;
    const body: Record<string, unknown> = { status: detailStatus };
    if (detailType === "feedback") body.adminReply = detailReply;
    else body.notes = detailNotes;

    const map: Record<string, string> = {
      orders: `/api/orders/${id}`, partnerships: `/api/partnerships/${id}`,
      internships: `/api/internships/${id}`, research: `/api/research/${id}`,
      feedback: `/api/feedback/${id}`, suggestions: `/api/suggestions/${id}`,
    };
    const ok = await apiAction(map[detailType] || "", "PATCH", body, "Updated successfully");
    if (ok) {
      setDetailDialogOpen(false);
      if (detailType === "orders") fetchData("/api/orders?limit=100", setOrders);
      else if (detailType === "partnerships") fetchData("/api/partnerships?limit=100", setPartnerships);
      else if (detailType === "internships") fetchData("/api/internships?limit=100", setInternships);
      else if (detailType === "research") fetchData("/api/research?limit=100", setResearch);
      else if (detailType === "feedback") fetchData("/api/feedback?limit=100", setFeedback);
      else if (detailType === "suggestions") fetchData("/api/suggestions?limit=100", setSuggestions);
    }
  };

  // ── User/Role CRUD ──
  const handleCreateUser = async () => {
    const ok = await apiAction("/api/admin/users", "POST", newUserForm as unknown as Record<string, unknown>, "User created");
    if (ok) { setUserDialogOpen(false); setNewUserForm({ email: "", name: "", role: "user" }); fetchData("/api/admin/users?limit=100", setUsers); }
  };

  const handleUpdateUser = async (userId: string, updates: { role?: string; isActive?: boolean }) => {
    const ok = await apiAction(`/api/admin/users/${userId}`, "PATCH", updates as unknown as Record<string, unknown>, "User updated");
    if (ok) fetchData("/api/admin/users?limit=100", setUsers);
  };

  const handleCreateRole = async () => {
    const ok = await apiAction("/api/admin/roles", "POST", { ...newRoleForm, permissions: newRoleForm.permissions.join(",") } as unknown as Record<string, unknown>, "Role created");
    if (ok) { setRoleDialogOpen(false); setNewRoleForm({ name: "", description: "", permissions: [] }); fetchData("/api/admin/roles", setRoles); }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;
    const ok = await apiAction(`/api/admin/roles/${editingRole.id}`, "PATCH", { description: editRoleForm.description, permissions: editRoleForm.permissions.join(",") } as unknown as Record<string, unknown>, "Role updated");
    if (ok) { setEditRoleDialogOpen(false); setEditingRole(null); fetchData("/api/admin/roles", setRoles); }
  };

  const handleLogout = () => { localStorage.removeItem("abwcurious_user"); localStorage.removeItem("abwcurious_token"); window.location.href = "/"; };

  // ── Sidebar tab click ──
  const handleTabClick = useCallback((id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  }, []);

  // ── Confirm Delete ──
  const confirmDelete = (type: string, id: string, name: string) => { setDeleteTarget({ type, id, name }); setDeleteDialogOpen(true); };
  const executeDelete = async () => { if (!deleteTarget) return; await handleDelete(deleteTarget.type, deleteTarget.id); setDeleteDialogOpen(false); setDeleteTarget(null); };

  // ── RENDER: Loading ──
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // ── RENDER: Access Denied ──
  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 max-w-md w-full text-center">
          <div className="size-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center"><Shield className="size-8 text-destructive" /></div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need admin privileges to access this dashboard.</p>
          <Link href="/"><Button className="btn-glow w-full"><ArrowLeft className="size-4 mr-2" />Back to Home</Button></Link>
        </motion.div>
      </div>
    );
  }

  // ── Page Header (uses extracted component) ──

  // ── Data Table Wrapper ──
  const DataTableWrapper = ({ searchPlaceholder, children }: { searchPlaceholder?: string; children: React.ReactNode }) => (
    <GlassCard>
      <div className="p-4 border-b border-[var(--glass-border)] flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder={searchPlaceholder || "Search..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </GlassCard>
  );

  // ── Table ──
  const TRow = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <tr className="border-b border-[var(--glass-border)] hover:bg-muted/30 transition-colors cursor-pointer" onClick={onClick}>{children}</tr>
  );
  const THead = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <th className={`text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${className}`}>{children}</th>
  );
  const TCell = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION RENDERERS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── 1. Dashboard ──
  const renderDashboard = () => {
    const stats = [
      { label: "Users", value: users.length, icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
      { label: "News", value: news.length, icon: Newspaper, color: "text-purple-400", bg: "bg-purple-500/10" },
      { label: "Careers", value: careers.filter(c => c.isActive).length, icon: Briefcase, color: "text-orange-400", bg: "bg-orange-500/10" },
      { label: "Orders", value: orders.length, icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/10" },
      { label: "Partnerships", value: partnerships.length, icon: Handshake, color: "text-pink-400", bg: "bg-pink-500/10" },
      { label: "Internships", value: internships.length, icon: GraduationCap, color: "text-yellow-400", bg: "bg-yellow-500/10" },
      { label: "Incidents", value: incidents.filter(i => i.status !== "resolved").length, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
    ];

    const recentActivity = [
      ...orders.slice(0, 5).map(o => ({ type: "Order", name: o.name, detail: o.orderType, time: o.created_at, status: o.status })),
      ...partnerships.slice(0, 3).map(p => ({ type: "Partnership", name: p.name, detail: p.partnerType, time: p.created_at, status: p.status })),
      ...feedback.slice(0, 2).map(f => ({ type: "Feedback", name: f.isAnonymous ? "Anonymous" : f.name, detail: f.category, time: f.created_at, status: f.status })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

    const quickActions = [
      { label: "Create News", icon: Newspaper, action: () => { setActiveTab("news"); setTimeout(() => openCreateDialog("news"), 100); } },
      { label: "Add Career", icon: Briefcase, action: () => { setActiveTab("careers"); setTimeout(() => openCreateDialog("careers"), 100); } },
      { label: "Schedule Maintenance", icon: Wrench, action: () => { setActiveTab("status-maintenance"); setStatusSubTab("maintenance"); setTimeout(() => openCreateDialog("maintenance"), 100); } },
      { label: "View Orders", icon: ShoppingBag, action: () => setActiveTab("orders") },
    ];

    // Simulated 7-day chart data
    const chartDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const chartValues = [65, 45, 80, 50, 90, 40, 70];

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader title="Dashboard" desc="Overview of your platform" />

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <GlassCard key={s.label} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`size-10 rounded-lg ${s.bg} flex items-center justify-center`}><Icon className={`size-5 ${s.color}`} /></div>
                  <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>{s.value}</span>
                </div>
                <p className="text-muted-foreground text-sm">{s.label}</p>
              </GlassCard>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <Button key={qa.label} variant="outline" onClick={qa.action} className="h-auto py-3 flex flex-col items-center gap-2 border-[var(--glass-border)] hover:bg-primary/5 hover:border-primary/30">
                  <Icon className="size-5 text-primary" /><span className="text-xs">{qa.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentActivity.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No recent activity</p>}
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><span className="text-xs font-bold text-primary">{a.type.charAt(0)}</span></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.type} · {a.detail}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Performance Chart */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold mb-3">Activity (Last 7 Days)</h3>
            <div className="flex items-end gap-2 h-48">
              {chartDays.map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: "160px" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${chartValues[i]}%` }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary/20"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </motion.div>
    );
  };

  // ── 2. News ──
  const renderNews = () => {
    const data = news;
    const filtered = data.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || item.title.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || (statusFilter === "published" && item.isPublished) || (statusFilter === "draft" && !item.isPublished);
      return matchesSearch && matchesStatus;
    });

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader title="News" desc="Manage your news content"
          action={<Button onClick={() => openCreateDialog("news")} className="btn-glow"><Plus className="size-4 mr-2" />Create News</Button>}
        />
        <GlassCard>
          <div className="p-4 border-b border-[var(--glass-border)] flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><THead>Title</THead><THead>Category</THead><THead>Status</THead><THead>Date</THead><THead className="text-right">Actions</THead></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No items found</td></tr>}
                {filtered.map((item) => (
                  <TRow key={item.id}>
                    <TCell><div className="font-medium max-w-xs truncate">{item.title}</div><div className="text-xs text-muted-foreground truncate max-w-xs">{item.excerpt || "No excerpt"}</div></TCell>
                    <TCell><Badge variant="outline" className="text-xs">{item.category}</Badge></TCell>
                    <TCell><Badge variant={item.isPublished ? "default" : "secondary"} className="text-xs">{item.isPublished ? "Published" : "Draft"}</Badge></TCell>
                    <TCell className="text-muted-foreground">{fmtDate(item.created_at)}</TCell>
                    <TCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditDialog("news", item as unknown as Record<string, unknown>); }}><Pencil className="size-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("news", item.id, item.title); }}><Trash2 className="size-3.5" /></Button>
                      </div>
                    </TCell>
                  </TRow>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  // ── 3. Events ──
  const renderEvents = () => {
    const filtered = events.filter((e) => {
      const q = searchQuery.toLowerCase();
      return !q || e.title.toLowerCase().includes(q);
    });
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader title="Events & Webinars" desc="Manage events and webinars"
          action={<Button onClick={() => openCreateDialog("events")} className="btn-glow"><Plus className="size-4 mr-2" />Create Event</Button>}
        />
        <GlassCard>
          <div className="p-4 border-b border-[var(--glass-border)]">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><THead>Title</THead><THead>Type</THead><THead>Location</THead><THead>Date</THead><THead>Status</THead><THead className="text-right">Actions</THead></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No events found</td></tr>}
                {filtered.map((ev) => (
                  <TRow key={ev.id}>
                    <TCell><div className="font-medium">{ev.title}</div></TCell>
                    <TCell><Badge variant="outline" className="text-xs capitalize">{ev.eventType}</Badge></TCell>
                    <TCell className="text-muted-foreground"><div className="flex items-center gap-1"><MapPin className="size-3" />{ev.location || "Online"}</div></TCell>
                    <TCell className="text-muted-foreground">{fmtDate(ev.eventDate)}</TCell>
                    <TCell><Badge variant={ev.isPublished ? "default" : "secondary"} className="text-xs">{ev.isPublished ? "Published" : "Draft"}</Badge></TCell>
                    <TCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditDialog("events", ev as unknown as Record<string, unknown>); }}><Pencil className="size-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("events", ev.id, ev.title); }}><Trash2 className="size-3.5" /></Button>
                      </div>
                    </TCell>
                  </TRow>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  // ── 4. Careers ──
  const renderCareers = () => {
    const filtered = careers.filter((c) => {
      const q = searchQuery.toLowerCase();
      return !q || c.title.toLowerCase().includes(q) || c.department.toLowerCase().includes(q);
    });
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader title="Careers" desc="Manage job listings"
          action={<Button onClick={() => openCreateDialog("careers")} className="btn-glow"><Plus className="size-4 mr-2" />Add Career</Button>}
        />
        <GlassCard>
          <div className="p-4 border-b border-[var(--glass-border)]">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search careers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><THead>Title</THead><THead>Department</THead><THead>Location</THead><THead>Type</THead><THead>Status</THead><THead className="text-right">Actions</THead></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No careers found</td></tr>}
                {filtered.map((c) => (
                  <TRow key={c.id}>
                    <TCell><div className="font-medium">{c.title}</div><div className="text-xs text-muted-foreground">{c.experience}</div></TCell>
                    <TCell><Badge variant="outline" className="text-xs">{c.department}</Badge></TCell>
                    <TCell className="text-muted-foreground"><div className="flex items-center gap-1">{c.isRemote ? <Globe className="size-3" /> : <MapPin className="size-3" />}{c.location}{c.isRemote ? " (Remote)" : ""}</div></TCell>
                    <TCell className="text-muted-foreground">{c.jobType}</TCell>
                    <TCell><Badge variant={c.isActive ? "default" : "secondary"} className="text-xs">{c.isActive ? "Active" : "Closed"}</Badge></TCell>
                    <TCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditDialog("careers", c as unknown as Record<string, unknown>); }}><Pencil className="size-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("careers", c.id, c.title); }}><Trash2 className="size-3.5" /></Button>
                      </div>
                    </TCell>
                  </TRow>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  // ── 5. Newsletter ──
  const renderNewsletter = () => {
    const filtered = newsletters.filter((n) => {
      const q = searchQuery.toLowerCase();
      return !q || n.title.toLowerCase().includes(q);
    });
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader title="Newsletter" desc="Manage newsletter issues"
          action={<Button onClick={() => openCreateDialog("newsletters")} className="btn-glow"><Plus className="size-4 mr-2" />Create Issue</Button>}
        />
        <GlassCard>
          <div className="p-4 border-b border-[var(--glass-border)]">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search newsletters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><THead>Issue #</THead><THead>Title</THead><THead>Status</THead><THead>Date</THead><THead className="text-right">Actions</THead></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No newsletters found</td></tr>}
                {filtered.map((nl) => (
                  <TRow key={nl.id}>
                    <TCell><Badge variant="outline" className="text-xs">#{nl.issueNumber}</Badge></TCell>
                    <TCell><div className="font-medium">{nl.title}</div></TCell>
                    <TCell><Badge variant={nl.isPublished ? "default" : "secondary"} className="text-xs">{nl.isPublished ? "Published" : "Draft"}</Badge></TCell>
                    <TCell className="text-muted-foreground">{fmtDate(nl.created_at)}</TCell>
                    <TCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditDialog("newsletters", nl as unknown as Record<string, unknown>); }}><Pencil className="size-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("newsletters", nl.id, nl.title); }}><Trash2 className="size-3.5" /></Button>
                      </div>
                    </TCell>
                  </TRow>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  // ── 6. Orders ──
  const renderOrders = () => {
    const filtered = orders.filter((o) => {
      const q = searchQuery.toLowerCase();
      const ms = !q || o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
      const mst = statusFilter === "all" || o.status === statusFilter;
      return ms && mst;
    });
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader title="Orders" desc="Service order requests" />
        <DataTableWrapper searchPlaceholder="Search orders...">
          <table className="w-full">
            <thead><tr><THead>Name</THead><THead>Email</THead><THead>Type</THead><THead>Budget</THead><THead>Timeline</THead><THead>Status</THead><THead className="text-right">Actions</THead></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No orders found</td></tr>}
              {filtered.map((o) => (
                <TRow key={o.id} onClick={() => openDetailDialog("orders", o as unknown as Record<string, unknown>)}>
                  <TCell className="font-medium">{o.name}</TCell>
                  <TCell className="text-muted-foreground">{o.email}</TCell>
                  <TCell><Badge variant="outline" className="text-xs capitalize">{o.orderType.replace(/_/g, " ")}</Badge></TCell>
                  <TCell className="text-muted-foreground">{o.budget || "—"}</TCell>
                  <TCell className="text-muted-foreground">{o.timeline || "—"}</TCell>
                  <TCell><StatusBadge status={o.status} /></TCell>
                  <TCell className="text-right"><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("orders", o.id, o.name); }}><Trash2 className="size-3.5" /></Button></TCell>
                </TRow>
              ))}
            </tbody>
          </table>
        </DataTableWrapper>
      </motion.div>
    );
  };

  // ── 7. Partnerships ──
  const renderPartnerships = () => {
    const filtered = partnerships.filter((p) => {
      const q = searchQuery.toLowerCase();
      const ms = !q || p.name.toLowerCase().includes(q) || (p.company || "").toLowerCase().includes(q);
      const mst = statusFilter === "all" || p.status === statusFilter;
      return ms && mst;
    });
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader title="Partnerships" desc="Partnership inquiries" />
        <DataTableWrapper searchPlaceholder="Search partnerships...">
          <table className="w-full">
            <thead><tr><THead>Name</THead><THead>Company</THead><THead>Type</THead><THead>Status</THead><THead className="text-right">Actions</THead></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No partnerships found</td></tr>}
              {filtered.map((p) => (
                <TRow key={p.id} onClick={() => openDetailDialog("partnerships", p as unknown as Record<string, unknown>)}>
                  <TCell className="font-medium">{p.name}</TCell>
                  <TCell className="text-muted-foreground">{p.company || "—"}</TCell>
                  <TCell><Badge variant="outline" className="text-xs capitalize">{p.partnerType}</Badge></TCell>
                  <TCell><StatusBadge status={p.status} /></TCell>
                  <TCell className="text-right"><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("partnerships", p.id, p.name); }}><Trash2 className="size-3.5" /></Button></TCell>
                </TRow>
              ))}
            </tbody>
          </table>
        </DataTableWrapper>
      </motion.div>
    );
  };

  // ── 8. Internships ──
  const renderInternships = () => {
    const filtered = internships.filter((i) => {
      const q = searchQuery.toLowerCase();
      const ms = !q || i.name.toLowerCase().includes(q) || (i.college || "").toLowerCase().includes(q);
      const mst = statusFilter === "all" || i.status === statusFilter;
      return ms && mst;
    });
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader title="Internships" desc="Internship applications" />
        <DataTableWrapper searchPlaceholder="Search internships...">
          <table className="w-full">
            <thead><tr><THead>Name</THead><THead>College</THead><THead>Role</THead><THead>Status</THead><THead className="text-right">Actions</THead></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No internships found</td></tr>}
              {filtered.map((i) => (
                <TRow key={i.id} onClick={() => openDetailDialog("internships", i as unknown as Record<string, unknown>)}>
                  <TCell className="font-medium">{i.name}</TCell>
                  <TCell className="text-muted-foreground">{i.college || "—"}</TCell>
                  <TCell className="text-muted-foreground">{i.role || "—"}</TCell>
                  <TCell><StatusBadge status={i.status} /></TCell>
                  <TCell className="text-right"><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("internships", i.id, i.name); }}><Trash2 className="size-3.5" /></Button></TCell>
                </TRow>
              ))}
            </tbody>
          </table>
        </DataTableWrapper>
      </motion.div>
    );
  };

  // ── 9. Research ──
  const renderResearch = () => {
    const filtered = research.filter((r) => {
      const q = searchQuery.toLowerCase();
      const ms = !q || r.name.toLowerCase().includes(q) || r.researchTopic.toLowerCase().includes(q);
      const mst = statusFilter === "all" || r.status === statusFilter;
      return ms && mst;
    });
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader title="Research" desc="Research collaboration inquiries" />
        <DataTableWrapper searchPlaceholder="Search research...">
          <table className="w-full">
            <thead><tr><THead>Name</THead><THead>Topic</THead><THead>Collaboration</THead><THead>Status</THead><THead className="text-right">Actions</THead></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No research inquiries found</td></tr>}
              {filtered.map((r) => (
                <TRow key={r.id} onClick={() => openDetailDialog("research", r as unknown as Record<string, unknown>)}>
                  <TCell className="font-medium">{r.name}</TCell>
                  <TCell className="text-muted-foreground">{r.researchTopic}</TCell>
                  <TCell><Badge variant="outline" className="text-xs capitalize">{(r.collaborationType || "other").replace(/_/g, " ")}</Badge></TCell>
                  <TCell><StatusBadge status={r.status} /></TCell>
                  <TCell className="text-right"><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("research", r.id, r.name); }}><Trash2 className="size-3.5" /></Button></TCell>
                </TRow>
              ))}
            </tbody>
          </table>
        </DataTableWrapper>
      </motion.div>
    );
  };

  // ── 10. Feedback ──
  const renderFeedback = () => {
    const filtered = feedback.filter((f) => {
      const q = searchQuery.toLowerCase();
      const ms = !q || f.name.toLowerCase().includes(q) || f.message.toLowerCase().includes(q);
      const mst = statusFilter === "all" || f.status === statusFilter;
      return ms && mst;
    });
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader title="Feedback" desc="User feedback and reviews" />
        <DataTableWrapper searchPlaceholder="Search feedback...">
          <table className="w-full">
            <thead><tr><THead>Name</THead><THead>Rating</THead><THead>Category</THead><THead>Message</THead><THead>Status</THead><THead className="text-right">Actions</THead></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No feedback found</td></tr>}
              {filtered.map((f) => (
                <TRow key={f.id} onClick={() => openDetailDialog("feedback", f as unknown as Record<string, unknown>)}>
                  <TCell className="font-medium">{f.isAnonymous ? "Anonymous" : f.name}</TCell>
                  <TCell><StarRating rating={f.rating} /></TCell>
                  <TCell><Badge variant="outline" className="text-xs capitalize">{f.category}</Badge></TCell>
                  <TCell className="text-muted-foreground max-w-xs truncate">{f.message}</TCell>
                  <TCell><StatusBadge status={f.status} /></TCell>
                  <TCell className="text-right"><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("feedback", f.id, f.name); }}><Trash2 className="size-3.5" /></Button></TCell>
                </TRow>
              ))}
            </tbody>
          </table>
        </DataTableWrapper>
      </motion.div>
    );
  };

  // ── 11. Suggestions ──
  const renderSuggestions = () => {
    const filtered = suggestions.filter((s) => {
      const q = searchQuery.toLowerCase();
      const ms = !q || s.title.toLowerCase().includes(q);
      const mst = statusFilter === "all" || s.status === statusFilter;
      return ms && mst;
    });
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader title="Suggestions" desc="User suggestions and ideas" />
        <DataTableWrapper searchPlaceholder="Search suggestions...">
          <table className="w-full">
            <thead><tr><THead>Title</THead><THead>Category</THead><THead>Priority</THead><THead>Status</THead><THead className="text-right">Actions</THead></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No suggestions found</td></tr>}
              {filtered.map((s) => (
                <TRow key={s.id} onClick={() => openDetailDialog("suggestions", s as unknown as Record<string, unknown>)}>
                  <TCell><div className="font-medium">{s.title}</div><div className="text-xs text-muted-foreground max-w-xs truncate">{s.description}</div></TCell>
                  <TCell><Badge variant="outline" className="text-xs capitalize">{s.category}</Badge></TCell>
                  <TCell><Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[s.priority] || ""}`}>{s.priority}</Badge></TCell>
                  <TCell><StatusBadge status={s.status} /></TCell>
                  <TCell className="text-right"><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("suggestions", s.id, s.title); }}><Trash2 className="size-3.5" /></Button></TCell>
                </TRow>
              ))}
            </tbody>
          </table>
        </DataTableWrapper>
      </motion.div>
    );
  };

  // ── 12. Users & Roles ──
  const renderUsersRoles = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <AdminPageHeader title="Users & Roles" desc="Manage users and permissions" />
      <Tabs value={usersSubTab} onValueChange={setUsersSubTab} className="mb-4">
        <TabsList><TabsTrigger value="users">Users</TabsTrigger><TabsTrigger value="roles">Roles</TabsTrigger></TabsList>
      </Tabs>

      {usersSubTab === "users" && (
        <GlassCard>
          <div className="p-4 border-b border-[var(--glass-border)] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 w-full sm:w-64" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="editor">Editor</SelectItem><SelectItem value="user">User</SelectItem></SelectContent>
              </Select>
            </div>
            <Button onClick={() => setUserDialogOpen(true)} className="btn-glow"><Plus className="size-4 mr-2" />Create User</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><THead>Name</THead><THead>Email</THead><THead>Role</THead><THead>Status</THead><THead>Joined</THead><THead className="text-right">Actions</THead></tr></thead>
              <tbody>
                {users.filter(u => {
                  const q = searchQuery.toLowerCase();
                  const ms = !q || (u.name || "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                  const mr = statusFilter === "all" || u.role === statusFilter;
                  return ms && mr;
                }).map((u) => (
                  <TRow key={u.id}>
                    <TCell><div className="flex items-center gap-2"><div className="size-8 rounded-full bg-primary/20 flex items-center justify-center"><span className="text-xs font-bold text-primary">{(u.name || "U").charAt(0).toUpperCase()}</span></div><span className="font-medium">{u.name || "—"}</span></div></TCell>
                    <TCell className="text-muted-foreground">{u.email}</TCell>
                    <TCell>
                      <Select value={u.role} onValueChange={(v) => handleUpdateUser(u.id, { role: v })}>
                        <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="editor">Editor</SelectItem><SelectItem value="user">User</SelectItem></SelectContent>
                      </Select>
                    </TCell>
                    <TCell><Badge variant={u.isActive ? "default" : "secondary"} className="text-xs cursor-pointer" onClick={() => handleUpdateUser(u.id, { isActive: !u.isActive })}>{u.isActive ? "Active" : "Inactive"}</Badge></TCell>
                    <TCell className="text-muted-foreground">{fmtDate(u.created_at)}</TCell>
                    <TCell className="text-right"><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("users", u.id, u.email); }}><Trash2 className="size-3.5" /></Button></TCell>
                  </TRow>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {usersSubTab === "roles" && (
        <GlassCard>
          <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between">
            <h3 className="font-semibold">Roles & Permissions</h3>
            <Button onClick={() => setRoleDialogOpen(true)} className="btn-glow"><Plus className="size-4 mr-2" />Create Role</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><THead>Name</THead><THead>Description</THead><THead>Permissions</THead><THead>System</THead><THead className="text-right">Actions</THead></tr></thead>
              <tbody>
                {roles.map((r) => (
                  <TRow key={r.id}>
                    <TCell className="font-medium">{r.name}</TCell>
                    <TCell className="text-muted-foreground">{r.description || "—"}</TCell>
                    <TCell><div className="flex flex-wrap gap-1">{r.permissions.split(",").filter(Boolean).map((p) => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}</div></TCell>
                    <TCell>{r.isSystem && <Badge className="text-xs bg-primary/10 text-primary">System</Badge>}</TCell>
                    <TCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingRole(r); setEditRoleForm({ description: r.description || "", permissions: r.permissions.split(",").filter(Boolean) }); setEditRoleDialogOpen(true); }}><Pencil className="size-3.5" /></Button>
                        {!r.isSystem && <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("roles", r.id, r.name); }}><Trash2 className="size-3.5" /></Button>}
                      </div>
                    </TCell>
                  </TRow>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </motion.div>
  );

  // ── 13. Status & Maintenance ──
  const renderStatusMaintenance = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <AdminPageHeader title="Status & Maintenance" desc="System status and scheduled maintenance" />
      <Tabs value={statusSubTab} onValueChange={setStatusSubTab} className="mb-4">
        <TabsList><TabsTrigger value="incidents">Incidents</TabsTrigger><TabsTrigger value="maintenance">Maintenance</TabsTrigger></TabsList>
      </Tabs>

      {statusSubTab === "incidents" && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={() => openCreateDialog("incidents")} className="btn-glow"><Plus className="size-4 mr-2" />Create Incident</Button>
          </div>
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr><THead>Title</THead><THead>Service</THead><THead>Severity</THead><THead>Status</THead><THead>Started</THead><THead className="text-right">Actions</THead></tr></thead>
                <tbody>
                  {incidents.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No incidents found</td></tr>}
                  {incidents.map((inc) => (
                    <TRow key={inc.id}>
                      <TCell className="font-medium">{inc.title}</TCell>
                      <TCell className="text-muted-foreground">{inc.service}</TCell>
                      <TCell><Badge variant="outline" className={`text-xs ${SEVERITY_COLORS[inc.severity] || ""}`}>{inc.severity}</Badge></TCell>
                      <TCell><StatusBadge status={inc.status} /></TCell>
                      <TCell className="text-muted-foreground">{fmtDateTime(inc.startedAt)}</TCell>
                      <TCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditDialog("incidents", inc as unknown as Record<string, unknown>); }}><Pencil className="size-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("incidents", inc.id, inc.title); }}><Trash2 className="size-3.5" /></Button>
                        </div>
                      </TCell>
                    </TRow>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
          {/* Services Status */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Services Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Website", "API", "Chat", "Database"].map((svc) => {
                const active = incidents.some(i => i.service === svc && i.status !== "resolved");
                return (
                  <GlassCard key={svc} className="p-3 flex items-center gap-3">
                    <div className={`size-3 rounded-full ${active ? "bg-red-400 animate-pulse" : "bg-green-400"}`} />
                    <div><p className="text-sm font-medium">{svc}</p><p className="text-xs text-muted-foreground">{active ? "Degraded" : "Operational"}</p></div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </>
      )}

      {statusSubTab === "maintenance" && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={() => openCreateDialog("maintenance")} className="btn-glow"><Plus className="size-4 mr-2" />Schedule Maintenance</Button>
          </div>
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr><THead>Title</THead><THead>Service</THead><THead>Start</THead><THead>End</THead><THead>Status</THead><THead className="text-right">Actions</THead></tr></thead>
                <tbody>
                  {maintenance.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No maintenance scheduled</td></tr>}
                  {maintenance.map((m) => (
                    <TRow key={m.id}>
                      <TCell className="font-medium">{m.title}</TCell>
                      <TCell className="text-muted-foreground">{m.service}</TCell>
                      <TCell className="text-muted-foreground">{fmtDateTime(m.scheduledStart)}</TCell>
                      <TCell className="text-muted-foreground">{fmtDateTime(m.scheduledEnd)}</TCell>
                      <TCell><StatusBadge status={m.status} /></TCell>
                      <TCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditDialog("maintenance", m as unknown as Record<string, unknown>); }}><Pencil className="size-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); confirmDelete("maintenance", m.id, m.title); }}><Trash2 className="size-3.5" /></Button>
                        </div>
                      </TCell>
                    </TRow>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}
    </motion.div>
  );

  // ── 14. Chat Monitor ──
  const renderChatMonitor = () => {
    const sessions = [...new Set(chatLogs.map(l => l.sessionId))];
    const todayLogs = chatLogs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString());
    const avgResponseLen = chatLogs.length > 0 ? Math.round(chatLogs.reduce((a, l) => a + l.botResponse.length, 0) / chatLogs.length) : 0;

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader title="Chat Monitor" desc="Monitor AI chat conversations" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <GlassCard className="p-4 text-center"><p className="text-2xl font-bold text-cyan-400">{sessions.length}</p><p className="text-xs text-muted-foreground mt-1">Total Sessions</p></GlassCard>
          <GlassCard className="p-4 text-center"><p className="text-2xl font-bold text-green-400">{todayLogs.length}</p><p className="text-xs text-muted-foreground mt-1">Messages Today</p></GlassCard>
          <GlassCard className="p-4 text-center"><p className="text-2xl font-bold text-purple-400">{avgResponseLen}</p><p className="text-xs text-muted-foreground mt-1">Avg Response Length</p></GlassCard>
        </div>

        {/* Logs Table */}
        <GlassCard>
          <div className="p-4 border-b border-[var(--glass-border)]">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search chat logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr><THead>Session ID</THead><THead>User Message</THead><THead>Timestamp</THead><THead>IP</THead><THead className="text-right">View</THead></tr></thead>
              <tbody>
                {chatLogs.filter(l => {
                  const q = searchQuery.toLowerCase();
                  return !q || l.userMessage.toLowerCase().includes(q) || l.sessionId.toLowerCase().includes(q);
                }).slice(0, 50).map((log) => (
                  <TRow key={log.id} onClick={() => openDetailDialog("chatLog", log as unknown as Record<string, unknown>)}>
                    <TCell><code className="text-xs bg-muted px-2 py-0.5 rounded">{log.sessionId.slice(0, 8)}...</code></TCell>
                    <TCell className="max-w-xs truncate text-muted-foreground">{log.userMessage}</TCell>
                    <TCell className="text-muted-foreground">{fmtDateTime(log.created_at)}</TCell>
                    <TCell className="text-muted-foreground">{log.ipAddress || "—"}</TCell>
                    <TCell className="text-right"><Button variant="ghost" size="sm"><Eye className="size-3.5" /></Button></TCell>
                  </TRow>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    );
  };

  // ── 15. Performance ──
  const renderPerformance = () => {
    const metrics = [
      { label: "API Requests", value: "12,847", change: "+12%", icon: TrendingUp, color: "text-green-400" },
      { label: "Avg Response Time", value: "142ms", change: "-8%", icon: TrendingDown, color: "text-cyan-400" },
      { label: "Error Rate", value: "0.24%", change: "-3%", icon: Shield, color: "text-purple-400" },
      { label: "Uptime", value: "99.97%", change: "+0.02%", icon: CheckCircle2, color: "text-emerald-400" },
    ];

    const chartDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const requestCounts = [85, 72, 95, 68, 92, 55, 78];
    const responseTimes = [45, 55, 35, 60, 40, 70, 50];

    const memUsage = typeof window !== "undefined" ? (window as unknown as Record<string, { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }>).performance?.memory : null;

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <AdminPageHeader title="Performance" desc="System performance metrics" />

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <GlassCard key={m.label} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`size-5 ${m.color}`} />
                  <Badge variant="outline" className="text-xs text-green-400 border-green-400/20">{m.change}</Badge>
                </div>
                <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-space-grotesk)" }}>{m.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
              </GlassCard>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* API Requests Chart */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold mb-3">API Requests (7 Days)</h3>
            <div className="flex items-end gap-2 h-40">
              {chartDays.map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: "130px" }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${requestCounts[i]}%` }} transition={{ delay: i * 0.05, duration: 0.4 }} className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-cyan-500/60 to-cyan-500/20" />
                  </div>
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Response Time Chart */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold mb-3">Response Time (7 Days)</h3>
            <div className="flex items-end gap-2 h-40">
              {chartDays.map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative" style={{ height: "130px" }}>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${responseTimes[i]}%` }} transition={{ delay: i * 0.05, duration: 0.4 }} className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-purple-500/60 to-purple-500/20" />
                  </div>
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Memory & System Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold mb-4">Memory Usage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Heap Used</span><span>~45 MB</span></div>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-cyan-400" style={{ width: "45%" }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Heap Total</span><span>~80 MB</span></div>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-purple-400" style={{ width: "80%" }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">RSS</span><span>~120 MB</span></div>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-green-400" style={{ width: "60%" }} /></div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold mb-4">System Info</h3>
            <div className="space-y-3">
              {[
                { icon: Cpu, label: "Runtime", value: "Next.js 16 (Turbopack)" },
                { icon: Server, label: "Database", value: "Supabase (PostgreSQL)" },
                { icon: HardDrive, label: "Storage", value: "Backblaze B2 Cloud Storage" },
                { icon: Wifi, label: "CDN", value: "Edge Cached" },
                { icon: Shield, label: "Auth", value: "Role-Based Access" },
                { icon: Zap, label: "Caching", value: "In-Memory LRU" },
              ].map((info) => {
                const Icon = info.icon;
                return (
                  <div key={info.label} className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="size-4 text-primary" /></div>
                    <div className="flex-1"><p className="text-sm font-medium">{info.label}</p><p className="text-xs text-muted-foreground">{info.value}</p></div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTENT FORM RENDERER
  // ═══════════════════════════════════════════════════════════════════════════

  const renderContentForm = () => {
    const type = editingContent ? editingContent.type : (activeTab === "newsletter" ? "newsletters" : activeTab === "events" ? "events" : activeTab === "careers" ? "careers" : statusSubTab === "incidents" ? "incidents" : "maintenance");

    if (type === "news") {
      return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div><Label>Title</Label><Input value={newsForm.title} onChange={(e) => setNewsForm(f => ({ ...f, title: e.target.value }))} placeholder="News title" /></div>
          <div><Label>Slug (auto)</Label><Input value={genSlug(newsForm.title)} disabled className="opacity-60" /></div>
          <div><Label>Excerpt</Label><Textarea value={newsForm.excerpt} onChange={(e) => setNewsForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Brief summary..." rows={2} /></div>
          <div><Label>Content</Label><RichTextEditor value={newsForm.content} onChange={(html) => setNewsForm(f => ({ ...f, content: html }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Cover Image URL</Label><Input value={newsForm.coverImage} onChange={(e) => setNewsForm(f => ({ ...f, coverImage: e.target.value }))} placeholder="https://..." /></div>
            <div><Label>Category</Label><Select value={newsForm.category} onValueChange={(v) => setNewsForm(f => ({ ...f, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Company">Company</SelectItem><SelectItem value="Industry">Industry</SelectItem><SelectItem value="Security Alert">Security Alert</SelectItem></SelectContent></Select></div>
          </div>
          <div className="flex items-center gap-3"><Switch checked={newsForm.isPublished} onCheckedChange={(v) => setNewsForm(f => ({ ...f, isPublished: v }))} /><Label>{newsForm.isPublished ? "Published" : "Draft"}</Label></div>
        </div>
      );
    }

    if (type === "events") {
      return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div><Label>Title</Label><Input value={eventForm.title} onChange={(e) => setEventForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title" /></div>
          <div><Label>Description</Label><Textarea value={eventForm.description} onChange={(e) => setEventForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." rows={2} /></div>
          <div><Label>Content</Label><RichTextEditor value={eventForm.content} onChange={(html) => setEventForm(f => ({ ...f, content: html }))} /></div>
          <div><Label>Cover Image URL</Label><Input value={eventForm.coverImage} onChange={(e) => setEventForm(f => ({ ...f, coverImage: e.target.value }))} placeholder="https://..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Event Type</Label><Select value={eventForm.eventType} onValueChange={(v) => setEventForm(f => ({ ...f, eventType: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="webinar">Webinar</SelectItem><SelectItem value="workshop">Workshop</SelectItem><SelectItem value="conference">Conference</SelectItem><SelectItem value="meetup">Meetup</SelectItem></SelectContent></Select></div>
            <div><Label>Location</Label><Input value={eventForm.location} onChange={(e) => setEventForm(f => ({ ...f, location: e.target.value }))} placeholder="Online or physical" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Event Date</Label><Input type="datetime-local" value={eventForm.eventDate} onChange={(e) => setEventForm(f => ({ ...f, eventDate: e.target.value }))} /></div>
            <div><Label>End Date</Label><Input type="datetime-local" value={eventForm.endDate} onChange={(e) => setEventForm(f => ({ ...f, endDate: e.target.value }))} /></div>
          </div>
          <div><Label>Registration URL</Label><Input value={eventForm.registrationUrl} onChange={(e) => setEventForm(f => ({ ...f, registrationUrl: e.target.value }))} placeholder="https://..." /></div>
          <div className="flex items-center gap-3"><Switch checked={eventForm.isPublished} onCheckedChange={(v) => setEventForm(f => ({ ...f, isPublished: v }))} /><Label>{eventForm.isPublished ? "Published" : "Draft"}</Label></div>
        </div>
      );
    }

    if (type === "careers") {
      return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div><Label>Title</Label><Input value={careerForm.title} onChange={(e) => setCareerForm(f => ({ ...f, title: e.target.value }))} placeholder="Job title" /></div>
          <div><Label>Description</Label><RichTextEditor value={careerForm.description} onChange={(html) => setCareerForm(f => ({ ...f, description: html }))} /></div>
          <div><Label>Requirements</Label><RichTextEditor value={careerForm.requirements} onChange={(html) => setCareerForm(f => ({ ...f, requirements: html }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Location</Label><Input value={careerForm.location} onChange={(e) => setCareerForm(f => ({ ...f, location: e.target.value }))} placeholder="City, Country" /></div>
            <div><Label>Job Type</Label><Select value={careerForm.jobType} onValueChange={(v) => setCareerForm(f => ({ ...f, jobType: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Internship">Internship</SelectItem><SelectItem value="Contract">Contract</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Department</Label><Input value={careerForm.department} onChange={(e) => setCareerForm(f => ({ ...f, department: e.target.value }))} placeholder="Engineering" /></div>
            <div><Label>Experience</Label><Input value={careerForm.experience} onChange={(e) => setCareerForm(f => ({ ...f, experience: e.target.value }))} placeholder="0-1 years" /></div>
          </div>
          <div><Label>Salary</Label><Input value={careerForm.salary} onChange={(e) => setCareerForm(f => ({ ...f, salary: e.target.value }))} placeholder="e.g., ₹5-8 LPA" /></div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><Switch checked={careerForm.isRemote} onCheckedChange={(v) => setCareerForm(f => ({ ...f, isRemote: v }))} /><Label>Remote</Label></div>
            <div className="flex items-center gap-2"><Switch checked={careerForm.isActive} onCheckedChange={(v) => setCareerForm(f => ({ ...f, isActive: v }))} /><Label>Active</Label></div>
          </div>
        </div>
      );
    }

    if (type === "newsletters") {
      return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div><Label>Title</Label><Input value={newsletterForm.title} onChange={(e) => setNewsletterForm(f => ({ ...f, title: e.target.value }))} placeholder="Newsletter title" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Issue Number</Label><Input type="number" value={newsletterForm.issueNumber} onChange={(e) => setNewsletterForm(f => ({ ...f, issueNumber: parseInt(e.target.value) || 1 }))} /></div>
            <div><Label>Cover Image URL</Label><Input value={newsletterForm.coverImage} onChange={(e) => setNewsletterForm(f => ({ ...f, coverImage: e.target.value }))} placeholder="https://..." /></div>
          </div>
          <div><Label>Content</Label><RichTextEditor value={newsletterForm.content} onChange={(html) => setNewsletterForm(f => ({ ...f, content: html }))} /></div>
          <div className="flex items-center gap-3"><Switch checked={newsletterForm.isPublished} onCheckedChange={(v) => setNewsletterForm(f => ({ ...f, isPublished: v }))} /><Label>{newsletterForm.isPublished ? "Published" : "Draft"}</Label></div>
        </div>
      );
    }

    if (type === "incidents") {
      return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div><Label>Title</Label><Input value={incidentForm.title} onChange={(e) => setIncidentForm(f => ({ ...f, title: e.target.value }))} placeholder="Incident title" /></div>
          <div><Label>Description</Label><Textarea value={incidentForm.description} onChange={(e) => setIncidentForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the incident..." rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Service</Label><Input value={incidentForm.service} onChange={(e) => setIncidentForm(f => ({ ...f, service: e.target.value }))} placeholder="e.g., Website, API" /></div>
            <div><Label>Severity</Label><Select value={incidentForm.severity} onValueChange={(v) => setIncidentForm(f => ({ ...f, severity: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="minor">Minor</SelectItem><SelectItem value="major">Major</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Status</Label><Select value={incidentForm.status} onValueChange={(v) => setIncidentForm(f => ({ ...f, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="investigating">Investigating</SelectItem><SelectItem value="identified">Identified</SelectItem><SelectItem value="monitoring">Monitoring</SelectItem><SelectItem value="resolved">Resolved</SelectItem></SelectContent></Select></div>
            <div><Label>Started At</Label><Input type="datetime-local" value={incidentForm.startedAt} onChange={(e) => setIncidentForm(f => ({ ...f, startedAt: e.target.value }))} /></div>
          </div>
          {incidentForm.status === "resolved" && <div><Label>Resolved At</Label><Input type="datetime-local" value={incidentForm.resolvedAt} onChange={(e) => setIncidentForm(f => ({ ...f, resolvedAt: e.target.value }))} /></div>}
        </div>
      );
    }

    if (type === "maintenance") {
      return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div><Label>Title</Label><Input value={maintenanceForm.title} onChange={(e) => setMaintenanceForm(f => ({ ...f, title: e.target.value }))} placeholder="Maintenance title" /></div>
          <div><Label>Description</Label><Textarea value={maintenanceForm.description} onChange={(e) => setMaintenanceForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the maintenance..." rows={3} /></div>
          <div><Label>Service</Label><Input value={maintenanceForm.service} onChange={(e) => setMaintenanceForm(f => ({ ...f, service: e.target.value }))} placeholder="e.g., Website, API, Database" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Scheduled Start</Label><Input type="datetime-local" value={maintenanceForm.scheduledStart} onChange={(e) => setMaintenanceForm(f => ({ ...f, scheduledStart: e.target.value }))} /></div>
            <div><Label>Scheduled End</Label><Input type="datetime-local" value={maintenanceForm.scheduledEnd} onChange={(e) => setMaintenanceForm(f => ({ ...f, scheduledEnd: e.target.value }))} /></div>
          </div>
          <div><Label>Status</Label><Select value={maintenanceForm.status} onValueChange={(v) => setMaintenanceForm(f => ({ ...f, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
        </div>
      );
    }

    return null;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DETAIL DIALOG RENDERER
  // ═══════════════════════════════════════════════════════════════════════════

  const renderDetailDialog = () => {
    if (!detailItem) return null;
    const d = detailItem as Record<string, string>;

    if (detailType === "chatLog") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs text-muted-foreground">Session ID</Label><p className="text-sm font-mono">{d.sessionId}</p></div>
            <div><Label className="text-xs text-muted-foreground">Timestamp</Label><p className="text-sm">{fmtDateTime(d.created_at)}</p></div>
            <div><Label className="text-xs text-muted-foreground">IP Address</Label><p className="text-sm">{d.ipAddress || "—"}</p></div>
            <div><Label className="text-xs text-muted-foreground">User Agent</Label><p className="text-sm truncate">{d.userAgent || "—"}</p></div>
          </div>
          <Separator />
          <div><Label className="text-xs text-muted-foreground">User Message</Label><div className="mt-1 p-3 rounded-lg bg-muted/50 text-sm">{d.userMessage}</div></div>
          <div><Label className="text-xs text-muted-foreground">Bot Response</Label><div className="mt-1 p-3 rounded-lg bg-primary/5 text-sm max-h-60 overflow-y-auto">{d.botResponse}</div></div>
        </div>
      );
    }

    if (detailType === "feedback") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs text-muted-foreground">Name</Label><p className="text-sm font-medium">{d.isAnonymous === "true" ? "Anonymous" : d.name}</p></div>
            <div><Label className="text-xs text-muted-foreground">Email</Label><p className="text-sm">{d.isAnonymous === "true" ? "—" : d.email}</p></div>
            <div><Label className="text-xs text-muted-foreground">Rating</Label><StarRating rating={parseInt(d.rating) || 0} /></div>
            <div><Label className="text-xs text-muted-foreground">Category</Label><Badge variant="outline" className="text-xs capitalize">{d.category}</Badge></div>
          </div>
          <div><Label className="text-xs text-muted-foreground">Message</Label><div className="mt-1 p-3 rounded-lg bg-muted/50 text-sm">{d.message}</div></div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Status</Label><Select value={detailStatus} onValueChange={setDetailStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="reviewed">Reviewed</SelectItem><SelectItem value="addressed">Addressed</SelectItem></SelectContent></Select></div>
          </div>
          <div><Label>Admin Reply</Label><Textarea value={detailReply} onChange={(e) => setDetailReply(e.target.value)} placeholder="Write a reply..." rows={3} /></div>
        </div>
      );
    }

    if (detailType === "suggestions") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs text-muted-foreground">Title</Label><p className="text-sm font-medium">{d.title}</p></div>
            <div><Label className="text-xs text-muted-foreground">Category</Label><Badge variant="outline" className="text-xs capitalize">{d.category}</Badge></div>
            <div><Label className="text-xs text-muted-foreground">Priority</Label><Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[d.priority] || ""}`}>{d.priority}</Badge></div>
            <div><Label className="text-xs text-muted-foreground">Submitted By</Label><p className="text-sm">{d.name || "Anonymous"}</p></div>
          </div>
          <div><Label className="text-xs text-muted-foreground">Description</Label><div className="mt-1 p-3 rounded-lg bg-muted/50 text-sm">{d.description}</div></div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Status</Label><Select value={detailStatus} onValueChange={setDetailStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="considering">Considering</SelectItem><SelectItem value="planned">Planned</SelectItem><SelectItem value="implemented">Implemented</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></div>
          </div>
          <div><Label>Admin Notes</Label><Textarea value={detailNotes} onChange={(e) => setDetailNotes(e.target.value)} placeholder="Add notes..." rows={3} /></div>
        </div>
      );
    }

    // Generic business detail (orders, partnerships, internships, research)
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-xs text-muted-foreground">Name</Label><p className="text-sm font-medium">{d.name}</p></div>
          <div><Label className="text-xs text-muted-foreground">Email</Label><p className="text-sm">{d.email}</p></div>
          {d.phone && <div><Label className="text-xs text-muted-foreground">Phone</Label><p className="text-sm">{d.phone}</p></div>}
          {d.company && <div><Label className="text-xs text-muted-foreground">Company</Label><p className="text-sm">{d.company}</p></div>}
          {d.orderType && <div><Label className="text-xs text-muted-foreground">Order Type</Label><Badge variant="outline" className="text-xs capitalize">{(d.orderType as string).replace(/_/g, " ")}</Badge></div>}
          {d.partnerType && <div><Label className="text-xs text-muted-foreground">Partner Type</Label><Badge variant="outline" className="text-xs capitalize">{d.partnerType}</Badge></div>}
          {d.college && <div><Label className="text-xs text-muted-foreground">College</Label><p className="text-sm">{d.college}</p></div>}
          {d.researchTopic && <div><Label className="text-xs text-muted-foreground">Topic</Label><p className="text-sm">{d.researchTopic}</p></div>}
          {d.collaborationType && <div><Label className="text-xs text-muted-foreground">Collaboration</Label><Badge variant="outline" className="text-xs capitalize">{(d.collaborationType as string).replace(/_/g, " ")}</Badge></div>}
          {d.role && <div><Label className="text-xs text-muted-foreground">Role</Label><p className="text-sm">{d.role}</p></div>}
          {d.budget && <div><Label className="text-xs text-muted-foreground">Budget</Label><p className="text-sm">{d.budget}</p></div>}
          {d.timeline && <div><Label className="text-xs text-muted-foreground">Timeline</Label><p className="text-sm">{d.timeline}</p></div>}
        </div>
        {(d.description || d.message) && <div><Label className="text-xs text-muted-foreground">Details</Label><div className="mt-1 p-3 rounded-lg bg-muted/50 text-sm">{d.description || d.message}</div></div>}
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Status</Label>
            <Select value={detailStatus} onValueChange={setDetailStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {detailType === "orders" && <><SelectItem value="new">New</SelectItem><SelectItem value="in_review">In Review</SelectItem><SelectItem value="accepted">Accepted</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="completed">Completed</SelectItem></>}
                {detailType === "partnerships" && <><SelectItem value="new">New</SelectItem><SelectItem value="in_review">In Review</SelectItem><SelectItem value="accepted">Accepted</SelectItem><SelectItem value="rejected">Rejected</SelectItem></>}
                {detailType === "internships" && <><SelectItem value="new">New</SelectItem><SelectItem value="reviewing">Reviewing</SelectItem><SelectItem value="shortlisted">Shortlisted</SelectItem><SelectItem value="accepted">Accepted</SelectItem><SelectItem value="rejected">Rejected</SelectItem></>}
                {detailType === "research" && <><SelectItem value="new">New</SelectItem><SelectItem value="in_review">In Review</SelectItem><SelectItem value="accepted">Accepted</SelectItem><SelectItem value="rejected">Rejected</SelectItem></>}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs text-muted-foreground">Submitted</Label><p className="text-sm">{fmtDateTime(d.created_at)}</p></div>
        </div>
        <div><Label>Admin Notes</Label><Textarea value={detailNotes} onChange={(e) => setDetailNotes(e.target.value)} placeholder="Add notes..." rows={3} /></div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════

  const renderSection = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "news": return renderNews();
      case "events": return renderEvents();
      case "careers": return renderCareers();
      case "newsletter": return renderNewsletter();
      case "orders": return renderOrders();
      case "partnerships": return renderPartnerships();
      case "internships": return renderInternships();
      case "research": return renderResearch();
      case "feedback": return renderFeedback();
      case "suggestions": return renderSuggestions();
      case "users-roles": return renderUsersRoles();
      case "status-maintenance": return renderStatusMaintenance();
      case "chat-monitor": return renderChatMonitor();
      case "performance": return renderPerformance();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-[var(--glass-border)] bg-[var(--glass-card-bg)] backdrop-blur-md transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-60"}`}>
        <AdminSidebarContent
          sidebarCollapsed={sidebarCollapsed}
          activeTab={activeTab}
          onTabClick={handleTabClick}
          onLogout={handleLogout}
          userInfo={userInfo}
        />
        <div className="p-2 border-t border-[var(--glass-border)]">
          <Button variant="ghost" size="sm" className="w-full" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-60 p-0 bg-[var(--glass-card-bg)] backdrop-blur-md">
          <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader>
          <AdminSidebarContent
            sidebarCollapsed={false}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            onLogout={handleLogout}
            userInfo={userInfo}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-4 sm:px-6 h-14 border-b border-[var(--glass-border)] bg-[var(--glass-card-bg)]/80 backdrop-blur-md">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="size-5" /></Button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold capitalize">{activeTab.replace(/-/g, " ")}</h2>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" asChild><Link href="/"><Globe className="size-4" /></Link></Button></TooltipTrigger><TooltipContent>View Site</TooltipContent></Tooltip></TooltipProvider>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive"><LogOut className="size-4" /></Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ─── Content Create/Edit Dialog ─── */}
      <Dialog open={contentDialogOpen} onOpenChange={setContentDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh]">
          <DialogHeader><DialogTitle>{editingContent ? "Edit" : "Create"} {(editingContent ? editingContent.type : activeTab).replace(/s$/, "").replace(/ie$/, "y")}</DialogTitle></DialogHeader>
          {renderContentForm()}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setContentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveContent} disabled={saving} className="btn-glow">{saving && <Loader2 className="size-4 mr-2 animate-spin" />}{editingContent ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Detail Dialog ─── */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle className="capitalize">{detailType.replace(/_/g, " ")} Details</DialogTitle></DialogHeader>
          {renderDetailDialog()}
          {detailType !== "chatLog" && (
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleDetailSave} disabled={saving} className="btn-glow">{saving && <Loader2 className="size-4 mr-2 animate-spin" />}Save Changes</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Create User Dialog ─── */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create User</DialogTitle><DialogDescription>Add a new user to the system</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={newUserForm.name} onChange={(e) => setNewUserForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
            <div><Label>Email</Label><Input type="email" value={newUserForm.email} onChange={(e) => setNewUserForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" /></div>
            <div><Label>Role</Label><Select value={newUserForm.role} onValueChange={(v) => setNewUserForm(f => ({ ...f, role: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="editor">Editor</SelectItem><SelectItem value="user">User</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setUserDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateUser} disabled={saving} className="btn-glow">{saving && <Loader2 className="size-4 mr-2 animate-spin" />}Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Create Role Dialog ─── */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create Role</DialogTitle><DialogDescription>Define a new role with permissions</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={newRoleForm.name} onChange={(e) => setNewRoleForm(f => ({ ...f, name: e.target.value }))} placeholder="Role name" /></div>
            <div><Label>Description</Label><Textarea value={newRoleForm.description} onChange={(e) => setNewRoleForm(f => ({ ...f, description: e.target.value }))} placeholder="Role description..." rows={2} /></div>
            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {ALL_PERMISSIONS.map((p) => (
                  <div key={p} className="flex items-center gap-2">
                    <Checkbox checked={newRoleForm.permissions.includes(p)} onCheckedChange={(checked) => {
                      setNewRoleForm(f => ({ ...f, permissions: checked ? [...f.permissions, p] : f.permissions.filter(x => x !== p) }));
                    }} />
                    <span className="text-xs">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateRole} disabled={saving} className="btn-glow">{saving && <Loader2 className="size-4 mr-2 animate-spin" />}Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Role Dialog ─── */}
      <Dialog open={editRoleDialogOpen} onOpenChange={setEditRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Role: {editingRole?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Description</Label><Textarea value={editRoleForm.description} onChange={(e) => setEditRoleForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {ALL_PERMISSIONS.map((p) => (
                  <div key={p} className="flex items-center gap-2">
                    <Checkbox checked={editRoleForm.permissions.includes(p)} onCheckedChange={(checked) => {
                      setEditRoleForm(f => ({ ...f, permissions: checked ? [...f.permissions, p] : f.permissions.filter(x => x !== p) }));
                    }} />
                    <span className="text-xs">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditRoleDialogOpen(false)}>Cancel</Button><Button onClick={handleUpdateRole} disabled={saving} className="btn-glow">{saving && <Loader2 className="size-4 mr-2 animate-spin" />}Update</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm Dialog ─── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirm Delete</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
