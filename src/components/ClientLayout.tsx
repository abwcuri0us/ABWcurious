'use client';
import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { Toaster } from '@/components/ui/sonner';
import dynamic from 'next/dynamic';

const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), {
  ssr: false,
});

function CopyProtection({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, input, textarea, [role="button"], [contenteditable]');
      if (!isInteractive) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const events = ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart'];
    events.forEach(evt => document.addEventListener(evt, handler, { passive: false }));
    return () => {
      events.forEach(evt => document.removeEventListener(evt, handler));
    };
  }, []);

  return <>{children}</>;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <NavigationProvider>
          <CopyProtection>
            <div className="min-h-screen flex flex-col relative copy-protected" suppressHydrationWarning>
              <AnimatedBackground />
              {children}
            </div>
          </CopyProtection>
          <Toaster />
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
