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
  Eye,
  Globe,
  Clock,
  ArrowUpRight,
  Mail,
  FileText,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/* ================================================================== */
/*  User Sidebar Navigation Items                                     */
/* ================================================================== */

const userNavSections = [
  {
    group: 'MAIN',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'profile', label: 'Profile', icon: User },
    ],
  },
  {
    group: 'APPLICATIONS',
    items: [
      { id: 'solutions', label: 'Solutions', icon: Lightbulb },
      { id: 'careers', label: 'Careers', icon: Briefcase },
      { id: 'events', label: 'Events', icon: CalendarDays },
    ],
  },
  {
    group: 'ENGAGEMENT',
    items: [
      { id: 'sponsorship', label: 'Sponsorship', icon: Heart },
      { id: 'partnership', label: 'Partnership', icon: Handshake },
      { id: 'feedback', label: 'Feedback', icon: Star },
      { id: 'blogs', label: 'Blogs', icon: FileText },
    ],
  },
  {
    group: 'ACCOUNT',
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'support', label: 'Support', icon: MessageSquare },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

type UserSection = 'overview' | 'profile' | 'solutions' | 'careers' | 'events'
  | 'sponsorship' | 'partnership' | 'feedback' | 'blogs' | 'notifications' | 'support' | 'settings';

/* ================================================================== */
/*  Lazy-loaded Panel Imports                                          */
/* ================================================================== */

import UserOverviewPanel from '@/components/user/OverviewPanel';
import ProfilePanel from '@/components/user/ProfilePanel';
import SolutionsPanel from '@/components/user/SolutionsPanel';
import CareersPanel from '@/components/user/CareersPanel';
import EventsPanel from '@/components/user/EventsPanel';
import SponsorshipPanel from '@/components/user/SponsorshipPanel';
import PartnershipPanel from '@/components/user/PartnershipPanel';
import FeedbackPanel from '@/components/user/FeedbackPanel';
import BlogsPanel from '@/components/user/BlogsPanel';
import UserNotificationsPanel from '@/components/user/NotificationsPanel';
import ContactPanel from '@/components/user/ContactPanel';
import SettingsPanel from '@/components/user/SettingsPanel';

/* ================================================================== */
/*  Sidebar Component                                                  */
/* ================================================================== */

function UserSidebarContent({
  collapsed,
  activeSection,
  onSectionClick,
  onLogout,
  userInfo,
}: {
  collapsed: boolean;
  activeSection: string;
  onSectionClick: (id: UserSection) => void;
  onLogout: () => void;
  userInfo: { name: string | null; email: string; avatar?: string | null } | null;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-4 flex items-center gap-3 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Image src="/logo.svg" alt="ABWcurious" width={28} height={28} className="object-contain" unoptimized />
        </div>
        {!collapsed && (
          <div>
            <h2 className="text-sm font-bold text-primary" style={{ fontFamily: 'var(--font-space-grotesk)' }}>ABWcurious</h2>
            <p className="text-muted-foreground uppercase tracking-widest" style={{ fontSize: '10px' }}>Dashboard</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-4" aria-label="User navigation">
          {userNavSections.map((section) => (
            <div key={section.group}>
              {!collapsed && (
                <p className="px-3 mb-1 text-muted-foreground uppercase tracking-wider font-semibold" style={{ fontSize: '10px' }}>
                  {section.group}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <TooltipProvider key={item.id} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onSectionClick(item.id as UserSection)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                              isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            } ${collapsed ? 'justify-center px-2' : ''}`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            <Icon className="size-4 shrink-0" />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                          </button>
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent side="right">
                            <p>{item.label}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info & Logout */}
      <div className="p-3 border-t border-border">
        <div className={`flex items-center gap-3 px-2 py-1.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
            {userInfo?.avatar ? (
              <Image src={userInfo.avatar} alt={userInfo.name || ''} width={32} height={32} className="object-cover" unoptimized />
            ) : (
              <span className="text-xs font-bold text-primary">
                {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userInfo?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{userInfo?.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main User Dashboard Component                                      */
/* ================================================================== */

export default function UserDashboard() {
  const { user, token, isLoading, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<UserSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      // Show a brief message then redirect
      toast.error('Please log in to access your dashboard.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }
  }, [user, isLoading]);

  const handleLogout = useCallback(async () => {
    await logout();
    toast.success('Logged out successfully.');
    window.location.href = '/';
  }, [logout]);

  const renderPanel = () => {
    switch (activeSection) {
      case 'overview': return <UserOverviewPanel user={user} token={token} userId={user?.id} />;
      case 'profile': return <ProfilePanel token={token} />;
      case 'solutions': return <SolutionsPanel token={token} userId={user?.id} />;
      case 'careers': return <CareersPanel token={token} userId={user?.id} />;
      case 'events': return <EventsPanel token={token} userId={user?.id} />;
      case 'sponsorship': return <SponsorshipPanel token={token} userId={user?.id} />;
      case 'partnership': return <PartnershipPanel token={token} userId={user?.id} />;
      case 'feedback': return <FeedbackPanel token={token} userId={user?.id} />;
      case 'blogs': return <BlogsPanel />;
      case 'notifications': return <UserNotificationsPanel token={token} userId={user?.id} />;
      case 'support': return <ContactPanel token={token} userId={user?.id} />;
      case 'settings': return <SettingsPanel />;
      default: return <UserOverviewPanel user={user} token={token} userId={user?.id} />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <LogIn className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Authentication Required</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Please sign in to access your dashboard. Redirecting to login...
          </p>
          <Link href="/login">
            <Button className="rounded-xl">
              Sign In
              <LogIn className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-60'
          }`}
        >
          <UserSidebarContent
            collapsed={sidebarCollapsed}
            activeSection={activeSection}
            onSectionClick={(id) => setActiveSection(id)}
            onLogout={handleLogout}
            userInfo={user}
          />
          <div className="p-2 border-t border-border">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar (Sheet) */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border shadow-xl lg:hidden">
              <UserSidebarContent
                collapsed={false}
                activeSection={activeSection}
                onSectionClick={(id) => { setActiveSection(id); setSidebarOpen(false); }}
                onLogout={handleLogout}
                userInfo={user}
              />
            </div>
          </>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 flex items-center gap-4 px-4 sm:px-6 h-14 border-b border-border bg-background/80 backdrop-blur-md">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground capitalize" style={{ fontFamily: 'var(--font-sora)' }}>
                {activeSection === 'overview' ? 'Dashboard' : activeSection}
              </h1>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <ArrowUpRight className="size-4 mr-1" />
                  Home
                </Button>
              </Link>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderPanel()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
