'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  CalendarDays,
  Briefcase,
  MessageSquare,
  HardDrive,
  Scale,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Megaphone,
  Lightbulb,
} from 'lucide-react';
import Image from 'next/image';

export type AdminSection =
  | 'overview'
  | 'users'
  | 'blogs'
  | 'events'
  | 'careers'
  | 'partnerships'
  | 'sponsorships'
  | 'solutions'
  | 'status'
  | 'messages'
  | 'storage'
  | 'legal'
  | 'settings';

interface SidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout?: () => void;
}

const navItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'blogs', label: 'Blogs', icon: FileText },
  { id: 'events', label: 'Events & Webinars', icon: CalendarDays },
  { id: 'careers', label: 'Careers', icon: Briefcase },
  { id: 'partnerships', label: 'Partnerships', icon: Handshake },
  { id: 'sponsorships', label: 'Sponsorships', icon: Megaphone },
  { id: 'solutions', label: 'Solutions', icon: Lightbulb },
  { id: 'status', label: 'Status', icon: HardDrive },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'legal', label: 'Legal Pages', icon: Scale },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  onLogout,
}: SidebarProps) {
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
                <span className="text-gradient-cyan">ABW</span>
                <span className="text-foreground">curious</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto overflow-x-hidden" aria-label="Admin navigation">
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
                  layoutId="sidebar-active"
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

      {/* Logout Button */}
      {onLogout && (
        <div className="px-2 py-1">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-destructive hover:bg-destructive/10 transition-all duration-200 ${
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
      <div className="border-t border-border p-2 shrink-0">
        <button
          onClick={onToggleCollapse}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
    </motion.aside>
  );
}
