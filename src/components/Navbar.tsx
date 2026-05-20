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
  LayoutList,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthDialog from "@/components/AuthDialog";
import LegalPageModal, { LegalPageType } from "@/components/LegalPageModal";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const AdminDashboard = dynamic(() => import("@/components/admin/AdminDashboard"), {
  ssr: false,
});

const UserDashboard = dynamic(() => import("@/components/user/UserDashboard"), {
  ssr: false,
});

interface NavLink {
  label: string;
  href: string;
  id: string;
}

const navLinks: NavLink[] = [
  { label: "About", href: "#about", id: "about" },
  { label: "Products", href: "#products", id: "products" },
  { label: "Services", href: "#services", id: "services" },
  { label: "Tech Stack", href: "#tech-stack", id: "tech-stack" },
  { label: "Contact", href: "#contact", id: "contact" },
];

// Helper to read user data from cookies instead of localStorage
function getCookieUser(): { name: string | null; email: string; avatar: string | null; role?: string } | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ');
  const userCookie = cookies.find((c) => c.startsWith('abwcurious_user='));
  if (!userCookie) return null;
  try {
    const value = decodeURIComponent(userCookie.split('=').slice(1).join('='));
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary/50 relative overflow-hidden"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Moon className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Sun className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [currentUser, setCurrentUser] = useState<{ name: string | null; email: string; avatar: string | null; role?: string } | null>(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [userDashboardOpen, setUserDashboardOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalType, setLegalType] = useState<LegalPageType>('terms');
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Check for stored session via cookies (httpOnly cookie for token, readable cookie for user data)
    const cookieUser = getCookieUser();
    if (cookieUser) {
      setCurrentUser(cookieUser);

      // Auto-refresh session every 30 minutes to prevent silent logout
      const refreshInterval = setInterval(async () => {
        try {
          const res = await fetch('/api/auth/refresh', { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data?.user) {
              setCurrentUser(data.data.user);
            }
          } else {
            // Session expired - clear user state
            setCurrentUser(null);
          }
        } catch {
          // Network error - keep existing session, try again later
        }
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(refreshInterval);
    }
  }, []);

  const handleLogin = () => {
    setAuthMode('login');
    setAuthOpen(true);
  };

  const handleSignup = () => {
    setAuthMode('signup');
    setAuthOpen(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setCurrentUser(null);
    toast.success('Logged out successfully.');
  };

  // Listen for auth dialog close to refresh user state
  const handleAuthClose = useCallback((userData?: { id?: string; name?: string | null; email?: string; avatar?: string | null; role?: string }) => {
    setAuthOpen(false);
    // If user data is provided directly from login response, use it (avoids cookie timing issues)
    if (userData && userData.email) {
      const user = {
        name: userData.name ?? null,
        email: userData.email,
        avatar: userData.avatar ?? null,
        role: userData.role,
      };
      setCurrentUser(user);
      // Redirect to dashboard based on role
      if (user.role === 'admin' || user.role === 'editor') {
        setDashboardOpen(true);
      } else {
        setUserDashboardOpen(true);
      }
    } else {
      // Fallback: re-check cookie user (for session restoration on page load)
      const cookieUser = getCookieUser();
      if (cookieUser) {
        setCurrentUser(cookieUser);
      }
    }
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    navLinks.forEach((link) => {
      const element = document.getElementById(link.id);
      if (element) {
        const observer = new IntersectionObserver(
          observerCallback,
          observerOptions
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      const id = href.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 80; // navbar height
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - headerOffset,
          behavior: "smooth",
        });
      }
      setMobileOpen(false);
    },
    []
  );

  const isDark = !mounted || theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Dynamic header background: solid dark in dark mode, solid white in light mode
  const headerBg = isDark ? 'bg-[#0a0f1c]' : 'bg-white';

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 ${headerBg} border-b border-border transition-all duration-300`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex h-20 items-center justify-between lg:h-20">
            {/* Logo */}
            <motion.a
              href="#"
              className="flex items-center gap-2.5 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="ABWcurious Logo"
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain"
                  priority
                  sizes="44px"
                />
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <span
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                <span className="text-gradient-cyan">ABW</span>
                <span className="text-foreground">curious</span>
              </span>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    activeSection === link.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {activeSection === link.id && (
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
                  <span className="relative z-10">{link.label}</span>
                </a>
              ))}
            </div>

            {/* Desktop Actions: Theme + Auth + Mobile Toggle */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <ThemeToggle />

              
              {/* Mobile Menu Button */}
              <div className="flex items-center gap-1 lg:hidden">
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
      </motion.header>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="right"
          className="w-[300px] sm:w-[350px] bg-background/95 backdrop-blur-xl border-l border-border"
        >
          <SheetHeader className="px-2">
            <SheetTitle className="flex items-center gap-2.5 text-left">
              <Image
                src="/logo.png"
                alt="ABWcurious Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                sizes="32px"
              />
              <span
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                <span className="text-gradient-cyan">ABW</span>
                <span className="text-foreground">curious</span>
              </span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-1 px-2 mt-4">
            <AnimatePresence>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <SheetClose asChild>
                    <a
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        activeSection === link.id
                          ? "text-primary bg-primary/5 border border-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {link.label}
                      <ChevronRight
                        className={`size-4 transition-transform duration-300 ${
                          activeSection === link.id
                            ? "text-primary translate-x-0.5"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </a>
                  </SheetClose>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile Auth Buttons */}
          <div className="mt-6 px-2 space-y-3">
            <div className="h-px bg-border" />
            {currentUser ? (
              <>
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{currentUser.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  </div>
                </div>
                <SheetClose asChild>
                  <Button
                    onClick={() => { setMobileOpen(false); setUserDashboardOpen(true); }}
                    className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm py-3 rounded-lg"
                  >
                    <LayoutList className="size-4 mr-2" />
                    My Dashboard
                  </Button>
                </SheetClose>
                {(currentUser.role === 'admin' || currentUser.role === 'editor') && (
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      onClick={() => { setMobileOpen(false); setDashboardOpen(true); }}
                      className="w-full font-medium text-sm py-3 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <LayoutDashboard className="size-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </SheetClose>
                )}
                
              </>
            ) : (
              <>
                
                
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={authOpen}
        onClose={handleAuthClose}
        defaultMode={authMode}
        onOpenLegal={(type) => { setLegalType(type); setLegalOpen(true); }}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        user={currentUser}
      />

      {/* User Dashboard */}
      <UserDashboard
        isOpen={userDashboardOpen}
        onClose={() => setUserDashboardOpen(false)}
        user={currentUser}
      />

      {/* Legal Page Modal */}
      <LegalPageModal isOpen={legalOpen} onClose={() => setLegalOpen(false)} type={legalType} />
    </>
  );
}
