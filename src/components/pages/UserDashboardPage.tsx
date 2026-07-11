'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LogIn,
  // User sidebar icons
  LayoutDashboard,
  User,
  Lightbulb,
  Briefcase,
  CalendarDays,
  Handshake,
  Heart,
  Bell,
  MessageSquare,
  Settings,
  Star,
  // Admin sidebar icons
  Users,
  Activity,
  Zap,
  Award,
  FileCheck,
  TicketCheck,
  Package,
  // Overview icons
  Eye,
  Globe,
  Clock,
  ArrowUpRight,
  Mail,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  User panels                                                        */
/* ------------------------------------------------------------------ */
import UserOverviewPanel from '@/components/user/OverviewPanel';
import ProfilePanel from '@/components/user/ProfilePanel';
import UserNotificationsPanel from '@/components/user/NotificationsPanel';
import SolutionsPanel from '@/components/user/SolutionsPanel';
import CareersPanel from '@/components/user/CareersPanel';
import EventsPanel from '@/components/user/EventsPanel';

import SponsorshipPanel from '@/components/user/SponsorshipPanel';
import PartnershipPanel from '@/components/user/PartnershipPanel';
import FeedbackPanel from '@/components/user/FeedbackPanel';
import ContactPanel from '@/components/user/ContactPanel';
import SettingsPanel from '@/components/user/SettingsPanel';

/* ------------------------------------------------------------------ */
/*  Admin panels                                                       */
/* ------------------------------------------------------------------ */
import AdminUsersPanel from '@/components/admin/UsersPanel';
import AdminEventsPanel from '@/components/admin/EventsPanel';
import AdminCareersPanel from '@/components/admin/CareersPanel';
import AdminStatusPanel from '@/components/admin/StatusPanel';
import AdminPartnershipsPanel from '@/components/admin/PartnershipsPanel';
import AdminSponsorshipsPanel from '@/components/admin/SponsorshipsPanel';
import AdminApplicationsPanel from '@/components/admin/ApplicationsPanel';
import AdminRegistrationsPanel from '@/components/admin/RegistrationsPanel';
import AdminNotificationsPanel from '@/components/admin/NotificationsPanel';
import AdminSolutionsPanel from '@/components/admin/SolutionsPanel';
import AdminFeedbackPanel from '@/components/admin/FeedbackPanel';

/* ================================================================== */
/*  Type definitions                                                   */
/* ================================================================== */

type UserSection =
  | 'overview'
  | 'profile'
  | 'solutions'
  | 'careers'
  | 'events'
  | 'sponsorship'
  | 'partnership'
  | 'feedback'
  | 'notifications'
  | 'support'
  | 'settings';

type AdminSection =
  | 'overview'
  | 'users'
  | 'events'
  | 'careers'
  | 'partnerships'
  | 'sponsorships'
  | 'applications'
  | 'registrations'
  | 'solutions'
  | 'feedback'
  | 'status'
  | 'notifications'


/* ================================================================== */
/*  Sidebar nav items                                                  */
/* ================================================================== */

const userNavItems: { id: UserSection; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'solutions', label: 'Solutions', icon: Lightbulb },
  { id: 'careers', label: 'Careers', icon: Briefcase },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'sponsorship', label: 'Sponsorship', icon: Heart },
  { id: 'partnership', label: 'Partnership', icon: Handshake },
  { id: 'feedback', label: 'Feedback', icon: Star },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'support', label: 'Support', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const adminNavItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'events', label: 'Events & Webinars', icon: CalendarDays },
  { id: 'careers', label: 'Careers', icon: Briefcase },
  { id: 'partnerships', label: 'Partnerships', icon: Handshake },
  { id: 'sponsorships', label: 'Sponsorships', icon: Award },
  { id: 'applications', label: 'Applications', icon: FileCheck },
  { id: 'registrations', label: 'Registrations', icon: TicketCheck },
  { id: 'solutions', label: 'Solutions', icon: Package },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'status', label: 'Status Page', icon: Activity },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

/* ================================================================== */
/*  Admin Overview Panel (inline)                                      */
/* ================================================================== */

function AdminOverviewPanel({ user }: { user: { name: string | null; email: string } }) {
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    careers: 0,
    partnerships: 0,
    sponsorships: 0,
    applications: 0,
    registrations: 0,
    feedback: 0,
    contacts: 0,
    newsletter: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('abwcurious_token') || '';
        const headers = { Authorization: `Bearer ${token}` };
        const res = await fetch('/api/admin/overview', { headers });
        const json = await res.json();
        const data = json?.data || {};
        setStats({
          users: Number(data.totalUsers ?? 0),
          events: Number(data.totalEvents ?? 0),
          careers: Number(data.activeCareers ?? 0),
          partnerships: Number(data.totalPartnerships ?? 0),
          sponsorships: Number(data.totalSponsorships ?? 0),
          applications: Number(data.totalApplications ?? 0),
          registrations: Number(data.totalRegistrations ?? 0),
          feedback: Number(data.totalFeedback ?? 0),
          contacts: Number(data.newContacts ?? 0),
          newsletter: Number(data.newsletterSubscribers ?? 0),
        });
      } catch { /* ignore */ } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const quickStats = [
    { title: 'Users', value: loadingStats ? '...' : String(stats.users), icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Events', value: loadingStats ? '...' : String(stats.events), icon: CalendarDays, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Active Careers', value: loadingStats ? '...' : String(stats.careers), icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Partnerships', value: loadingStats ? '...' : String(stats.partnerships), icon: Handshake, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { title: 'Sponsorships', value: loadingStats ? '...' : String(stats.sponsorships), icon: Award, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { title: 'Applications', value: loadingStats ? '...' : String(stats.applications), icon: FileCheck, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { title: 'Registrations', value: loadingStats ? '...' : String(stats.registrations), icon: TicketCheck, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { title: 'Feedback', value: loadingStats ? '...' : String(stats.feedback), icon: MessageSquare, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { title: 'New Contacts', value: loadingStats ? '...' : String(stats.contacts), icon: Mail, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Newsletter', value: loadingStats ? '...' : String(stats.newsletter), icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
          Welcome back, {user.name || user.email.split('@')[0]}!
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Here&apos;s an overview of your ABWcurious platform</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <div className="p-4 border-b border-border">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Activity
            </h3>
          </div>
          <CardContent className="p-4 space-y-3">
            {[
              { text: 'User signed up', time: '5 hours ago' },
              { text: 'Event updated', time: '1 day ago' },
              { text: 'Career listing added', time: '2 days ago' },
              { text: 'System status updated', time: '3 days ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <div className="p-4 border-b border-border">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Quick Stats
            </h3>
          </div>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Eye className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground">Page Views Today</span></div>
              <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium"><ArrowUpRight className="h-3 w-3" />1,247</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground">Active Users</span></div>
              <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium"><ArrowUpRight className="h-3 w-3" />342</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground">Uptime</span></div>
              <span className="text-sm font-medium text-emerald-500">99.98%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-foreground">Avg Response Time</span></div>
              <span className="text-sm font-medium text-foreground">142ms</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Sidebar Component                                                  */
/* ================================================================== */

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  isAdmin: boolean;
}

function Sidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  onLogout,
  onGoHome,
  isAdmin,
}: SidebarProps) {
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const title = isAdmin ? 'Admin Panel' : 'My Dashboard';
  const titleGradient = isAdmin ? 'text-gradient-cyan' : 'text-gradient-cyan';

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="h-full flex flex-col bg-card/80 backdrop-blur-xl border-r border-border relative overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-3 border-b border-border shrink-0">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 min-w-0 group"
          title={collapsed ? 'Back to website' : undefined}
        >
          <div className="relative">
            <Image
              src="/logo.svg"
              alt="ABWcurious"
              width={32}
              height={32}
              className="h-8 w-8 object-contain shrink-0"
              unoptimized
            />
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-bold tracking-tight whitespace-nowrap overflow-hidden"
                style={{ fontFamily: 'var(--font-space-grotesk)' }}
              >
                <span className={titleGradient}>{isAdmin ? 'ABW' : 'My'}</span>
                <span className="text-foreground">{isAdmin ? 'curious' : 'Dashboard'}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 relative group ${
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
              } ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId={isAdmin ? 'admin-sidebar-active' : 'user-sidebar-active'}
                  className="absolute inset-0 rounded-lg border border-primary/20 bg-primary/5"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0 relative z-10" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden relative z-10"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border shrink-0">
        {/* Log Out Button */}
        <div className="px-2 pt-2">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Log Out' : undefined}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  Log Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Collapse Toggle */}
        <div className="p-2">
          <button
            onClick={onToggleCollapse}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-[18px] w-[18px] shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-[18px] w-[18px] shrink-0" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

/* ================================================================== */
/*  Main Dashboard Page Component                                      */
/* ================================================================== */

export default function UserDashboardPage() {
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const { goHome } = useNavigation();
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const isAdmin = user?.role === 'admin' || user?.role === 'editor';

  // Fetch session details for token/userId
  useEffect(() => {
    const storedToken = localStorage.getItem('abwcurious_token') || token || '';
    setSessionToken(storedToken);
    if (user?.id) setUserId(user.id);
  }, [user, token]);

  // Also fetch from session API for completeness
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          if (!sessionToken) setSessionToken('cookie-auth');
          if (!userId) setUserId(data.data.user.id || '');
        }
      })
      .catch(() => { /* Not authenticated via cookie */ });
  }, []);

  // Lock body scroll (dashboard is full-screen)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSectionChange = useCallback((section: string) => {
    setActiveSection(section);
    setMobileDrawerOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    logout();
    toast.success('Logged out successfully.');
    goHome();
  }, [logout, goHome]);

  const handleGoHome = useCallback(() => {
    goHome();
  }, [goHome]);

  const handleOpenAuth = useCallback(() => {
    window.dispatchEvent(new CustomEvent('abwcurious:open-auth', { detail: { mode: 'login' } }));
  }, []);

  /* ---- OAuth redirect grace period ---- */
  // After an OAuth redirect the browser lands on #dashboard. The AuthContext
  // retries reading cookies a few times, but we also add a grace period here
  // so the user doesn't see a flash of "Sign In Required" before the session
  // is fully loaded.
  const [oauthGracePeriod, setOauthGracePeriod] = useState(true);
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Only apply the grace period when we've landed on #dashboard (OAuth target)
    const isOAuthRedirect = typeof window !== "undefined" &&
      window.location.hash.includes("dashboard");

    if (isOAuthRedirect && !user && !authLoading) {
      // Give extra time for AuthContext's retry to complete
      graceTimerRef.current = setTimeout(() => {
        setOauthGracePeriod(false);
      }, 1500);
    } else {
      setOauthGracePeriod(false);
    }

    return () => {
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    };
  }, [user, authLoading]);

  /* ---- Auth gate ---- */
  if (authLoading || (oauthGracePeriod && !user)) {
    return (
      <div className="fixed inset-0 z-[190] bg-background flex flex-col items-center justify-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <Image src="/logo.svg" alt="ABWcurious" width={64} height={64} className="relative z-10 animate-pulse" unoptimized />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 z-[190] bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-4 overflow-hidden">
              <Image src="/logo.svg" alt="ABWcurious" width={64} height={64} className="w-16 h-16 object-contain" unoptimized />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Sign In Required</h2>
            <p className="text-sm text-muted-foreground mb-6">
              You need to be logged in to access your dashboard.
            </p>
            <Button
              onClick={handleOpenAuth}
              className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Content rendering ---- */
  const authToken = sessionToken || token || '';
  const authUserId = userId || user.id || '';

  const renderUserContent = () => {
    switch (activeSection as UserSection) {
      case 'overview':
        return <UserOverviewPanel user={user} token={authToken} userId={authUserId} onNavigate={handleSectionChange} />;
      case 'profile':
        return <ProfilePanel token={authToken} onProfileUpdate={() => {}} />;
      case 'solutions':
        return <SolutionsPanel token={authToken} userId={authUserId} />;
      case 'careers':
        return <CareersPanel token={authToken} userId={authUserId} />;
      case 'events':
        return <EventsPanel token={authToken} userId={authUserId} />;
      case 'sponsorship':
        return <SponsorshipPanel token={authToken} userId={authUserId} />;
      case 'partnership':
        return <PartnershipPanel token={authToken} userId={authUserId} />;
      case 'feedback':
        return <FeedbackPanel token={authToken} userId={authUserId} />;
      case 'notifications':
        return <UserNotificationsPanel token={authToken} userId={authUserId} />;
      case 'support':
        return <ContactPanel token={authToken} userId={authUserId} />;
      case 'settings':
        return <SettingsPanel token={authToken} userId={authUserId} />;
      default:
        return <UserOverviewPanel user={user} token={authToken} userId={authUserId} onNavigate={handleSectionChange} />;
    }
  };

  const renderAdminContent = () => {
    switch (activeSection as AdminSection) {
      case 'overview':
        return <AdminOverviewPanel user={user} />;
      case 'users':
        return <AdminUsersPanel token={authToken} />;
      case 'events':
        return <AdminEventsPanel token={authToken} />;
      case 'careers':
        return <AdminCareersPanel token={authToken} />;
      case 'partnerships':
        return <AdminPartnershipsPanel token={authToken} />;
      case 'sponsorships':
        return <AdminSponsorshipsPanel token={authToken} />;
      case 'applications':
        return <AdminApplicationsPanel token={authToken} />;
      case 'registrations':
        return <AdminRegistrationsPanel token={authToken} />;
      case 'solutions':
        return <AdminSolutionsPanel token={authToken} />;
      case 'feedback':
        return <AdminFeedbackPanel token={authToken} />;
      case 'status':
        return <AdminStatusPanel token={authToken} />;
      case 'notifications':
        return <AdminNotificationsPanel token={authToken} />;
      default:
        return <AdminOverviewPanel user={user} />;
    }
  };

  const sectionLabel = activeSection === 'overview'
    ? (isAdmin ? 'Admin Dashboard' : 'My Dashboard')
    : activeSection.replace(/-/g, ' ');

  return (
    <div className="fixed inset-0 z-[190] bg-background">
      <div className="h-full flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0">
          <Sidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onLogout={handleLogout}
            onGoHome={handleGoHome}
            isAdmin={isAdmin}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm md:hidden"
                onClick={() => setMobileDrawerOpen(false)}
              />
              <motion.div
                initial={{ x: -240 }}
                animate={{ x: 0 }}
                exit={{ x: -240 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                className="fixed left-0 top-0 bottom-0 z-20 md:hidden"
              >
                <Sidebar
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                  collapsed={false}
                  onToggleCollapse={() => setMobileDrawerOpen(false)}
                  onLogout={handleLogout}
                  onGoHome={handleGoHome}
                  isAdmin={isAdmin}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Bar */}
          <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border bg-card/50 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 text-muted-foreground"
                onClick={() => setMobileDrawerOpen(true)}
                aria-expanded={mobileDrawerOpen}
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-sm font-semibold text-foreground capitalize">
                {sectionLabel}
              </h1>
              {isAdmin && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  ADMIN
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Back to website */}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 gap-1.5 hidden sm:flex"
                onClick={handleGoHome}
              >
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline">Website</span>
              </Button>

              {user && (
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold overflow-hidden">
                    {user.avatar ? (
                      <Image src={user.avatar} alt="" width={28} height={28} className="h-full w-full object-cover" />
                    ) : (
                      (user.name || user.email)[0].toUpperCase()
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground hidden sm:block max-w-[120px] truncate">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                onClick={handleLogout}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {isAdmin ? renderAdminContent() : renderUserContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
