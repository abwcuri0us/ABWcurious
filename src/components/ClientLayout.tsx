'use client';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { Toaster } from '@/components/ui/sonner';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <NavigationProvider>
          <div className="min-h-screen flex flex-col" suppressHydrationWarning>
            {children}
          </div>
          <Toaster />
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}