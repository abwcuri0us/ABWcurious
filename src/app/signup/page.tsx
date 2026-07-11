'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  User,
  MapPin,
  Building2,
  Phone,
  CheckCircle2,
  XCircle,
  Shield,
  ChevronsUpDown,
  Check,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { COUNTRIES, CITIES_BY_COUNTRY } from '@/lib/countries';

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

/* ─── Supabase Client ─── */

function getSupabaseBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/* ─── Searchable Combobox ─── */

interface SearchableSelectProps {
  options: { value: string; label: string; searchHint?: string }[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  emptyMessage: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder,
  emptyMessage,
  icon,
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = value ? options.find((o) => o.value === value)?.label : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={`combobox-${placeholder.replace(/\s/g, '-')}`}
          disabled={disabled}
          className={`w-full flex items-center justify-between rounded-xl h-12 px-3 text-left text-sm
            bg-secondary/30 border transition-colors
            ${value ? 'border-emerald-500/50' : 'border-border'}
            focus:outline-none focus:ring-1 focus:ring-primary/50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!selectedLabel ? 'text-muted-foreground' : 'text-foreground'}
          `}
        >
          <div className="flex items-center gap-2 truncate">
            {icon}
            {selectedLabel || placeholder}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 z-[9999]"
        align="start"
        sideOffset={4}
        style={{ maxWidth: '400px' }}
      >
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput placeholder={placeholder} className="h-9" />
          </div>
          <CommandList className="max-h-[250px]">
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.searchHint || option.label}
                  onSelect={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* ─── OTP Input Component ─── */

function OtpInput({ length = 6, onComplete }: { length?: number; onComplete: (otp: string) => void }) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...values];
    newValues[index] = value.slice(-1);
    setValues(newValues);

    const otp = newValues.join('');
    if (otp.length === length && !newValues.includes('')) {
      onComplete(otp);
    }

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted.length === length) {
      const newValues = pasted.split('');
      setValues(newValues);
      onComplete(pasted);
    }
  };

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {values.map((val, i) => (
        <Input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-xl font-bold bg-secondary/30 border-border focus:border-primary/50 rounded-xl"
          autoFocus={i === 0}
        />
      ))}
    </div>
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

/* ─── Step Types ─── */

type SignupStep = 'form' | 'otp' | 'success';

/* ─── Component ─── */

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const captchaRef = useRef<HCaptcha>(null);

  const [step, setStep] = useState<SignupStep>('form');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP verification
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Check URL for OAuth errors
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  const cities = country ? CITIES_BY_COUNTRY[country] || [] : [];
  const countryOptions = COUNTRIES.map((c) => ({
    value: c.code,
    label: c.name,
    searchHint: `${c.name} ${c.code} ${c.phoneCode || ''}`,
  }));
  const cityOptions = cities.map((c) => ({ value: c, label: c }));

  // Validation
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    else if (name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(password)) newErrors.password = 'Password must contain an uppercase letter';
    else if (!/[a-z]/.test(password)) newErrors.password = 'Password must contain a lowercase letter';
    else if (!/\d/.test(password)) newErrors.password = 'Password must contain a number';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!country) newErrors.country = 'Please select a country';
    if (!city) newErrors.city = 'Please select a city';
    if (phone && !/^\+?\d{7,15}$/.test(phone.trim())) newErrors.phone = 'Phone must be 7-15 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, email, password, confirmPassword, country, city, phone]);

  // Send OTP
  const handleSendOtp = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address first.');
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep('otp');
        setResendTimer(60);
        toast.success('OTP sent to your email address.');
      } else {
        toast.error(data.error || 'Failed to send OTP.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setOtpSending(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (otp: string) => {
    setOtpVerifying(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailVerified(true);
        setOtpVerified(true);
        toast.success('Email verified successfully!');
      } else {
        toast.error(data.error || 'Invalid OTP. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({ name: true, email: true, password: true, confirmPassword: true, country: true, city: true, phone: true });

    if (!validate()) {
      toast.error('Please fix the errors below.');
      return;
    }

    if (!emailVerified) {
      toast.error('Please verify your email address first.');
      return;
    }

    if (!captchaToken) {
      toast.error('Please complete the captcha verification.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          country,
          city,
          phone: phone || undefined,
          captchaToken,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep('success');
        toast.success('Account created successfully!');
      } else {
        toast.error(data.error || 'Failed to create account.');
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
      }
    } catch {
      toast.error('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth signup
  const handleOAuthSignup = useCallback(async (providerId: string, providerName: string) => {
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
        toast.error(`${providerName} signup failed: ${error.message}`);
        setOauthLoading(null);
      }
    } catch {
      toast.error(`Failed to connect to ${providerName}. Please try again.`);
      setOauthLoading(null);
    }
  }, []);

  // Password requirements
  const passReqs = [
    { check: password.length >= 8, label: 'At least 8 characters' },
    { check: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { check: /[a-z]/.test(password), label: 'One lowercase letter' },
    { check: /\d/.test(password), label: 'One number' },
    { check: password === confirmPassword && confirmPassword.length > 0, label: 'Passwords match' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
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
              Join our platform and explore cybersecurity, AI, education &amp; digital transformation.
            </motion.p>

            {/* Benefits list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-3 max-w-sm"
            >
              {[
                'Access exclusive cybersecurity resources',
                'AI-powered learning & development tools',
                'Connect with industry professionals',
                'Stay updated with latest tech trends',
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">{benefit}</span>
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
              <span>Protected by hCaptcha &amp; email verification</span>
            </motion.div>
          </div>
        </motion.div>

        {/* ─── Right Panel: Signup Form ─── */}
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
            <motion.div variants={fadeInUp} className="flex justify-center lg:hidden mb-6">
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

            <AnimatePresence mode="wait">
              {/* ─── Step 1: Form ─── */}
              {step === 'form' && (
                <motion.div key="form" exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  {/* Header */}
                  <motion.div variants={fadeInUp} className="text-center mb-6">
                    <h2
                      className="text-3xl font-bold text-foreground"
                      style={{ fontFamily: 'var(--font-sora)' }}
                    >
                      Create Account
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      Join ABWcurious and start your journey
                    </p>
                  </motion.div>

                  {/* Social OAuth Buttons */}
                  <motion.div variants={fadeInUp} className="mb-5">
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
                            onClick={() => handleOAuthSignup(sp.provider, sp.name)}
                            className="h-11 rounded-xl border-border bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
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
                  <motion.div variants={fadeInUp} className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-3 text-muted-foreground">
                        Or sign up with email
                      </span>
                    </div>
                  </motion.div>

                  {/* Signup Form */}
                  <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Full Name */}
                    <div>
                      <Label htmlFor="signup-name" className="text-sm font-medium mb-1 block">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                          className={`pl-10 bg-secondary/30 border-border focus:border-primary/50 rounded-xl h-11 ${touched.name && errors.name ? 'border-destructive' : ''}`}
                          disabled={loading}
                          required
                        />
                      </div>
                      {touched.name && errors.name && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email with Verify Button */}
                    <div>
                      <Label htmlFor="signup-email" className="text-sm font-medium mb-1 block">
                        Email Address <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                            className={`pl-10 bg-secondary/30 border-border focus:border-primary/50 rounded-xl h-11 ${emailVerified ? 'border-emerald-500/50' : touched.email && errors.email ? 'border-destructive' : ''}`}
                            disabled={loading || emailVerified}
                            required
                          />
                          {emailVerified && (
                            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                        {!emailVerified && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSendOtp}
                            disabled={otpSending || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                            className="h-11 px-4 rounded-xl border-primary/30 text-primary hover:bg-primary/10 whitespace-nowrap"
                          >
                            {otpSending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                          </Button>
                        )}
                      </div>
                      {touched.email && errors.email && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> {errors.email}
                        </p>
                      )}
                      {emailVerified && (
                        <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Email verified successfully
                        </p>
                      )}
                    </div>

                    {/* Country */}
                    <div>
                      <Label className="text-sm font-medium mb-1 block">
                        Country <span className="text-destructive">*</span>
                      </Label>
                      <SearchableSelect
                        options={countryOptions}
                        value={country}
                        onValueChange={(val) => { setCountry(val); setCity(''); setTouched((t) => ({ ...t, country: true })); }}
                        placeholder="Search or select your country"
                        emptyMessage="No country found."
                        icon={<MapPin className="h-4 w-4 text-muted-foreground shrink-0" />}
                        disabled={loading}
                      />
                      {touched.country && errors.country && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> {errors.country}
                        </p>
                      )}
                    </div>

                    {/* City */}
                    {country && cities.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <Label className="text-sm font-medium mb-1 block">
                          City <span className="text-destructive">*</span>
                        </Label>
                        <SearchableSelect
                          options={cityOptions}
                          value={city}
                          onValueChange={(val) => { setCity(val); setTouched((t) => ({ ...t, city: true })); }}
                          placeholder="Search or select your city"
                          emptyMessage="No city found."
                          icon={<Building2 className="h-4 w-4 text-muted-foreground shrink-0" />}
                          disabled={loading}
                        />
                        {touched.city && errors.city && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> {errors.city}
                          </p>
                        )}
                      </motion.div>
                    )}

                    {/* Phone */}
                    <div>
                      <Label htmlFor="signup-phone" className="text-sm font-medium mb-1 block">
                        Contact Number <span className="text-muted-foreground font-normal">(optional)</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+91 XXXXXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                          className={`pl-10 bg-secondary/30 border-border focus:border-primary/50 rounded-xl h-11 ${touched.phone && errors.phone ? 'border-destructive' : ''}`}
                          disabled={loading}
                          maxLength={16}
                        />
                      </div>
                      {touched.phone && errors.phone && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <Label htmlFor="signup-password" className="text-sm font-medium mb-1 block">
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min 8 chars, upper, lower, number"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                          className={`pl-10 pr-10 bg-secondary/30 border-border focus:border-primary/50 rounded-xl h-11 ${touched.password && errors.password ? 'border-destructive' : ''}`}
                          disabled={loading}
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
                      {touched.password && errors.password && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <Label htmlFor="signup-confirm-password" className="text-sm font-medium mb-1 block">
                        Confirm Password <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                          className={`pl-10 bg-secondary/30 border-border focus:border-primary/50 rounded-xl h-11 ${touched.confirmPassword && errors.confirmPassword ? 'border-destructive' : touched.confirmPassword && !errors.confirmPassword && confirmPassword ? 'border-emerald-500/50' : ''}`}
                          disabled={loading}
                          required
                        />
                      </div>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* Password requirements */}
                    {password.length > 0 && (
                      <div className="space-y-1.5 p-3 rounded-xl bg-secondary/20 border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Password requirements:</p>
                        {passReqs.map((req) => (
                          <div key={req.label} className="flex items-center gap-2">
                            <CheckCircle2
                              className={`h-3.5 w-3.5 transition-colors ${req.check ? 'text-emerald-500' : 'text-muted-foreground/40'}`}
                            />
                            <span className={`text-xs transition-colors ${req.check ? 'text-emerald-500' : 'text-muted-foreground/60'}`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

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

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={loading || !captchaToken || !emailVerified}
                      className="w-full h-12 rounded-xl btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-sm hover:shadow-[0_0_25px_rgba(8,145,178,0.3)] transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.form>
                </motion.div>
              )}

              {/* ─── Step 2: OTP Verification ─── */}
              {step === 'otp' && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h2
                    className="text-2xl font-bold text-foreground mb-2"
                    style={{ fontFamily: 'var(--font-sora)' }}
                  >
                    Verify Your Email
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    We&apos;ve sent a 6-digit verification code to{' '}
                    <span className="text-foreground font-medium">{email}</span>
                  </p>

                  <OtpInput
                    length={6}
                    onComplete={handleVerifyOtp}
                  />

                  {otpVerifying && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Verifying...</span>
                    </div>
                  )}

                  {emailVerified && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-center justify-center gap-2 text-emerald-500"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Email verified!</span>
                    </motion.div>
                  )}

                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={async () => {
                        if (resendTimer > 0) return;
                        setOtpSending(true);
                        try {
                          const res = await fetch('/api/auth/verify-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: email.trim() }),
                          });
                          const data = await res.json();
                          if (res.ok && data.success) {
                            setResendTimer(60);
                            toast.success('OTP resent to your email.');
                          } else {
                            toast.error(data.error || 'Failed to resend OTP.');
                          }
                        } catch {
                          toast.error('Network error.');
                        } finally {
                          setOtpSending(false);
                        }
                      }}
                      disabled={resendTimer > 0 || otpSending}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {resendTimer > 0
                        ? `Resend OTP in ${resendTimer}s`
                        : otpSending
                        ? 'Sending...'
                        : 'Resend OTP'}
                    </Button>
                  </div>

                  {emailVerified && (
                    <Button
                      type="button"
                      onClick={() => setStep('form')}
                      className="mt-4 h-11 px-8 rounded-xl btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
                    >
                      Continue to Complete Signup
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors block mx-auto"
                  >
                    &larr; Back to form
                  </button>
                </motion.div>
              )}

              {/* ─── Step 3: Success ─── */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </motion.div>

                  <h2
                    className="text-2xl font-bold text-foreground mb-2"
                    style={{ fontFamily: 'var(--font-sora)' }}
                  >
                    Account Created!
                  </h2>
                  <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
                    Welcome to ABWcurious! Your account has been created successfully. You can now sign in to access your dashboard.
                  </p>

                  <Button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="h-12 px-8 rounded-xl btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
                  >
                    Sign In Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Switch to Login */}
            {step === 'form' && (
              <motion.div variants={fadeInUp} className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </motion.div>
            )}

            {/* Terms */}
            {step === 'form' && (
              <motion.p variants={fadeInUp} className="mt-4 text-center text-xs text-muted-foreground">
                By creating an account, you agree to our{' '}
                <span className="text-primary/80 cursor-pointer hover:text-primary">Terms of Service</span>
                {' '}and{' '}
                <span className="text-primary/80 cursor-pointer hover:text-primary">Privacy Policy</span>
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Back to Home */}
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

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
}
