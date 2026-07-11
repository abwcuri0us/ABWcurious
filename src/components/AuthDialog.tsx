'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  MapPin,
  Building2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { useTheme } from 'next-themes';
import { COUNTRIES as ALL_COUNTRIES, CITIES_BY_COUNTRY as ALL_CITIES } from '@/lib/countries';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { Checkbox } from '@/components/ui/checkbox';

// Check if hCaptcha site key is configured (only available on client)
const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';

/* Type for the hCaptcha global injected by their script */
interface HCaptchaAPI {
  render(container: HTMLElement, options: Record<string, unknown>): number;
  remove(widgetId: number): void;
}

declare global {
  interface Window {
    hcaptcha?: HCaptchaAPI;
  }
}

/* ------------------------------------------------------------------ */
/*  hCaptcha Widget — loads hCaptcha API script directly              */
/* ------------------------------------------------------------------ */
function HCaptchaWidget({
  sitekey,
  onVerify,
  onExpire,
  theme = 'dark',
}: {
  sitekey: string;
  onVerify: (token: string) => void;
  onExpire: () => void;
  theme?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const isRenderedRef = useRef(false);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!sitekey || !containerRef.current) return;
    isRenderedRef.current = false;

    const renderWidget = () => {
      const hcaptcha = window.hcaptcha;
      if (!hcaptcha || !containerRef.current || isRenderedRef.current) return;

      if (widgetIdRef.current !== null) {
        try { hcaptcha.remove(widgetIdRef.current); } catch {}
      }

      containerRef.current.innerHTML = '';

      try {
        widgetIdRef.current = hcaptcha.render(containerRef.current, {
          sitekey,
          theme,
          callback: (token: string) => onVerifyRef.current(token),
          'expired-callback': () => onExpireRef.current(),
        });
        isRenderedRef.current = true;
      } catch (err) {
        // hCaptcha render failed — widget will not be shown
      }
    };

    if (window.hcaptcha) {
      renderWidget();
    } else {
      const existingScript = document.querySelector('script[src*="hcaptcha"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit&hl=en';
        script.async = true;
        script.onload = () => setTimeout(renderWidget, 200);
        document.head.appendChild(script);
      } else {
        const checkReady = () => {
          if (window.hcaptcha) renderWidget();
          else setTimeout(checkReady, 100);
        };
        checkReady();
      }
    }

    return () => {
      if (widgetIdRef.current !== null && window.hcaptcha) {
        try { window.hcaptcha.remove(widgetIdRef.current); widgetIdRef.current = null; } catch {}
      }
      isRenderedRef.current = false;
    };
  }, [sitekey, theme]);

  return (
    <div ref={containerRef} role="img" aria-label="hCaptcha verification challenge" className="flex justify-center items-center w-full min-h-[78px]" />
  );
}

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  onOpenLegal?: (type: 'terms' | 'privacy') => void;
}

const COUNTRIES = ALL_COUNTRIES;
const CITIES_BY_COUNTRY = ALL_CITIES;

/* ------------------------------------------------------------------ */
/*  Inline Validation Helpers                                         */
/* ------------------------------------------------------------------ */

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  country?: string;
  city?: string;
  newPassword?: string;
  resetOtp?: string;
}

function validateName(value: string): string | undefined {
  if (!value.trim()) return 'Name is required';
  if (value.trim().length < 2) return 'Name must be at least 2 characters';
  return undefined;
}

function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
  return undefined;
}

function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
  if (!/\d/.test(value)) return 'Password must contain a number';
  return undefined;
}

function validateLoginPassword(value: string): string | undefined {
  if (!value) return 'Password is required';
  return undefined;
}

function validateConfirmPassword(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return undefined;
}

/* ------------------------------------------------------------------ */
/*  OTP Input Component — 8 digits, auto-advance                      */
/* ------------------------------------------------------------------ */

function OtpInput({
  value,
  onChange,
  disabled,
  length = 8,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  length?: number;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    if (digit.length > 1) {
      const pasted = digit.replace(/\D/g, '').slice(0, length - index);
      const newValue = value.padEnd(length, ' ').split('');
      for (let i = 0; i < pasted.length; i++) {
        newValue[index + i] = pasted[i];
      }
      onChange(newValue.join('').replace(/\s/g, ''));
      inputRefs.current[Math.min(index + pasted.length, length - 1)]?.focus();
      return;
    }

    const newValue = value.padEnd(length, ' ').split('');
    newValue[index] = digit;
    onChange(newValue.slice(0, length).join('').replace(/\s/g, ''));

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        const newValue = value.padEnd(length, ' ').split('');
        newValue[index - 1] = '';
        onChange(newValue.join('').replace(/\s/g, ''));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newValue = value.padEnd(length, ' ').split('');
        newValue[index] = '';
        onChange(newValue.join('').replace(/\s/g, ''));
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          className="w-11 h-13 text-center text-lg font-bold bg-secondary/50 border border-border rounded-lg focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
          aria-label={`Digit ${i + 1} of OTP`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Password Requirements Indicator — lightweight, no motion          */
/* ------------------------------------------------------------------ */

function PasswordRequirements({ password, confirmPassword }: { password: string; confirmPassword?: string }) {
  if (!password) return null;
  const checks = [
    { ok: password.length >= 8, label: 'At least 8 characters' },
    { ok: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { ok: /[a-z]/.test(password), label: 'One lowercase letter' },
    { ok: /\d/.test(password), label: 'One number' },
    ...(confirmPassword !== undefined ? [{ ok: password === confirmPassword && confirmPassword.length > 0, label: 'Passwords match' }] : []),
  ];
  return (
    <div className="space-y-1.5 p-3 rounded-lg bg-secondary/30 border border-border">
      <p className="text-xs font-medium text-muted-foreground mb-1.5">Password requirements:</p>
      {checks.map((req) => (
        <div key={req.label} className="flex items-center gap-2">
          <CheckCircle2 className={`h-3.5 w-3.5 ${req.ok ? 'text-emerald-500' : 'text-muted-foreground/40'}`} />
          <span className={`text-xs ${req.ok ? 'text-emerald-500' : 'text-muted-foreground/60'}`}>{req.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Error Message — lightweight, no motion                            */
/* ------------------------------------------------------------------ */

function FieldError({ message }: { message: string }) {
  return (
    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
      <XCircle className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

function FieldSuccess({ message }: { message: string }) {
  return (
    <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
      <CheckCircle2 className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Main AuthDialog Component                                         */
/* ------------------------------------------------------------------ */

type Step = 'form' | 'verify-otp' | 'forgot-password' | 'forgot-verify' | 'forgot-reset';

export default function AuthDialog({ isOpen, onClose, defaultMode = 'login', onOpenLegal }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [step, setStep] = useState<Step>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { loginWithEmailPassword, sendOtp, verifyOtp, signup: authSignup, loginWithOAuth, forgotPassword, resetPassword } = useAuth();
  const { navigate } = useNavigation();
  const { resolvedTheme } = useTheme();
  const [oAuthLoading, setOAuthLoading] = useState<'google' | 'github' | null>(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);
  const hcaptchaTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  // OTP fields
  const [loginError, setLoginError] = useState<{ type: string; message: string } | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Memoize cities list
  const cities = useMemo(() => (country ? CITIES_BY_COUNTRY[country] || [] : []), [country]);

  // Filtered countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase();
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q));
  }, [countrySearch]);

  // Filtered cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const q = citySearch.toLowerCase();
    return cities.filter(c => c.toLowerCase().includes(q));
  }, [citySearch, cities]);

  // Selected country/city display names
  const selectedCountryName = useMemo(() => {
    const c = COUNTRIES.find(c => c.code === country);
    return c ? c.name : '';
  }, [country]);

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setCountry('');
    setCity('');
    setShowPassword(false);
    setTouched({});
    setOtpCode('');
    setOtpError('');
    setCaptchaToken('');
    setCaptchaKey((prev) => prev + 1);
    setStep('form');
    setResendCooldown(0);
    setLoginError(null);
    setForgotEmail('');
    setForgotOtpCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotError('');
    setCountrySearch('');
    setCitySearch('');
    setShowCountryDropdown(false);
    setShowCityDropdown(false);
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }
  }, []);

  const switchMode = useCallback((newMode: 'login' | 'signup') => {
    resetForm();
    setMode(newMode);
  }, [resetForm]);

  // Sync mode when defaultMode prop changes
  useEffect(() => {
    setMode(defaultMode);
    resetForm();
  }, [defaultMode, resetForm]);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!showCountryDropdown && !showCityDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setShowCountryDropdown(false);
        setShowCityDropdown(false);
        setCountrySearch('');
        setCitySearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryDropdown, showCityDropdown]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset city when country changes
  useEffect(() => { setCity(''); }, [country]);

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) {
      if (cooldownRef.current) { clearInterval(cooldownRef.current); cooldownRef.current = null; }
      return;
    }
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { if (cooldownRef.current) { clearInterval(cooldownRef.current); cooldownRef.current = null; } return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (cooldownRef.current) { clearInterval(cooldownRef.current); cooldownRef.current = null; } };
  }, [resendCooldown > 0]);

  // Compute inline errors (only show for touched fields)
  const errors: FieldErrors = useMemo(() => {
    const e: FieldErrors = {};
    if (mode === 'signup' && step === 'form') {
      if (touched.name) e.name = validateName(name);
      if (touched.email) e.email = validateEmail(email);
      if (touched.password) e.password = validatePassword(password);
      if (touched.confirmPassword) e.confirmPassword = validateConfirmPassword(password, confirmPassword);
      if (touched.country) e.country = country ? undefined : 'Please select a country';
      if (touched.city) e.city = city ? undefined : 'Please select a city';
    } else if (mode === 'login' && step === 'form') {
      if (touched.email) e.email = validateEmail(email);
      if (touched.password) e.password = validateLoginPassword(password);
    }
    return e;
  }, [mode, step, touched, name, email, password, confirmPassword, country, city]);

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  /* ──────────── Login / Signup Form Submit ──────────── */

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup') {
      setTouched({ name: true, email: true, password: true, confirmPassword: true, country: true, city: true });
      const nameErr = validateName(name);
      const emailErr = validateEmail(email);
      const passErr = validatePassword(password);
      const confirmErr = validateConfirmPassword(password, confirmPassword);
      const countryErr = country ? undefined : 'Please select a country';
      const cityErr = city ? undefined : 'Please select a city';
      if (nameErr || emailErr || passErr || confirmErr || countryErr || cityErr) {
        toast.error('Please fix the errors below.');
        return;
      }
      if (HCAPTCHA_SITE_KEY && !captchaToken) {
        toast.error('Please complete the captcha verification.');
        return;
      }
    } else {
      setTouched({ email: true, password: true });
      const emailErr = validateEmail(email);
      const passErr = validateLoginPassword(password);
      if (emailErr || passErr) {
        toast.error('Please fix the errors below.');
        return;
      }
    }

    setLoading(true);
    setLoginError(null);

    try {
      if (mode === 'login') {
        const result = await loginWithEmailPassword(email, password, rememberMe);
        if (result.success) {
          toast.success('Login successful! Welcome back.');
          resetForm();
          onClose();
          setTimeout(() => navigate('dashboard'), 100);
        } else if (result.needsVerification) {
          setStep('verify-otp');
          setResendCooldown(60);
          toast.info('A verification code has been sent to your email.');
        } else {
          setLoginError({ type: 'error', message: result.error || 'Login failed.' });
          toast.error(result.error || 'Login failed.');
          setPassword('');
        }
      } else {
        const result = await authSignup({ name, email, password, country, city, captchaToken });
        if (result.success) {
          setStep('verify-otp');
          setResendCooldown(60);
          setCaptchaToken('');
          setCaptchaKey((prev) => prev + 1);
          toast.success('Account created! A verification code has been sent to your email.');
        } else {
          toast.error(result.error || 'Failed to create account.');
        }
      }
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ──────────── OTP Verification ──────────── */

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 8) { setOtpError('Please enter the complete 8-digit code.'); return; }

    setLoading(true);
    setOtpError('');
    try {
      const result = await verifyOtp(email, otpCode, 'email');
      if (result.success) {
        toast.success(mode === 'login' ? 'Email verified! Welcome back.' : 'Email verified! Welcome to ABWcurious.');
        resetForm();
        onClose();
        setTimeout(() => navigate('dashboard'), 100);
      } else {
        setOtpError(result.error || 'Invalid code. Please try again.');
      }
    } catch {
      setOtpError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ──────────── Resend OTP ──────────── */

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const result = await sendOtp(email);
      if (result.success) { setResendCooldown(60); toast.success('A new code has been sent to your email.'); setOtpError(''); setOtpCode(''); }
      else { toast.error(result.error || 'Failed to resend code.'); }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ──────────── OAuth Login ──────────── */

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOAuthLoading(provider);
    try {
      const result = await loginWithOAuth(provider);
      if (!result.success && result.error) {
        if (result.error.includes('not configured') || result.error.includes('503')) {
          toast.error(`${provider === 'google' ? 'Google' : 'GitHub'} login is not available right now.`);
        } else if (result.error.includes('OAuth is not configured correctly')) {
          toast.error('OAuth is not configured. Please update the Supabase Dashboard Site URL.');
        } else {
          toast.error(result.error || `Failed to connect with ${provider === 'google' ? 'Google' : 'GitHub'}.`);
        }
      }
    } catch {
      toast.error('Network error. Please check your connection.');
    } finally {
      setOAuthLoading(null);
    }
  };

  /* ──────────── Forgot Password Flow ──────────── */

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(forgotEmail)) { toast.error('Please enter a valid email address.'); return; }

    setLoading(true);
    setForgotError('');
    try {
      const result = await forgotPassword(forgotEmail);
      if (result.success) {
        setStep('forgot-verify');
        setResendCooldown(60);
        toast.success('A password reset code has been sent to your email.');
      } else {
        setForgotError(result.error || 'Failed to send reset code.');
      }
    } catch {
      setForgotError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendForgotOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const result = await forgotPassword(forgotEmail);
      if (result.success) { setResendCooldown(60); toast.success('A new reset code has been sent.'); setForgotOtpCode(''); }
      else { toast.error(result.error || 'Failed to resend.'); }
    } catch {
      toast.error('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotOtpCode.length !== 8) { setForgotError('Please enter the complete 8-digit code.'); return; }
    const passErr = validatePassword(newPassword);
    if (passErr) { setForgotError(passErr); return; }
    if (newPassword !== confirmNewPassword) { setForgotError('Passwords do not match.'); return; }

    setLoading(true);
    setForgotError('');
    try {
      const result = await resetPassword(forgotEmail, forgotOtpCode, newPassword);
      if (result.success) {
        toast.success('Password reset successfully! Please sign in with your new password.');
        setStep('form');
        setMode('login');
        setEmail(forgotEmail);
        setPassword('');
        setForgotEmail('');
        setForgotOtpCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setLoginError(null);
      } else {
        setForgotError(result.error || 'Failed to reset password.');
      }
    } catch {
      setForgotError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ──────────── Navigation Helpers ──────────── */

  const handleBackToForm = () => { setStep('form'); setOtpCode(''); setOtpError(''); };
  const handleBackToForgot = () => { setStep('forgot-password'); setForgotOtpCode(''); setNewPassword(''); setConfirmNewPassword(''); setForgotError(''); };

  /* ══════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                           */
  /* ══════════════════════════════════════════════════════════════════ */

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <div
              className="relative w-full max-w-md glass-card overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient border top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 z-10"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">

                  {/* ═══════ FORGOT PASSWORD: Step 1 — Enter Email ═══════ */}
                  {step === 'forgot-password' && (
                    <motion.div key="forgot-password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                          <KeyRound className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>Forgot Password?</h2>
                        <p className="text-muted-foreground text-sm mt-1">Enter your email and we&apos;ll send you a reset code.</p>
                      </div>

                      <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="forgot-email" className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="forgot-email" type="email" placeholder="you@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="pl-10 bg-secondary/50 border-border focus:border-primary/50 rounded-lg h-11" disabled={loading} />
                          </div>
                        </div>

                        {forgotError && (
                          <div className="rounded-lg p-3 text-sm bg-destructive/10 border border-destructive/30 text-destructive flex items-start gap-2">
                            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>{forgotError}</p>
                          </div>
                        )}

                        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold h-11 rounded-lg hover:shadow-lg transition-all duration-200">
                          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <>Send Reset Code</>}
                        </Button>
                      </form>

                      <div className="mt-5 text-center">
                        <button type="button" onClick={handleBackToForm} className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                          <ArrowLeft className="h-3.5 w-3.5" />Back to login
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ═══════ FORGOT PASSWORD: Step 2 — Verify OTP ═══════ */}
                  {step === 'forgot-verify' && (
                    <motion.div key="forgot-verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                          <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>Enter Reset Code</h2>
                        <p className="text-muted-foreground text-sm mt-1">We sent a code to</p>
                        <p className="text-foreground text-sm font-semibold mt-0.5">{forgotEmail}</p>
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); setStep('forgot-reset'); setForgotError(''); }} className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-3 text-center">Enter verification code</label>
                          <OtpInput value={forgotOtpCode} onChange={setForgotOtpCode} disabled={loading} />
                        </div>

                        {forgotError && (
                          <div className="rounded-lg p-3 text-sm bg-destructive/10 border border-destructive/30 text-destructive flex items-start gap-2">
                            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>{forgotError}</p>
                          </div>
                        )}

                        <Button type="submit" disabled={loading || forgotOtpCode.length !== 8} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold h-11 rounded-lg hover:shadow-lg transition-all duration-200">
                          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : <><KeyRound className="w-4 h-4 mr-2" />Continue</>}
                        </Button>
                      </form>

                      <div className="mt-5 space-y-3">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Didn&apos;t receive the code?{' '}
                            <button type="button" onClick={handleResendForgotOtp} disabled={resendCooldown > 0 || loading} className="text-primary font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                            </button>
                          </p>
                        </div>
                        <div className="text-center">
                          <button type="button" onClick={handleBackToForgot} className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                            <ArrowLeft className="h-3.5 w-3.5" />Back
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ═══════ FORGOT PASSWORD: Step 3 — Set New Password ═══════ */}
                  {step === 'forgot-reset' && (
                    <motion.div key="forgot-reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                          <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>Set New Password</h2>
                        <p className="text-muted-foreground text-sm mt-1">Enter your new password below.</p>
                      </div>

                      <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                        {/* New Password */}
                        <div>
                          <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="new-password" type={showPassword ? 'text' : 'password'} placeholder="Min 8 chars, upper, lower, number" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 pr-10 bg-secondary/50 border-border focus:border-primary/50 rounded-lg h-11" disabled={loading} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Password Requirements */}
                        <PasswordRequirements password={newPassword} confirmPassword={confirmNewPassword} />

                        {/* Confirm New Password */}
                        <div>
                          <label htmlFor="confirm-new-password" className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="confirm-new-password" type={showPassword ? 'text' : 'password'} placeholder="Confirm your new password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={`pl-10 bg-secondary/50 border-border focus:border-primary/50 rounded-lg h-11 ${confirmNewPassword && confirmNewPassword === newPassword ? 'border-emerald-500/50' : ''}`} disabled={loading} />
                          </div>
                          {confirmNewPassword && confirmNewPassword === newPassword && (
                            <FieldSuccess message="Passwords match" />
                          )}
                          {confirmNewPassword && confirmNewPassword !== newPassword && (
                            <FieldError message="Passwords do not match" />
                          )}
                        </div>

                        <PasswordStrengthMeter password={newPassword} />

                        {forgotError && (
                          <div className="rounded-lg p-3 text-sm bg-destructive/10 border border-destructive/30 text-destructive flex items-start gap-2">
                            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>{forgotError}</p>
                          </div>
                        )}

                        <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold h-11 rounded-lg hover:shadow-lg transition-all duration-200">
                          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resetting...</> : <><ShieldCheck className="w-4 h-4 mr-2" />Reset Password</>}
                        </Button>
                      </form>

                      <div className="mt-5 text-center">
                        <button type="button" onClick={handleBackToForgot} className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                          <ArrowLeft className="h-3.5 w-3.5" />Back
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ═══════ OTP Verification Step (Signup / Login) ═══════ */}
                  {step === 'verify-otp' && (
                    <motion.div key="verify-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                          <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>Verify Your Email</h2>
                        <p className="text-muted-foreground text-sm mt-1">We&apos;ve sent a verification code to</p>
                        <p className="text-foreground text-sm font-semibold mt-0.5">{email}</p>
                      </div>

                      <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-3 text-center">Enter verification code</label>
                          <OtpInput value={otpCode} onChange={setOtpCode} disabled={loading} />
                        </div>

                        {otpError && (
                          <div className="rounded-lg p-3 text-sm bg-destructive/10 border border-destructive/30 text-destructive flex items-start gap-2">
                            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>{otpError}</p>
                          </div>
                        )}

                        <Button type="submit" disabled={loading || otpCode.length !== 8} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold h-11 rounded-lg hover:shadow-lg transition-all duration-200">
                          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : <><KeyRound className="w-4 h-4 mr-2" />Verify Code</>}
                        </Button>
                      </form>

                      <div className="mt-5 space-y-3">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Didn&apos;t receive the code?{' '}
                            <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0 || loading} className="text-primary font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                            </button>
                          </p>
                        </div>
                        <div className="text-center">
                          <button type="button" onClick={handleBackToForm} className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                            <ArrowLeft className="h-3.5 w-3.5" />Back to {mode === 'login' ? 'login' : 'signup'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ═══════ Form Step (Login / Signup) ═══════ */}
                  {step === 'form' && (
                    <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                      {/* Header */}
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 mb-4 overflow-hidden">
                          <img src="/logo.svg" alt="ABWcurious" className="w-20 h-20 object-contain" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
                          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          {mode === 'login' ? 'Sign in with your email and password' : 'Join ABWcurious and start your journey'}
                        </p>
                      </div>

                      {/* OAuth Buttons */}
                      <div className="space-y-3 mb-5">
                        {/* Google OAuth */}
                        <Button type="button" variant="outline" disabled={loading || oAuthLoading !== null} onClick={() => handleOAuth('google')} className="w-full h-11 rounded-lg bg-white dark:bg-red-50 border-border hover:bg-red-50 dark:hover:bg-red-100 text-gray-700 dark:text-red-700 font-medium transition-all duration-200 flex items-center justify-center gap-2.5">
                          {oAuthLoading === 'google' ? (<><Loader2 className="w-4 h-4 animate-spin" />Connecting to Google...</>) : (
                            <>
                              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                              Continue with Google
                            </>
                          )}
                        </Button>

                        {/* GitHub OAuth */}
                        <Button type="button" variant="outline" disabled={loading || oAuthLoading !== null} onClick={() => handleOAuth('github')} className="w-full h-11 rounded-lg bg-[#24292e] dark:bg-[#2d333b] border-[#24292e] dark:border-[#2d333b] hover:bg-[#2f363d] dark:hover:bg-[#373e47] text-white font-medium transition-all duration-200 flex items-center justify-center gap-2.5">
                          {oAuthLoading === 'github' ? (<><Loader2 className="w-4 h-4 animate-spin" />Connecting to GitHub...</>) : (
                            <>
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                              Continue with GitHub
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Divider */}
                      <div className="relative mb-5">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-background px-3 text-muted-foreground">or continue with email</span>
                        </div>
                      </div>

                      {/* ═══════════ Form ═══════════ */}
                      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>

                        {/* Name field - signup only */}
                        {mode === 'signup' && (
                          <div>
                            <label htmlFor="auth-name" className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input id="auth-name" type="text" placeholder="Enter Your Full Name" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => markTouched('name')} className={`pl-10 bg-secondary/50 border-border focus:border-primary/50 rounded-lg h-11 ${touched.name && errors.name ? 'border-destructive focus:border-destructive' : ''}`} disabled={loading} />
                            </div>
                            {touched.name && errors.name && <FieldError message={errors.name} />}
                          </div>
                        )}

                        {/* Email */}
                        <div>
                          <label htmlFor="auth-email" className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="auth-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => markTouched('email')} className={`pl-10 bg-secondary/50 border-border focus:border-primary/50 rounded-lg h-11 ${touched.email && errors.email ? 'border-destructive focus:border-destructive' : ''}`} disabled={loading} />
                          </div>
                          {touched.email && errors.email && <FieldError message={errors.email} />}
                          {touched.email && !errors.email && email.trim() && <FieldSuccess message="Valid email" />}
                        </div>

                        {/* Password */}
                        <div>
                          <label htmlFor="auth-password" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="auth-password" type={showPassword ? 'text' : 'password'} placeholder={mode === 'signup' ? 'Min 8 chars, upper, lower, number' : 'Enter your password'} value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => markTouched('password')} className={`pl-10 pr-10 bg-secondary/50 border-border focus:border-primary/50 rounded-lg h-11 ${touched.password && errors.password ? 'border-destructive focus:border-destructive' : ''}`} disabled={loading} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {touched.password && errors.password && <FieldError message={errors.password} />}
                        </div>

                        {/* Login Error Banner */}
                        {mode === 'login' && loginError && (
                          <div className="rounded-lg p-3 text-sm bg-destructive/10 border border-destructive/30 text-destructive flex items-start gap-2.5">
                            {loginError.type === 'no_account' ? <UserPlus className="h-4 w-4 mt-0.5 shrink-0" /> : <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />}
                            <div>
                              <p className="font-medium">{loginError.message}</p>
                              {loginError.type === 'no_account' && (
                                <button type="button" onClick={() => switchMode('signup')} className="text-xs font-semibold text-primary hover:underline mt-1">Create an account instead</button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Remember Me — login only */}
                        {mode === 'login' && (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="remember-me"
                              checked={rememberMe}
                              onCheckedChange={(checked) => setRememberMe(checked === true)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer select-none">
                              Remember me for 30 days
                            </label>
                          </div>
                        )}

                        {/* Signup-only fields */}
                        {mode === 'signup' && (
                          <div className="space-y-4">
                            {/* Confirm Password */}
                            <div>
                              <label htmlFor="auth-confirm-password" className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="auth-confirm-password" type={showPassword ? 'text' : 'password'} placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onBlur={() => markTouched('confirmPassword')} className={`pl-10 bg-secondary/50 border-border focus:border-primary/50 rounded-lg h-11 ${touched.confirmPassword && errors.confirmPassword ? 'border-destructive focus:border-destructive' : touched.confirmPassword && !errors.confirmPassword && confirmPassword ? 'border-emerald-500/50' : ''}`} disabled={loading} />
                              </div>
                              {touched.confirmPassword && errors.confirmPassword && <FieldError message={errors.confirmPassword} />}
                              {touched.confirmPassword && !errors.confirmPassword && confirmPassword && <FieldSuccess message="Passwords match" />}
                            </div>

                            {/* Password Requirements */}
                            <PasswordRequirements password={password} confirmPassword={confirmPassword} />
                            <PasswordStrengthMeter password={password} />

                            {/* Country searchable select */}
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1.5">Country</label>
                              <div className="relative" data-dropdown>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                  <Input
                                    type="text"
                                    placeholder="Type to search country..."
                                    value={showCountryDropdown ? countrySearch : selectedCountryName || countrySearch}
                                    onChange={(e) => { setCountrySearch(e.target.value); setShowCountryDropdown(true); }}
                                    onFocus={() => setShowCountryDropdown(true)}
                                    className={`pl-10 pr-9 bg-secondary/50 border-border rounded-lg h-11 ${touched.country && errors.country ? 'border-destructive' : country ? 'border-emerald-500/50' : ''}`}
                                    disabled={loading}
                                  />
                                  <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showCountryDropdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </button>
                                </div>
                                {showCountryDropdown && filteredCountries.length > 0 && (
                                  <div className="absolute z-[200] top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
                                    {filteredCountries.slice(0, 50).map((c) => (
                                      <button
                                        key={c.code}
                                        type="button"
                                        onClick={() => {
                                          setCountry(c.code);
                                          setCountrySearch('');
                                          setShowCountryDropdown(false);
                                          setCity('');
                                          setCitySearch('');
                                          markTouched('country');
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors ${country === c.code ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground'}`}
                                      >
                                        {c.name}
                                      </button>
                                    ))}
                                    {filteredCountries.length > 50 && (
                                      <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
                                        Type to search more countries...
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              {touched.country && errors.country && <FieldError message={errors.country} />}
                            </div>

                            {/* City searchable select */}
                            {country && cities.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
                                <div className="relative" data-dropdown>
                                  <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                      type="text"
                                      placeholder="Type to search city..."
                                      value={showCityDropdown ? citySearch : (city || citySearch)}
                                      onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                                      onFocus={() => setShowCityDropdown(true)}
                                      className={`pl-10 pr-9 bg-secondary/50 border-border rounded-lg h-11 ${touched.city && errors.city ? 'border-destructive' : city ? 'border-emerald-500/50' : ''}`}
                                      disabled={loading}
                                    />
                                    <button
                                      type="button"
                                      tabIndex={-1}
                                      onClick={() => setShowCityDropdown(!showCityDropdown)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                      {showCityDropdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                  </div>
                                  {showCityDropdown && filteredCities.length > 0 && (
                                    <div className="absolute z-[200] top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
                                      {filteredCities.slice(0, 50).map((c) => (
                                        <button
                                          key={c}
                                          type="button"
                                          onClick={() => {
                                            setCity(c);
                                            setCitySearch('');
                                            setShowCityDropdown(false);
                                            markTouched('city');
                                          }}
                                          className={`w-full text-left px-3 py-2 text-sm hover:bg-accent/50 transition-colors ${city === c ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground'}`}
                                        >
                                          {c}
                                        </button>
                                      ))}
                                      {filteredCities.length > 50 && (
                                        <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
                                          Type to search more cities...
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {touched.city && errors.city && <FieldError message={errors.city} />}
                              </div>
                            )}

                            {/* hCaptcha */}
                            {HCAPTCHA_SITE_KEY && (
                              <div className="flex justify-center py-3 min-h-[78px]">
                                <HCaptchaWidget key={captchaKey} sitekey={HCAPTCHA_SITE_KEY} onVerify={(token: string) => setCaptchaToken(token)} onExpire={() => setCaptchaToken('')} theme={hcaptchaTheme} />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Submit Button */}
                        <Button type="submit" disabled={loading || (mode === 'signup' && !!HCAPTCHA_SITE_KEY && !captchaToken)} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold h-11 rounded-lg hover:shadow-lg transition-all duration-200">
                          {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{mode === 'login' ? 'Signing in...' : 'Creating account...'}</>) : (
                            mode === 'login' ? (<><LogIn className="w-4 h-4 mr-2" />Sign In</>) : (<><UserPlus className="w-4 h-4 mr-2" />Create Account</>)
                          )}
                        </Button>
                      </form>

                      {/* Forgot Password — login mode only */}
                      {mode === 'login' && (
                        <div className="mt-3 text-center">
                          <button type="button" onClick={() => { setStep('forgot-password'); setLoginError(null); setForgotError(''); }} className="text-sm text-primary hover:underline font-medium transition-colors">
                            Forgot your password?
                          </button>
                        </div>
                      )}

                      {/* Switch mode */}
                      <div className="mt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                          <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} className="text-primary font-semibold hover:underline transition-all">
                            {mode === 'login' ? 'Sign Up' : 'Sign In'}
                          </button>
                        </p>
                      </div>

                      {/* Terms — signup only */}
                      {mode === 'signup' && (
                        <p className="mt-4 text-center text-[11px] text-muted-foreground/60 leading-relaxed">
                          By creating an account, you agree to our{' '}
                          <button type="button" onClick={() => onOpenLegal?.('terms') || toast.info('Please see our Terms & Conditions in the footer.')} className="text-primary hover:underline transition-all">Terms of Service</button>
                          {' '}and{' '}
                          <button type="button" onClick={() => onOpenLegal?.('privacy') || toast.info('Please see our Privacy Policy in the footer.')} className="text-primary hover:underline transition-all">Privacy Policy</button>.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
