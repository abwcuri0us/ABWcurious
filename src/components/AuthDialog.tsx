'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Shield,
  Sparkles,
  CheckCircle2,
  XCircle,
  MapPin,
  Building2,
  ChevronsUpDown,
  Check,
  Search,
  Phone,
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
import { COUNTRIES, CITIES_BY_COUNTRY } from '@/lib/countries';

interface UserData {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role?: string;
}

interface AuthDialogProps {
  isOpen: boolean;
  onClose: (userData?: UserData) => void;
  defaultMode?: 'login' | 'signup';
  onOpenLegal?: (type: 'terms' | 'privacy') => void;
}

/* ──────────── Inline Validation Helpers ──────────── */

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  country?: string;
  city?: string;
  phone?: string;
  pincode?: string;
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

function validateConfirmPassword(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return undefined;
}

function validatePhone(value: string): string | undefined {
  if (!value.trim()) return undefined; // Optional field
  if (!/^\+?\d{7,15}$/.test(value.trim())) return 'Phone must be 7-15 digits (optional + prefix)';
  return undefined;
}

function validatePincode(value: string): string | undefined {
  if (!value.trim()) return undefined; // Optional field
  if (!/^[a-zA-Z0-9]{5,10}$/.test(value.trim())) return 'Pincode must be 5-10 alphanumeric characters';
  return undefined;
}

/* ──────────── Searchable Combobox Sub-Component ──────────── */

interface SearchableSelectProps {
  options: { value: string; label: string; searchHint?: string }[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  emptyMessage: string;
  icon: React.ReactNode;
  hasError?: boolean;
  isValid?: boolean;
  disabled?: boolean;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}

function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder,
  emptyMessage,
  icon,
  hasError,
  isValid,
  disabled,
  ariaLabelledby,
  ariaDescribedby,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const listboxId = useRef(`combobox-listbox-${Math.random().toString(36).slice(2, 9)}`);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedLabel = value
    ? options.find((o) => o.value === value)?.label
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId.current}
          aria-haspopup="listbox"
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          disabled={disabled}
          className={`w-full flex items-center justify-between rounded-lg h-11 px-3 text-left text-sm
            bg-secondary/50 border transition-colors
            ${hasError ? 'border-destructive' : isValid ? 'border-emerald-500/50' : 'border-border'}
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
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        style={{ maxWidth: '400px' }}
      >
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput placeholder={placeholder} className="h-9" />
          </div>
          <CommandList id={listboxId.current} className="max-h-[200px]">
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

/* ──────────── Component ──────────── */

export default function AuthDialog({ isOpen, onClose, defaultMode = 'login', onOpenLegal }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setCountry('');
    setCity('');
    setPhone('');
    setPincode('');
    setShowPassword(false);
    setTouched({});
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

  // Close on Escape key & basic focus trap
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Basic focus trap: keep Tab within dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    // Focus the dialog container when opened
    setTimeout(() => dialogRef.current?.focus(), 50);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset city when country changes
  useEffect(() => {
    setCity('');
  }, [country]);

  // Compute inline errors (only show for touched fields)
  const errors: FieldErrors = {};
  if (mode === 'signup') {
    if (touched.name) errors.name = validateName(name);
    if (touched.email) errors.email = validateEmail(email);
    if (touched.password) errors.password = validatePassword(password);
    if (touched.confirmPassword) errors.confirmPassword = validateConfirmPassword(password, confirmPassword);
    if (touched.country) errors.country = country ? undefined : 'Please select a country';
    if (touched.city) errors.city = city ? undefined : 'Please select a city';
    if (touched.phone) errors.phone = validatePhone(phone);
    if (touched.pincode) errors.pincode = validatePincode(pincode);
  } else {
    if (touched.email) errors.email = validateEmail(email);
    if (touched.password) errors.password = password ? undefined : 'Password is required';
  }

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched to show errors
    if (mode === 'signup') {
      setTouched({ name: true, email: true, password: true, confirmPassword: true, country: true, city: true, phone: true, pincode: true });

      // Validate all fields
      const nameErr = validateName(name);
      const emailErr = validateEmail(email);
      const passErr = validatePassword(password);
      const confirmErr = validateConfirmPassword(password, confirmPassword);
      const countryErr = country ? undefined : 'Please select a country';
      const cityErr = city ? undefined : 'Please select a city';
      const pincodeErr = validatePincode(pincode);
      const phoneErr = validatePhone(phone);

      if (nameErr || emailErr || passErr || confirmErr || countryErr || cityErr || phoneErr || pincodeErr) {
        toast.error('Please fix the errors below.');
        return;
      }
    } else {
      setTouched({ email: true, password: true });
      const emailErr = validateEmail(email);
      const passErr = password ? undefined : 'Password is required';
      if (emailErr || passErr) {
        toast.error('Please fix the errors below.');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const body =
        mode === 'signup'
          ? { name, email, password, country, city, phone: phone || undefined, pincode: pincode || undefined }
          : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (mode === 'signup') {
          toast.success('Account created! Please check your email to verify your account.', {
            duration: 5000,
          });
          setMode('login');
          resetForm();
        } else {
          toast.success('Welcome back! Login successful.');
          // Pass user data from API response directly to parent
          // This avoids cookie timing issues - cookies are also set server-side
          const userData = data.data?.user as UserData | undefined;
          onClose(userData);
          resetForm();
        }
      } else {
        toast.error(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const cities = country ? CITIES_BY_COUNTRY[country] || [] : [];

  // Build country options for the searchable select
  const countryOptions = COUNTRIES.map((c) => ({
    value: c.code,
    label: c.name,
    searchHint: `${c.name} ${c.code} ${c.phoneCode || ''}`,
  }));

  // Build city options for the searchable select
  const cityOptions = cities.map((c) => ({
    value: c,
    label: c,
  }));

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
            onClick={() => onClose()}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-dialog-title"
              tabIndex={-1}
              className="relative w-full max-w-md glass-card overflow-hidden max-h-[90vh] overflow-y-auto focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient border top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary" />

              {/* Close button */}
              <button
                onClick={() => onClose()}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 z-10"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                    {mode === 'login' ? (
                      <Shield className="w-7 h-7 text-primary" />
                    ) : (
                      <Sparkles className="w-7 h-7 text-primary" />
                    )}
                  </div>
                  <h2
                    id="auth-dialog-title"
                    className="text-2xl font-bold text-foreground"
                    style={{ fontFamily: 'var(--font-sora)' }}
                  >
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {mode === 'login'
                      ? 'Sign in to access your ABWcurious dashboard'
                      : 'Join ABWcurious and start your journey'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Name field - signup only */}
                  <AnimatePresence mode="wait">
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label
                          htmlFor="auth-name"
                          className="block text-sm font-medium text-foreground mb-1.5"
                        >
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="auth-name"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={() => markTouched('name')}
                            aria-invalid={touched.name && !!errors.name}
                            aria-describedby={touched.name && errors.name ? 'auth-name-error' : undefined}
                            className={`pl-10 bg-secondary/50 border-border focus:border-primary/50 rounded-lg h-11 ${
                              touched.name && errors.name ? 'border-destructive focus:border-destructive' : ''
                            }`}
                            disabled={loading}
                          />
                        </div>
                        {touched.name && errors.name && (
                          <motion.p
                            id="auth-name-error"
                            role="alert"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-destructive mt-1 flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            {errors.name}
                          </motion.p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="auth-email"
                      className="block text-sm font-medium text-foreground mb-1.5"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="auth-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => markTouched('email')}
                        aria-invalid={touched.email && !!errors.email}
                        aria-describedby={touched.email && errors.email ? 'auth-email-error' : undefined}
                        className={`pl-10 bg-secondary/50 border-border focus:border-primary/50 rounded-lg h-11 ${
                          touched.email && errors.email ? 'border-destructive focus:border-destructive' : ''
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {touched.email && errors.email && (
                      <motion.p
                        id="auth-email-error"
                        role="alert"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive mt-1 flex items-center gap-1"
                      >
                        <XCircle className="h-3 w-3" />
                        {errors.email}
                      </motion.p>
                    )}
                    {touched.email && !errors.email && email.trim() && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-emerald-500 mt-1 flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Valid email
                      </motion.p>
                    )}
                  </div>

                  {/* Country & City - signup only */}
                  <AnimatePresence mode="wait">
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {/* Country select - searchable combobox */}
                        <div>
                          <label id="auth-country-label" className="block text-sm font-medium text-foreground mb-1.5">
                            Country
                          </label>
                          <SearchableSelect
                            options={countryOptions}
                            value={country}
                            onValueChange={(val) => {
                              setCountry(val);
                              markTouched('country');
                            }}
                            placeholder="Search or select your country"
                            emptyMessage="No country found."
                            icon={<MapPin className="h-4 w-4 text-muted-foreground shrink-0" />}
                            hasError={!!(touched.country && errors.country)}
                            isValid={!!country}
                            disabled={loading}
                            ariaLabelledby="auth-country-label"
                            ariaDescribedby={touched.country && errors.country ? 'auth-country-error' : undefined}
                          />
                          {touched.country && errors.country && (
                            <motion.p
                              id="auth-country-error"
                              role="alert"
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-destructive mt-1 flex items-center gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              {errors.country}
                            </motion.p>
                          )}
                        </div>

                        {/* City select - searchable combobox for countries with many cities, Select otherwise */}
                        {country && cities.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <label id="auth-city-label" className="block text-sm font-medium text-foreground mb-1.5">
                              City
                            </label>
                            {cities.length > 8 ? (
                              <SearchableSelect
                                options={cityOptions}
                                value={city}
                                onValueChange={(val) => {
                                  setCity(val);
                                  markTouched('city');
                                }}
                                placeholder="Search or select your city"
                                emptyMessage="No city found."
                                icon={<Building2 className="h-4 w-4 text-muted-foreground shrink-0" />}
                                hasError={!!(touched.city && errors.city)}
                                isValid={!!city}
                                disabled={loading}
                                ariaLabelledby="auth-city-label"
                                ariaDescribedby={touched.city && errors.city ? 'auth-city-error' : undefined}
                              />
                            ) : (
                              <Select
                                value={city}
                                onValueChange={(val) => {
                                  setCity(val);
                                  markTouched('city');
                                }}
                              >
                                <SelectTrigger
                                  className={`w-full bg-secondary/50 border-border rounded-lg h-11 ${
                                    touched.city && errors.city
                                      ? 'border-destructive'
                                      : city
                                      ? 'border-emerald-500/50'
                                      : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Select your city" />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  {cities.map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {c}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {touched.city && errors.city && (
                              <motion.p
                                id="auth-city-error"
                                role="alert"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-destructive mt-1 flex items-center gap-1"
                              >
                                <XCircle className="h-3 w-3" />
                                {errors.city}
                              </motion.p>
                            )}
                          </motion.div>
                        )}

                        {/* Contact Number */}
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label
                            htmlFor="auth-phone"
                            className="block text-sm font-medium text-foreground mb-1.5"
                          >
                            Contact Number <span className="text-muted-foreground font-normal">(optional)</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="auth-phone"
                              type="tel"
                              placeholder="+91 XXXXXXXXXX"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              onBlur={() => markTouched('phone')}
                              aria-invalid={touched.phone && !!errors.phone}
                              aria-describedby={touched.phone && errors.phone ? 'auth-phone-error' : undefined}
                              className={`pl-10 bg-secondary/50 border-border focus:border-primary/50 rounded-lg h-11 ${
                                touched.phone && errors.phone ? 'border-destructive focus:border-destructive' : ''
                              }`}
                              disabled={loading}
                              maxLength={16}
                            />
                          </div>
                          {touched.phone && errors.phone && (
                            <motion.p
                              id="auth-phone-error"
                              role="alert"
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-destructive mt-1 flex items-center gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              {errors.phone}
                            </motion.p>
                          )}
                        </motion.div>

                        {/* Pincode */}
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label
                            htmlFor="auth-pincode"
                            className="block text-sm font-medium text-foreground mb-1.5"
                          >
                            Pincode <span className="text-muted-foreground font-normal">(optional)</span>
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="auth-pincode"
                              type="text"
                              placeholder="e.g. 400703"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10))}
                              onBlur={() => markTouched('pincode')}
                              aria-invalid={touched.pincode && !!errors.pincode}
                              aria-describedby={touched.pincode && errors.pincode ? 'auth-pincode-error' : undefined}
                              className={`pl-10 bg-secondary/50 border-border focus:border-primary/50 rounded-lg h-11 ${
                                touched.pincode && errors.pincode ? 'border-destructive focus:border-destructive' : ''
                              }`}
                              disabled={loading}
                              maxLength={10}
                            />
                          </div>
                          {touched.pincode && errors.pincode && (
                            <motion.p
                              id="auth-pincode-error"
                              role="alert"
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-destructive mt-1 flex items-center gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              {errors.pincode}
                            </motion.p>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="auth-password"
                      className="block text-sm font-medium text-foreground mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={mode === 'signup' ? 'Min 8 chars, upper, lower, number' : 'Enter your password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => markTouched('password')}
                        aria-invalid={touched.password && !!errors.password}
                        aria-describedby={touched.password && errors.password ? 'auth-password-error' : undefined}
                        className={`pl-10 pr-10 bg-secondary/50 border-border focus:border-primary/50 rounded-lg h-11 ${
                          touched.password && errors.password ? 'border-destructive focus:border-destructive' : ''
                        }`}
                        disabled={loading}
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
                      <motion.p
                        id="auth-password-error"
                        role="alert"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-destructive mt-1 flex items-center gap-1"
                      >
                        <XCircle className="h-3 w-3" />
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  {/* Confirm Password - signup only */}
                  <AnimatePresence mode="wait">
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label
                          htmlFor="auth-confirm-password"
                          className="block text-sm font-medium text-foreground mb-1.5"
                        >
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="auth-confirm-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onBlur={() => markTouched('confirmPassword')}
                            aria-invalid={touched.confirmPassword && !!errors.confirmPassword}
                            aria-describedby={touched.confirmPassword && errors.confirmPassword ? 'auth-confirm-password-error' : undefined}
                            className={`pl-10 bg-secondary/50 border-border focus:border-primary/50 rounded-lg h-11 ${
                              touched.confirmPassword && errors.confirmPassword
                                ? 'border-destructive focus:border-destructive'
                                : touched.confirmPassword && !errors.confirmPassword && confirmPassword
                                ? 'border-emerald-500/50'
                                : ''
                            }`}
                            disabled={loading}
                          />
                        </div>
                        {touched.confirmPassword && errors.confirmPassword && (
                          <motion.p
                            id="auth-confirm-password-error"
                            role="alert"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-destructive mt-1 flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            {errors.confirmPassword}
                          </motion.p>
                        )}
                        {touched.confirmPassword && !errors.confirmPassword && confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-emerald-500 mt-1 flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Passwords match
                          </motion.p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Password requirements - signup only */}
                  {mode === 'signup' && password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-1.5 p-3 rounded-lg bg-secondary/30 border border-border"
                    >
                      <p className="text-xs font-medium text-muted-foreground mb-2">Password requirements:</p>
                      {[
                        { check: password.length >= 8, label: 'At least 8 characters' },
                        { check: /[A-Z]/.test(password), label: 'One uppercase letter' },
                        { check: /[a-z]/.test(password), label: 'One lowercase letter' },
                        { check: /\d/.test(password), label: 'One number' },
                        { check: password === confirmPassword && confirmPassword.length > 0, label: 'Passwords match' },
                      ].map((req) => (
                        <div key={req.label} className="flex items-center gap-2">
                          <CheckCircle2
                            className={`h-3.5 w-3.5 transition-colors ${
                              req.check ? 'text-emerald-500' : 'text-muted-foreground/40'
                            }`}
                          />
                          <span
                            className={`text-xs transition-colors ${
                              req.check ? 'text-emerald-500' : 'text-muted-foreground/60'
                            }`}
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold h-11 rounded-lg hover:shadow-[0_0_25px_var(--glow-color)] transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      <>
                        {mode === 'login' ? (
                          <>
                            <LogIn className="w-4 h-4 mr-2" />
                            Sign In
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Create Account
                          </>
                        )}
                      </>
                    )}
                  </Button>
                </form>

                {/* Switch mode */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <button
                      type="button"
                      onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                      className="text-primary font-semibold hover:underline transition-all"
                    >
                      {mode === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>

                {/* Terms - signup only */}
                {mode === 'signup' && (
                  <p className="mt-4 text-center text-[11px] text-muted-foreground/60 leading-relaxed">
                    By creating an account, you agree to our{' '}
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenLegal) {
                          onOpenLegal('terms');
                        } else {
                          toast.info('Please see our Terms & Conditions in the footer.');
                        }
                      }}
                      className="text-primary hover:underline transition-all"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenLegal) {
                          onOpenLegal('privacy');
                        } else {
                          toast.info('Please see our Privacy Policy in the footer.');
                        }
                      }}
                      className="text-primary hover:underline transition-all"
                    >
                      Privacy Policy
                    </button>.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
