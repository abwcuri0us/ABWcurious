'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import HCaptcha from '@hcaptcha/react-hcaptcha';

/* ─── Social Provider Icons (Inline SVG) ─── */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 dark:fill-white fill-[#181717]">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 dark:fill-white fill-[#000]">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/* ─── Social Provider Config ─── */

const socialProviders = [
  { id: 'google', name: 'Google', icon: GoogleIcon, provider: 'google' },
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, provider: 'facebook' },
  { id: 'github', name: 'GitHub', icon: GitHubIcon, provider: 'github' },
  { id: 'apple', name: 'Apple', icon: AppleIcon, provider: 'apple' },
  { id: 'azure', name: 'Azure AD', icon: MicrosoftIcon, provider: 'azure' },
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedInIcon, provider: 'linkedin_oidc' },
] as const;

/* ─── Supabase Client (browser-only) ─── */

function getSupabaseBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/* ─── Animation Variants ─── */

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

/* ─── Component ─── */

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const captchaRef = useRef<HCaptcha>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Check for error messages in URL params (from OAuth callback)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  // Handle email/password login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Please enter your email and password.');
      return;
    }

    if (!captchaToken) {
      toast.error('Please complete the captcha verification.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, captchaToken }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Welcome back! Login successful.');
        const user = data.data?.user;
        if (user?.role === 'admin' || user?.role === 'editor') {
          router.push('/?admin=true');
        } else {
          router.push('/?dashboard=true');
        }
      } else {
        toast.error(data.error || 'Invalid credentials. Please try again.');
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
      }
    } catch {
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth login
  const handleOAuthLogin = useCallback(async (providerId: string, providerName: string) => {
    setOauthLoading(providerId);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerId as 'google' | 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(`${providerName} login failed: ${error.message}`);
        setOauthLoading(null);
      }
      // If no error, the browser will redirect to the OAuth provider
    } catch {
      toast.error(`Failed to connect to ${providerName}. Please try again.`);
      setOauthLoading(null);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row">
        {/* ─── Left Panel: Brand (desktop only) ─── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:w-1/2 xl:w-[45%] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
          <div className="absolute inset-0 grid-pattern opacity-30" />

          <div className="relative z-10 flex flex-col justify-center items-center px-12 xl:px-16 w-full">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                <Image
                  src="/logo.svg"
                  alt="ABWcurious"
                  width={80}
                  height={80}
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl xl:text-5xl font-bold text-center mb-4"
              style={{ fontFamily: 'var(--font-sora)' }}
            >
              <span className="text-gradient-cyan">ABW</span>
              <span className="text-foreground">curious</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg text-muted-foreground text-center mb-10 max-w-md"
            >
              Shaping A Better World With Technology — Cybersecurity, AI, Education &amp; Innovation
            </motion.p>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="grid grid-cols-3 gap-6"
            >
              {[
                { value: '500+', label: 'Clients Worldwide' },
                { value: '50+', label: 'Countries Served' },
                { value: '99.9%', label: 'System Uptime' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-primary" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Security badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-10 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 px-4 py-2 rounded-full border border-border"
            >
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>Enterprise-grade security &amp; encryption</span>
            </motion.div>
          </div>
        </motion.div>

        {/* ─── Right Panel: Login Form ─── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
        >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <motion.div variants={fadeInUp} className="flex justify-center lg:hidden mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Image
                  src="/logo.svg"
                  alt="ABWcurious"
                  width={56}
                  height={56}
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
            </motion.div>

            {/* Header */}
            <motion.div variants={fadeInUp} className="text-center mb-8">
              <h2
                className="text-3xl font-bold text-foreground"
                style={{ fontFamily: 'var(--font-sora)' }}
              >
                Welcome Back
              </h2>
              <p className="text-muted-foreground mt-2">
                Sign in to your ABWcurious account
              </p>
            </motion.div>

            {/* Social OAuth Buttons */}
            <motion.div variants={fadeInUp} className="mb-6">
              <div className="grid grid-cols-3 gap-2.5">
                {socialProviders.map((sp) => {
                  const Icon = sp.icon;
                  const isLoading = oauthLoading === sp.id;
                  return (
                    <Button
                      key={sp.id}
                      type="button"
                      variant="outline"
                      disabled={!!oauthLoading}
                      onClick={() => handleOAuthLogin(sp.provider, sp.name)}
                      className="h-12 rounded-xl border-border bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon />
                      )}
                      <span className="hidden sm:inline">{sp.name}</span>
                    </Button>
                  );
                })}
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div variants={fadeInUp} className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </motion.div>

            {/* Login Form */}
            <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="login-email" className="text-sm font-medium mb-1.5 block">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-secondary/30 border-border focus:border-primary/50 rounded-xl h-12"
                    disabled={loading}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="login-password" className="text-sm font-medium mb-1.5 block">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-secondary/30 border-border focus:border-primary/50 rounded-xl h-12"
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-border"
                  />
                  <Label htmlFor="remember-me" className="text-xs text-muted-foreground cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info('Password reset feature coming soon.')}
                  className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* hCaptcha */}
              <div className="flex justify-center">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ''}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  theme="dark"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !captchaToken}
                className="w-full h-12 rounded-xl btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm hover:shadow-[0_0_25px_rgba(8,145,178,0.3)] transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.form>

            {/* Switch to Signup */}
            <motion.div variants={fadeInUp} className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </motion.div>

            {/* Terms */}
            <motion.p variants={fadeInUp} className="mt-4 text-center text-xs text-muted-foreground">
              By signing in, you agree to our{' '}
              <span className="text-primary/80 cursor-pointer hover:text-primary">Terms of Service</span>
              {' '}and{' '}
              <span className="text-primary/80 cursor-pointer hover:text-primary">Privacy Policy</span>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>

      {/* Back to Home link */}
      <div className="relative z-10 text-center py-4">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          &larr; Back to ABWcurious.com
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
