"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, ChevronDown, ChevronRight, LogIn, UserPlus, Sun, Moon,
  LogOut, UserCircle, LayoutDashboard, Briefcase, CalendarDays, Package,
  Handshake, Award, Activity, LayoutGrid, BookOpen, Globe, Server,
  Smartphone, Cloud, Shield, Brain, Cpu, Wifi, Code2, Palette, Megaphone,
  Settings, Wrench, FileText, ArrowRight, ShieldCheck, Lock, Bug,
  AlertTriangle, Database, Eye, Mail, HardDrive, Boxes, BookMarked,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthDialog from "@/components/AuthDialog";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useNavigation, type PageId } from "@/contexts/NavigationContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Mega-menu data                                                      */
/* ------------------------------------------------------------------ */

const SERVICES_MENU = [
  { label: "Software Development", href: "/services/software-development", icon: Code2, desc: "Custom apps & enterprise systems" },
  { label: "Website Development", href: "/services/website-development", icon: Globe, desc: "Modern, SEO-optimised websites" },
  { label: "Mobile Apps", href: "/services/mobile-apps", icon: Smartphone, desc: "iOS & Android native apps" },
  { label: "Cloud Solutions", href: "/services/cloud-solutions", icon: Cloud, desc: "AWS, Azure, GCP migration & ops" },
  { label: "AI Solutions", href: "/services/ai-solutions", icon: Brain, desc: "LLMs, ML pipelines & automation" },
  { label: "DevOps", href: "/services/devops", icon: Server, desc: "CI/CD, containers & IaC" },
  { label: "UI/UX Design", href: "/services/ui-ux-design", icon: Palette, desc: "Human-centred product design" },
  { label: "Digital Marketing", href: "/services/digital-marketing", icon: Megaphone, desc: "SEO, SEM, social & growth" },
  { label: "IT Consulting", href: "/services/it-consulting", icon: Settings, desc: "Strategy & technology advisory" },
  { label: "IoT & Embedded", href: "/services/iot", icon: Wifi, desc: "Smart devices & edge computing" },
  { label: "Machine Learning", href: "/services/machine-learning", icon: Cpu, desc: "Predictive models & analytics" },
  { label: "Automation", href: "/services/automation", icon: Boxes, desc: "RPA & workflow orchestration" },
  { label: "Maintenance & Support", href: "/services/maintenance-support", icon: Wrench, desc: "24/7 SLA-backed support" },
  { label: "IT Infrastructure", href: "/it-solutions", icon: HardDrive, desc: "Servers, networks & data centres" },
];

const PRODUCTS_MENU = [
  {
    label: "CyberIntelligence360",
    href: "https://cyberintelligence360.abwcurious.com",
    icon: "🛡️",
    logo: "/product/CyberIntelligence360.png",
    desc: "Enterprise AI-powered cybersecurity platform",
    badge: "Live",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  {
    label: "TheCodeArena",
    href: "https://www.thecodearena.co.in/",
    icon: "⚔️",
    logo: "/product/code-arena_logo.webp",
    desc: "Developer ecosystem for coding & collaboration",
    badge: "Live",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  {
    label: "Restaurant360",
    href: "#",
    icon: "🍽️",
    logo: "/product/restaurant360.png",
    desc: "All-in-one restaurant management SaaS",
    badge: "Live",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  {
    label: "StudySpark",
    href: "https://advancedstudyspark.vercel.app",
    icon: "📚",
    logo: "/product/StudySpark.png",
    desc: "AI-powered adaptive learning platform",
    badge: "Live",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  {
    label: "KapiKitab",
    href: "https://kapikitab.vercel.app",
    icon: "📖",
    logo: "/product/kapikitab.jpeg",
    desc: "Digital knowledge management & book discovery",
    badge: "Live",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  {
    label: "IntelliQR",
    href: "/products/intelliqr",
    icon: "📱",
    logo: "/product/intelliqr.jpeg",
    desc: "Dynamic QR codes with real-time analytics",
    badge: "Live",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
];

const CYBERSECURITY_MENU = [
  { label: "VAPT", href: "/cybersecurity", icon: Bug, desc: "Vulnerability assessment & pen testing" },
  { label: "SOC as a Service", href: "/cybersecurity", icon: Eye, desc: "24/7 security operations centre" },
  { label: "Cloud Security", href: "/cybersecurity", icon: Lock, desc: "Cloud posture management & CSPM" },
  { label: "Email Security", href: "/cybersecurity", icon: Mail, desc: "Anti-phishing & spam protection" },
  { label: "Incident Response", href: "/cybersecurity", icon: AlertTriangle, desc: "Rapid breach containment & recovery" },
  { label: "Compliance", href: "/cybersecurity", icon: ShieldCheck, desc: "ISO 27001, GDPR, SOC 2" },
];

/* ------------------------------------------------------------------ */
/*  Theme Toggle                                                        */
/* ------------------------------------------------------------------ */

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return (
    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" aria-label="Toggle theme">
      <Sun className="h-4 w-4" />
    </Button>
  );

  const isDark = resolvedTheme === "dark";
  return (
    <Button
      variant="ghost" size="icon"
      className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50 relative overflow-hidden"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div key="moon" initial={{ rotate: -90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}>
            <Moon className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div key="sun" initial={{ rotate: 90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.2 }}>
            <Sun className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  Mega Menu Panel                                                     */
/* ------------------------------------------------------------------ */

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  type: "services" | "products" | "cybersecurity";
  onPanelEnter?: () => void;
  onPanelLeave?: () => void;
}

function MegaMenu({ isOpen, onClose, type, onPanelEnter, onPanelLeave }: MegaMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 top-[var(--navbar-height)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            className="absolute top-full left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-b border-border/60 shadow-2xl"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" as const }}
            onMouseEnter={onPanelEnter}
            onMouseLeave={onPanelLeave}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {type === "services" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Our Services</h3>
                      <p className="text-sm text-muted-foreground">End-to-end technology solutions for modern businesses</p>
                    </div>
                    <Link href="/services" onClick={onClose} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
                      View all services <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {SERVICES_MENU.map((svc) => (
                      <Link
                        key={svc.href}
                        href={svc.href}
                        onClick={onClose}
                        className="group flex items-start gap-3 p-3 rounded-xl hover:bg-muted/60 transition-all duration-200"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mt-0.5 group-hover:bg-blue-500/20 transition-colors">
                          <svc.icon className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight">{svc.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{svc.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {type === "products" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Our Products</h3>
                      <p className="text-sm text-muted-foreground">SaaS platforms built for scale</p>
                    </div>
                    <Link href="/products" onClick={onClose} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
                      View all products <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {PRODUCTS_MENU.map((prod) => (
                      <Link
                        key={prod.href}
                        href={prod.href}
                        onClick={onClose}
                        className="group relative flex flex-col gap-3 p-4 rounded-2xl border border-border/40 hover:border-primary/30 bg-muted/20 hover:bg-muted/40 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          {prod.logo ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white dark:bg-gray-900 border border-border flex items-center justify-center">
                              <Image src={prod.logo} alt={prod.label} width={40} height={40} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <span className="text-3xl">{prod.icon}</span>
                          )}
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${prod.badgeColor}`}>{prod.badge}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{prod.label}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{prod.desc}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {type === "cybersecurity" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Cybersecurity</h3>
                      <p className="text-sm text-muted-foreground">Enterprise-grade security for the modern threat landscape</p>
                    </div>
                    <Link href="/cybersecurity" onClick={onClose} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
                      Full portfolio <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {CYBERSECURITY_MENU.map((svc) => (
                      <Link
                        key={svc.label}
                        href={svc.href}
                        onClick={onClose}
                        className="group flex items-start gap-3 p-3 rounded-xl hover:bg-muted/60 transition-all duration-200"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mt-0.5 group-hover:bg-red-500/20 transition-colors">
                          <svc.icon className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{svc.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{svc.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Nav link button (desktop)                                           */
/* ------------------------------------------------------------------ */

interface NavLinkProps {
  label: string;
  isActive?: boolean;
  hasDropdown?: boolean;
  isDropdownOpen?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
}

function NavLink({ label, isActive, hasDropdown, isDropdownOpen, onClick, href }: NavLinkProps) {
  const cls = `relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1 ${isActive ? "text-primary nav-active-glow" : "text-muted-foreground hover:text-foreground"}`;

  const content = (
    <>
      {isActive && (
        <motion.div layoutId="nav-active" className="absolute inset-0 rounded-lg" style={{ background: "rgba(8,145,178,0.1)", border: "1px solid rgba(8,145,178,0.18)", boxShadow: "0 0 12px rgba(0,240,255,0.08)" }} transition={{ type: "spring", stiffness: 380, damping: 32 }} />
      )}
      <span className="relative z-10">{label}</span>
      {hasDropdown && (
        <ChevronDown className={`relative z-10 h-3.5 w-3.5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
      )}
    </>
  );

  if (href && !onClick) {
    return <Link href={href} className={cls}>{content}</Link>;
  }

  return (
    <button onClick={onClick} className={cls} type="button">
      {content}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Navbar                                                         */
/* ------------------------------------------------------------------ */

type MegaMenuType = "services" | "products" | "cybersecurity" | null;

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [activeMega, setActiveMega] = useState<MegaMenuType>(null);
  const [activeSection, setActiveSection] = useState("");
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const { navigate, goHome, page } = useNavigation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleOpenAuth = (e: CustomEvent) => {
      setAuthMode(e.detail?.mode || "login");
      setAuthOpen(true);
    };
    window.addEventListener("abwcurious:open-auth", handleOpenAuth as EventListener);
    return () => window.removeEventListener("abwcurious:open-auth", handleOpenAuth as EventListener);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mega menu on outside click / escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActiveMega(null); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Hover-based mega menu with improved race condition handling
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingMegaRef = useRef<MegaMenuType>(null);

  const handleMegaHover = useCallback((type: MegaMenuType) => {
    // Cancel any pending leave
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    // Cancel any pending hover for a different menu
    if (hoverTimeoutRef.current && pendingMegaRef.current !== type) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // If already showing this menu, do nothing
    if (activeMega === type) return;
    
    pendingMegaRef.current = type;
    if (!hoverTimeoutRef.current) {
      hoverTimeoutRef.current = setTimeout(() => {
        setActiveMega(type);
        hoverTimeoutRef.current = null;
        pendingMegaRef.current = null;
      }, 100);
    }
  }, [activeMega]);

  const handleMegaLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
      pendingMegaRef.current = null;
    }
    if (!leaveTimeoutRef.current) {
      leaveTimeoutRef.current = setTimeout(() => {
        setActiveMega(null);
        leaveTimeoutRef.current = null;
      }, 600);
    }
  }, []);

  // Section detection (only on home)
  useEffect(() => {
    if (page.currentPage !== "home") return;
    const sectionIds = ["about", "products", "services", "cybersecurity", "contact"];
    let ticking = false;
    const detect = () => {
      ticking = false;
      const threshold = window.innerHeight * 0.25;
      let current = "", bestTop = -Infinity;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold && rect.top >= bestTop) { bestTop = rect.top; current = id; }
      }
      if (current) setActiveSection(current);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(detect); } };
    detect();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [page.currentPage]);

  const handleSectionClick = useCallback((e: React.MouseEvent, section: string) => {
    e.preventDefault();
    setActiveMega(null);
    if (page.currentPage !== "home") {
      goHome();
      setTimeout(() => { document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 300);
    } else {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileOpen(false);
  }, [page.currentPage, goHome]);

  const handlePageClick = useCallback((pageId: string) => {
    navigate(pageId as PageId);
    setMobileOpen(false);
  }, [navigate]);

  const toggleMega = (type: MegaMenuType) => {
    setActiveMega(prev => prev === type ? null : type);
  };

  const isDark = mounted ? theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) : false;
  const isOnDashboard = mounted && page.currentPage === "dashboard";

  return (
    <>
      {!isOnDashboard && (
        <header
          ref={navRef}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-background shadow-lg shadow-black/10 dark:shadow-black/20" : "bg-background/95 backdrop-blur-md"}`}
          style={{
            borderBottom: isScrolled
              ? `1px solid ${isDark ? "rgba(0,240,255,0.12)" : "rgba(8,145,178,0.12)"}`
              : `1px solid ${isDark ? "rgba(0,240,255,0.06)" : "rgba(8,145,178,0.06)"}`,
          }}
        >
          {/* Glow line */}
          <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none" style={{
            background: isScrolled
              ? `linear-gradient(90deg, transparent, ${isDark ? "rgba(0,240,255,0.3)" : "rgba(8,145,178,0.3)"}, transparent)`
              : `linear-gradient(90deg, transparent, ${isDark ? "rgba(0,240,255,0.1)" : "rgba(8,145,178,0.1)"}, transparent)`,
          }} />

          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Main row — taller header */}
            <div className="flex h-20 items-center justify-between lg:h-24">

              {/* ── Logo (2-3x bigger) ── */}
              <motion.a
                href="#"
                className="flex items-center gap-2.5 group shrink-0"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.preventDefault(); goHome(); setActiveMega(null); }}
              >
                <div className="relative">
                  <Image
                    src="/logo.svg"
                    alt="ABWcurious Logo"
                    width={240}
                    height={240}
                    className="h-20 w-auto object-contain sm:h-24 lg:h-28"
                    priority
                  />
                  <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </motion.a>

              {/* ── Desktop Nav ── */}
              <div
                className="hidden lg:flex items-center gap-0.5"
                onMouseEnter={() => {}}
              >
                {/* About — dedicated page */}
                <NavLink label="About" href="/about" isActive={false} />

                {/* Services mega-menu trigger */}
                <div
                  onMouseEnter={() => handleMegaHover("services")}
                  onMouseLeave={handleMegaLeave}
                >
                  <NavLink
                    label="Services"
                    href="/services"
                    hasDropdown
                    isDropdownOpen={activeMega === "services"}
                    isActive={activeMega === "services"}
                  />
                </div>

                {/* Products mega-menu trigger */}
                <div
                  onMouseEnter={() => handleMegaHover("products")}
                  onMouseLeave={handleMegaLeave}
                >
                  <NavLink
                    label="Products"
                    href="/products"
                    hasDropdown
                    isDropdownOpen={activeMega === "products"}
                    isActive={activeMega === "products"}
                  />
                </div>

                {/* Cybersecurity mega-menu trigger */}
                <div
                  onMouseEnter={() => handleMegaHover("cybersecurity")}
                  onMouseLeave={handleMegaLeave}
                >
                  <NavLink
                    label="Security"
                    href="/cybersecurity"
                    hasDropdown
                    isDropdownOpen={activeMega === "cybersecurity"}
                    isActive={activeMega === "cybersecurity"}
                  />
                </div>

                {/* Direct link pages */}
                <NavLink label="Blog" href="/blogs" isActive={false} />
                <NavLink label="Contact" href="/contact" isActive={false} />
              </div>

              {/* ── Desktop Actions ── */}
              <div className="flex items-center gap-2">
                {/* More dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hidden lg:flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm px-3 py-2 rounded-lg">
                      <LayoutGrid className="size-4" />
                      <span className="hidden lg:inline">Explore</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem asChild><Link href="/careers"><Briefcase className="mr-2 h-4 w-4" />Careers</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/events"><CalendarDays className="mr-2 h-4 w-4" />Events</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/research"><FileText className="mr-2 h-4 w-4" />Research</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/partnership"><Handshake className="mr-2 h-4 w-4" />Partnership</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/sponsorship"><Award className="mr-2 h-4 w-4" />Sponsorship</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/case-studies"><BookMarked className="mr-2 h-4 w-4" />Case Studies</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/it-solutions"><Database className="mr-2 h-4 w-4" />IT Solutions</Link></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ThemeToggle />
                {user && <NotificationBell />}

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm px-3 py-2 rounded-lg">
                        <UserCircle className="size-4" />
                        <span className="max-w-[100px] truncate">{user.name || user.email.split("@")[0]}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">{user.email}</div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handlePageClick("dashboard")}><UserCircle className="mr-2 h-4 w-4" />My Dashboard</DropdownMenuItem>
                      {(user.role === "admin" || user.role === "editor") && (
                        <DropdownMenuItem onClick={() => handlePageClick("dashboard")} className="text-primary focus:text-primary">
                          <LayoutDashboard className="mr-2 h-4 w-4" />Admin Panel
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { logout(); toast.success("Logged out successfully."); }} className="text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="hidden sm:block">
                      <Button variant="ghost" onClick={() => { setAuthMode("login"); setAuthOpen(true); }} className="text-muted-foreground hover:text-foreground text-sm px-4 py-2 rounded-lg">
                        <LogIn className="size-4 mr-1.5" />Login
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="hidden sm:block">
                      <Button onClick={() => { setAuthMode("signup"); setAuthOpen(true); }} className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm px-5 py-2 rounded-lg">
                        <UserPlus className="size-4 mr-1.5" />Sign Up
                      </Button>
                    </motion.div>
                  </>
                )}

                {/* Mobile hamburger */}
                <div className="flex items-center gap-1 xl:hidden">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => { setMobileOpen(true); setActiveMega(null); }} aria-label="Open menu">
                    <Menu className="size-5" />
                  </Button>
                </div>
              </div>
            </div>
          </nav>

          {/* ── Mega-Menu Panels ── */}
          <MegaMenu isOpen={activeMega === "services"} onClose={() => setActiveMega(null)} type="services" onPanelEnter={() => handleMegaHover("services")} onPanelLeave={handleMegaLeave} />
          <MegaMenu isOpen={activeMega === "products"} onClose={() => setActiveMega(null)} type="products" onPanelEnter={() => handleMegaHover("products")} onPanelLeave={handleMegaLeave} />
          <MegaMenu isOpen={activeMega === "cybersecurity"} onClose={() => setActiveMega(null)} type="cybersecurity" onPanelEnter={() => handleMegaHover("cybersecurity")} onPanelLeave={handleMegaLeave} />
        </header>
      )}

      {/* ── Mobile Sheet ── */}
      {!isOnDashboard && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="w-[320px] sm:w-[380px] bg-background/98 backdrop-blur-xl border-l border-border overflow-y-auto">
            <SheetHeader className="px-2 pb-4 border-b border-border/40">
              <SheetTitle className="flex items-center gap-2 text-left">
                <Image src="/logo.svg" alt="ABWcurious" width={120} height={120} className="h-14 w-auto object-contain" priority />
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-1 px-2 mt-4">
              {/* About — dedicated page */}
              <SheetClose asChild>
                <Link href="/about" className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                  <span className="flex items-center gap-3"><LayoutGrid className="size-4" />About</span>
                  <ChevronRight className="size-4 text-muted-foreground/40" />
                </Link>
              </SheetClose>

              {/* Services accordion */}
              <div>
                <button
                  onClick={() => setMobileExpanded(prev => prev === "services" ? null : "services")}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <span className="flex items-center gap-3"><Package className="size-4" />Services</span>
                  <ChevronDown className={`size-4 transition-transform ${mobileExpanded === "services" ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {mobileExpanded === "services" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="ml-4 pl-4 border-l border-border/40 py-1 space-y-0.5">
                        {SERVICES_MENU.slice(0, 8).map(svc => (
                          <SheetClose asChild key={svc.href}>
                            <Link href={svc.href} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                              <svc.icon className="size-3.5 text-blue-400" />{svc.label}
                            </Link>
                          </SheetClose>
                        ))}
                        <SheetClose asChild>
                          <Link href="/services" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary font-medium hover:bg-primary/5 transition-all">
                            <ArrowRight className="size-3.5" />All services
                          </Link>
                        </SheetClose>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Products accordion */}
              <div>
                <button
                  onClick={() => setMobileExpanded(prev => prev === "products" ? null : "products")}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <span className="flex items-center gap-3"><Boxes className="size-4" />Products</span>
                  <ChevronDown className={`size-4 transition-transform ${mobileExpanded === "products" ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {mobileExpanded === "products" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="ml-4 pl-4 border-l border-border/40 py-1 space-y-0.5">
                        {PRODUCTS_MENU.map(prod => (
                          <SheetClose asChild key={prod.href}>
                            <Link href={prod.href} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                              {prod.logo ? (
                                <div className="w-5 h-5 rounded overflow-hidden bg-white dark:bg-gray-900 border border-border flex items-center justify-center shrink-0">
                                  <Image src={prod.logo} alt={prod.label} width={20} height={20} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <span className="text-base">{prod.icon}</span>
                              )}{prod.label}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Security */}
              <SheetClose asChild>
                <Link href="/cybersecurity" className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                  <span className="flex items-center gap-3"><Shield className="size-4" />Cybersecurity</span>
                  <ChevronRight className="size-4 text-muted-foreground/40" />
                </Link>
              </SheetClose>

              {/* Blog */}
              <SheetClose asChild>
                <Link href="/blogs" className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                  <span className="flex items-center gap-3"><BookOpen className="size-4" />Blog</span>
                  <ChevronRight className="size-4 text-muted-foreground/40" />
                </Link>
              </SheetClose>

              {/* Contact — dedicated page */}
              <SheetClose asChild>
                <Link href="/contact" className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                  <span className="flex items-center gap-3"><Mail className="size-4" />Contact</span>
                  <ChevronRight className="size-4 text-muted-foreground/40" />
                </Link>
              </SheetClose>

              <div className="h-px bg-border/40 my-2" />

              {/* More links */}
              {[
                { href: "/careers", label: "Careers", icon: Briefcase },
                { href: "/events", label: "Events", icon: CalendarDays },
                { href: "/research", label: "Research", icon: FileText },
                { href: "/partnership", label: "Partnership", icon: Handshake },
              ].map(item => (
                <SheetClose asChild key={item.href}>
                  <Link href={item.href} className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                    <span className="flex items-center gap-3"><item.icon className="size-4" />{item.label}</span>
                    <ChevronRight className="size-3.5 text-muted-foreground/40" />
                  </Link>
                </SheetClose>
              ))}
            </div>

            {/* Auth */}
            <div className="mt-6 px-2 space-y-3">
              <div className="h-px bg-border/40" />
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <SheetClose asChild>
                    <Button onClick={() => handlePageClick("dashboard")} className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm py-2.5 rounded-lg">
                      <UserCircle className="size-4 mr-2" />My Dashboard
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="outline" onClick={() => { logout(); toast.success("Logged out."); }} className="w-full font-medium text-sm py-2.5 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10">
                      <LogOut className="size-4 mr-2" />Sign Out
                    </Button>
                  </SheetClose>
                </>
              ) : (
                <>
                  <SheetClose asChild>
                    <Button variant="outline" onClick={() => { setMobileOpen(false); setAuthMode("login"); setAuthOpen(true); }} className="w-full font-medium text-sm py-2.5 rounded-lg">
                      <LogIn className="size-4 mr-2" />Login
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button onClick={() => { setMobileOpen(false); setAuthMode("signup"); setAuthOpen(true); }} className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm py-2.5 rounded-lg">
                      <UserPlus className="size-4 mr-2" />Sign Up
                    </Button>
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {authOpen && (
        <AuthDialog isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultMode={authMode} />
      )}
    </>
  );
}
