'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Menu,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Sidebar, { type AdminSection } from './Sidebar';
import OverviewPanel from './OverviewPanel';
import BlogEditor from './BlogEditor';
import UsersPanel from './UsersPanel';
import EventsPanel from './EventsPanel';
import CareersPanel from './CareersPanel';
import PartnershipsPanel from './PartnershipsPanel';
import SponsorshipsPanel from './SponsorshipsPanel';
import SolutionsPanel from './SolutionsPanel';
import StatusPanel from './StatusPanel';
import MessagesPanel from './MessagesPanel';
import StoragePanel from './StoragePanel';
import LegalPagesPanel from './LegalPagesPanel';
import SettingsPanel from './SettingsPanel';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string | null; email: string; avatar: string | null; role?: string } | null;
}

interface DashboardUser {
  name: string | null;
  email: string;
  avatar: string | null;
  role?: string;
  id?: string;
}

const sectionLabels: Record<AdminSection, string> = {
  overview: 'Dashboard',
  users: 'Users & Roles',
  blogs: 'Blogs',
  events: 'Events & Webinars',
  careers: 'Careers',
  partnerships: 'Partnerships',
  sponsorships: 'Sponsorships',
  solutions: 'Solutions',
  status: 'System Status',
  messages: 'Messages',
  storage: 'Storage',
  legal: 'Legal Pages',
  settings: 'Settings',
};

export default function AdminDashboard({ isOpen, onClose, user }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [token, setToken] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [messageTarget, setMessageTarget] = useState<{ userId: string; userName: string } | null>(null);

  // Load token from cookies on mount
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          setToken('cookie-auth');
          setUserId(data.data.user.id || '');
        }
      })
      .catch(() => {
        // Not authenticated
      });
  }, [isOpen]);

  // Lock body scroll when dashboard is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSectionChange = useCallback((section: AdminSection) => {
    setActiveSection(section);
    setMobileDrawerOpen(false);
    setMessageTarget(null);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors
    }
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('abwcurious_user');
    }
    onClose();
    window.location.reload();
  }, [onClose]);

  const handleOpenMessages = useCallback((targetUserId: string, targetUserName: string) => {
    setMessageTarget({ userId: targetUserId, userName: targetUserName });
    setActiveSection('messages');
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewPanel user={user as DashboardUser} />;
      case 'blogs':
        return <BlogEditor token={token} userId={userId} />;
      case 'users':
        return <UsersPanel token={token} userId={userId} onOpenMessages={handleOpenMessages} />;
      case 'events':
        return <EventsPanel token={token} />;
      case 'careers':
        return <CareersPanel token={token} />;
      case 'partnerships':
        return <PartnershipsPanel token={token} />;
      case 'sponsorships':
        return <SponsorshipsPanel token={token} />;
      case 'solutions':
        return <SolutionsPanel token={token} />;
      case 'status':
        return <StatusPanel token={token} />;
      case 'messages':
        return <MessagesPanel token={token} userId={userId} initialUserId={messageTarget?.userId} />;
      case 'storage':
        return <StoragePanel token={token} />;
      case 'legal':
        return <LegalPagesPanel token={token} />;
      case 'settings':
        return <SettingsPanel token={token} />;
      default:
        return <OverviewPanel user={user as DashboardUser} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] bg-background"
        >
          <div className="h-full flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:block shrink-0">
              <Sidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                onLogout={handleLogout}
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
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className="fixed left-0 top-0 bottom-0 z-20 md:hidden"
                  >
                    <Sidebar
                      activeSection={activeSection}
                      onSectionChange={handleSectionChange}
                      collapsed={false}
                      onToggleCollapse={() => setMobileDrawerOpen(false)}
                      onLogout={handleLogout}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Main Content */}
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
                    aria-controls="mobile-sidebar"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <h1 className="text-sm font-semibold text-foreground">
                    {sectionLabels[activeSection] || 'Dashboard'}
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  {user && (
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-muted-foreground hidden sm:block max-w-[120px] truncate">
                        {user.name || user.email.split('@')[0]}
                      </span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    onClick={onClose}
                    aria-label="Close dashboard"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </header>

              {/* Content Area */}
              <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {renderContent()}
                </motion.div>
              </main>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
