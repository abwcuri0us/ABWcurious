'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  CalendarDays,
  Handshake,
  Heart,
  Mail,
  User,
  Settings,
  Bell,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import Image from 'next/image';

export type UserSection =
  | 'overview'
  | 'solutions'
  | 'blogs'
  | 'careers'
  | 'events'
  | 'partnership'
  | 'sponsorship'
  | 'contact'
  | 'profile'
  | 'settings'
  | 'notifications';

interface UserSidebarProps {
  activeSection: UserSection;
  onSectionChange: (section: UserSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout?: () => void;
}

const navItems: { id: UserSection; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'solutions', label: 'Service Offerings', icon: Lightbulb },
  { id: 'blogs', label: 'My Blogs', icon: FileText },
  { id: 'careers', label: 'Careers', icon: Briefcase },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'partnership', label: 'Partnership', icon: Handshake },
  { id: 'sponsorship', label: 'Sponsorship', icon: Heart },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function UserSidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  onLogout,
}: UserSidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="h-full flex flex-col bg-card/80 backdrop-blur-xl border-r border-border relative overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Image
            src="/logo.png"
            alt="ABWcurious"
            width={32}
            height={32}
            className="h-8 w-8 object-contain shrink-0"
          />
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
                <span className="text-gradient-cyan">My</span>
                <span className="text-foreground">Dashboard</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto overflow-x-hidden" aria-label="User dashboard navigation">
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
                  layoutId="user-sidebar-active"
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
        {onLogout && (
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
        )}

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
