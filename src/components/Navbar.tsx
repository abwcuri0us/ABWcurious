"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  ChevronRight,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  LogOut,
  UserCircle,
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  Package,
  Handshake,
  Award,
  Activity,
  LayoutGrid,
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthDialog from "@/components/AuthDialog";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useNavigation, type PageId } from "@/contexts/NavigationContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Navigation structure                                               */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  page?: string;       // sub-page navigation (hash-based)
  section?: string;    // home page section scroll
  icon: React.ElementType;
}

const headerSections: NavItem[] = [
  { label: "About", section: "about", icon: LayoutGrid },
  { label: "Products", section: "products", icon: Package },
  { label: "Services", section: "services", icon: Package },
  { label: "Cybersecurity", section: "cybersecurity", icon: Activity },
  { label: "Contact", section: "contact", icon: CalendarDays },
];

const explorePages: NavItem[] = [
  { label: "Careers", page: "careers", icon: Briefcase },
  { label: "Events", page: "events", icon: CalendarDays },
  { label: "Solutions", page: "solutions", icon: Package },
  { label: "Partnership", page: "partnership", icon: Handshake },
  { label: "Sponsorship", page: "sponsorship", icon: Award },
];

/* ------------------------------------------------------------------ */
/*  Theme Toggle                                                       */
/* ------------------------------------------------------------------ */

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50 relative overflow-hidden"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Moon className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Sun className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  Navbar Component                                                   */
/* ------------------------------------------------------------------ */

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const [activeSection, setActiveSection] = useState("");
  const { navigate, goHome, page } = useNavigation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for auth dialog open events from other components
  useEffect(() => {
    const handleOpenAuth = (e: CustomEvent) => {
      setAuthMode(e.detail?.mode || "login");
      setAuthOpen(true);
    };
    window.addEventListener("abwcurious:open-auth", handleOpenAuth as EventListener);
    return () => window.removeEventListener("abwcurious:open-auth", handleOpenAuth as EventListener);
  }, []);

  const handleLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  const handleSignup = () => {
    setAuthMode("signup");
    setAuthOpen(true);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
  };

  const handleAuthClose = useCallback(() => {
    setAuthOpen(false);
  }, []);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active section on home page.
  //
  // Most home-page sections (Products, Services, Cybersecurity, Contact, etc.)
  // are lazy-loaded with next/dynamic + { ssr: false }, so they are NOT in the
  // DOM when this effect first runs. A naive one-shot IntersectionObserver
  // setup only ever finds `about` (which is eagerly imported) — which is why
  // scrolling only ever highlighted the About tab.
  //
  // To handle this we use two complementary mechanisms:
  //   1. A scroll-based detector that re-queries the DOM on every scroll and
  //      picks the section whose top is closest to (but above) a threshold.
  //      This naturally handles sections that mount later.
  //   2. A MutationObserver that attaches an IntersectionObserver to any
  //      newly-added section element as soon as it appears in the DOM. This
  //      gives us smooth, real-time updates without waiting for a scroll
  //      event (e.g. when the user clicks a nav link and the page smooth-
  //      scrolls to a section).
  useEffect(() => {
    if (page.currentPage !== "home") return;

    const sectionIds = headerSections
      .map((l) => l.section)
      .filter((s): s is string => Boolean(s));

    let ticking = false;

    const detectActive = () => {
      ticking = false;
      // Use a threshold ~25% from the top of the viewport.
      const threshold = window.innerHeight * 0.25;
      let current = "";
      let bestTop = -Infinity;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // A section is "active" if its top has scrolled past the threshold
        // (i.e. it is the last section whose top is above the threshold).
        // Pick the section with the largest top that is still <= threshold,
        // OR the first section if we're at the very top.
        if (rect.top <= threshold) {
          if (rect.top >= bestTop) {
            bestTop = rect.top;
            current = id;
          }
        }
      }
      // If no section has scrolled past the threshold yet, default to the
      // first section that exists in the DOM (keeps something highlighted).
      if (!current) {
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (el) {
            current = id;
            break;
          }
        }
      }
      if (current) setActiveSection(current);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(detectActive);
      }
    };

    // Initial detection (catches the case where the page is already scrolled).
    detectActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // ---- IntersectionObserver layer (for smooth updates during smooth-scroll)
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -65% 0px",
      threshold: 0,
    };

    const observed = new Set<Element>();
    const io = new IntersectionObserver(observerCallback, observerOptions);

    const attachToExisting = () => {
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && !observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      }
    };
    attachToExisting();

    // Watch for sections that get added later (lazy-loaded) and observe them.
    const mo = new MutationObserver(() => {
      attachToExisting();
      // Also re-run the scroll-based detection so the active state is
      // correct immediately, without waiting for the next scroll event.
      detectActive();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
      mo.disconnect();
    };
  }, [page.currentPage]);

  // Handle home section click
  const handleSectionClick = useCallback(
    (e: React.MouseEvent, section: string) => {
      e.preventDefault();
      if (page.currentPage !== "home") {
        goHome();
        setTimeout(() => {
          const element = document.getElementById(section);
          if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      } else {
        const element = document.getElementById(section);
        if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setMobileOpen(false);
    },
    [page.currentPage, goHome]
  );

  // Handle feature page click
  const handlePageClick = useCallback(
    (pageId: string) => {
      navigate(pageId as PageId);
      setMobileOpen(false);
    },
    [navigate]
  );

  // Safe dark mode detection — avoids hydration mismatch by defaulting to false
  // until the component is mounted on the client
  const isDark = mounted
    ? theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    : false;

  // Determine if we should hide the navbar (dashboard has its own layout)
  // Only apply after mount to avoid hydration mismatch (currentPage defaults to "home" on server)
  const isOnDashboard = mounted && page.currentPage === "dashboard";

  return (
    <>
      {/* Header - hidden on dashboard page */}
      {!isOnDashboard && (
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-background shadow-lg shadow-black/10 dark:shadow-black/20"
            : "bg-background/95 backdrop-blur-sm"
        }`}
        style={{
          borderBottom: isScrolled
            ? `1px solid ${isDark ? "rgba(0, 240, 255, 0.12)" : "rgba(8, 145, 178, 0.12)"}`
            : `1px solid ${isDark ? "rgba(0, 240, 255, 0.06)" : "rgba(8, 145, 178, 0.06)"}`,
        }}
      >
        {/* Subtle glow line at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: isScrolled
              ? `linear-gradient(90deg, transparent, ${isDark ? "rgba(0, 240, 255, 0.3)" : "rgba(8, 145, 178, 0.3)"}, ${isDark ? "rgba(0, 102, 255, 0.2)" : "rgba(37, 99, 235, 0.2)"}, ${isDark ? "rgba(0, 240, 255, 0.3)" : "rgba(8, 145, 178, 0.3)"}, transparent)`
              : `linear-gradient(90deg, transparent, ${isDark ? "rgba(0, 240, 255, 0.1)" : "rgba(8, 145, 178, 0.1)"}, transparent)`,
          }}
        />

        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-[72px]">
            {/* Logo */}
            <motion.a
              href="#"
              className="flex items-center gap-2.5 group shrink-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                goHome();
              }}
            >
              <div className="relative">
                <Image
                  src="/logo.svg"
                  alt="ABWcurious Logo"
                  width={120}
                  height={120}
                  className="h-8 w-auto object-contain sm:h-10 lg:h-12"
                  priority
                />
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.a>

            {/* Desktop Navigation - Header Sections */}
            <div className="hidden xl:flex items-center gap-0.5">
              {headerSections.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.section;
                return (
                  <button
                    key={item.section}
                    onClick={(e) => handleSectionClick(e, item.section!)}
                    className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-1.5 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: "rgba(8, 145, 178, 0.06)",
                          border: "1px solid rgba(8, 145, 178, 0.1)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon className="h-3.5 w-3.5 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center gap-2">
              {/* Explore pages dropdown (on hover or click) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden lg:flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-sm px-3 py-2 rounded-lg"
                  >
                    <LayoutGrid className="size-4" />
                    <span className="hidden xl:inline">Explore</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {explorePages.map((item) => (
                    <DropdownMenuItem
                      key={item.page}
                      onClick={() => handlePageClick(item.page!)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notification Bell (only for logged-in users) */}
              {user && <NotificationBell />}

              {/* Auth Buttons or User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-medium text-sm px-3 py-2 rounded-lg"
                    >
                      <UserCircle className="size-4" />
                      <span className="max-w-[100px] truncate">{user.name || user.email.split("@")[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handlePageClick("dashboard")}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      My Dashboard
                    </DropdownMenuItem>
                    {(user.role === "admin" || user.role === "editor") && (
                      <DropdownMenuItem onClick={() => handlePageClick("dashboard")} className="text-primary focus:text-primary">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="hidden sm:block">
                    <Button
                      variant="ghost"
                      onClick={handleLogin}
                      className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-medium text-sm px-4 py-2 rounded-lg"
                    >
                      <LogIn className="size-4 mr-1.5" />
                      Login
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="hidden sm:block">
                    <Button
                      onClick={handleSignup}
                      className="btn-glow relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm px-5 py-2 rounded-lg hover:shadow-[0_0_25px_rgba(8,145,178,0.3)] transition-all duration-300"
                    >
                      <UserPlus className="size-4 mr-1.5" />
                      Sign Up
                    </Button>
                  </motion.div>
                </>
              )}

              {/* Mobile Menu Button */}
              <div className="flex items-center gap-1 xl:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-5" />
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </header>
      )}

      {/* Mobile Navigation Sheet - hidden on dashboard */}
      {!isOnDashboard && (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="right"
          className="w-[300px] sm:w-[350px] bg-background/95 backdrop-blur-xl border-l border-border"
        >
          <SheetHeader className="px-2">
            <SheetTitle className="flex items-center gap-2.5 text-left">
              <Image
                src="/logo.svg"
                alt="ABWcurious Logo"
                width={72}
                height={72}
                className="h-18 w-18 object-contain"
                priority
              />
            </SheetTitle>
          </SheetHeader>

          {/* Explore Pages */}
          <div className="flex flex-col gap-1 px-2 mt-4">
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Explore
            </p>
            <AnimatePresence>
              {explorePages.map((item, i) => {
                const Icon = item.icon;
                const isActive = page.currentPage === item.page;
                return (
                  <motion.div
                    key={item.page}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                  >
                    <SheetClose asChild>
                      <button
                        onClick={() => handlePageClick(item.page!)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                          isActive
                            ? "text-primary bg-primary/5 border border-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <Icon className="size-4" />
                        {item.label}
                        <ChevronRight
                          className={`size-4 ml-auto transition-transform duration-300 ${
                            isActive ? "text-primary translate-x-0.5" : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    </SheetClose>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Header Sections (Quick Links) */}
          <div className="flex flex-col gap-1 px-2 mt-4">
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Links
            </p>
            <AnimatePresence>
              {headerSections.map((item, i) => (
                <motion.div
                  key={item.section}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (explorePages.length + i) * 0.03, duration: 0.2 }}
                >
                  <SheetClose asChild>
                    <a
                      href={`#${item.section}`}
                      onClick={(e) => handleSectionClick(e, item.section!)}
                      className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="size-4" />
                        {item.label}
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground/40" />
                    </a>
                  </SheetClose>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile Auth Buttons */}
          <div className="mt-6 px-2 space-y-3">
            <div className="h-px bg-border" />
            {user ? (
              <>
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <SheetClose asChild>
                  <Button
                    onClick={() => { setMobileOpen(false); handlePageClick("dashboard"); }}
                    className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm py-3 rounded-lg"
                  >
                    <UserCircle className="size-4 mr-2" />
                    My Dashboard
                  </Button>
                </SheetClose>
                {(user.role === "admin" || user.role === "editor") && (
                  <SheetClose asChild>
                    <Button
                      onClick={() => { setMobileOpen(false); handlePageClick("dashboard"); }}
                      variant="outline"
                      className="w-full font-medium text-sm py-3 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <LayoutDashboard className="size-4 mr-2" />
                      Admin Panel
                    </Button>
                  </SheetClose>
                )}
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full font-medium text-sm py-3 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-4 mr-2" />
                    Sign Out
                  </Button>
                </SheetClose>
              </>
            ) : (
              <>
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    onClick={() => { setMobileOpen(false); handleLogin(); }}
                    className="w-full font-medium text-sm py-3 rounded-lg border-border"
                  >
                    <LogIn className="size-4 mr-2" />
                    Login
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    onClick={() => { setMobileOpen(false); handleSignup(); }}
                    className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm py-3 rounded-lg"
                  >
                    <UserPlus className="size-4 mr-2" />
                    Sign Up
                  </Button>
                </SheetClose>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
      )}

      {/* Auth Dialog — conditionally rendered to avoid mounting when closed */}
      {authOpen && (
        <AuthDialog
          isOpen={authOpen}
          onClose={handleAuthClose}
          defaultMode={authMode}
        />
      )}
    </>
  );
}
