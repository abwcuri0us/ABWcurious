"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  /** Login with email + password (for all users including admin) */
  loginWithEmailPassword: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; needsVerification?: boolean; email?: string }>;
  /** Send an 8-digit OTP to the given email address (for email verification) */
  sendOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  /** Verify an OTP code and authenticate the user */
  verifyOtp: (email: string, otp: string, type?: "signup" | "login" | "email") => Promise<{ success: boolean; error?: string }>;
  /** Create a new account (sends OTP automatically) */
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string; otpSent?: boolean }>;
  /** Initiate OAuth login with Google or GitHub */
  loginWithOAuth: (provider: "google" | "github") => Promise<{ success: boolean; error?: string }>;
  /** Send a password reset OTP to the user's email */
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  /** Reset password with OTP and new password */
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  country?: string;
  city?: string;
  captchaToken?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initAttemptRef = useRef(0);

  /**
   * Fetch session from the server (validates httpOnly cookie).
   * Returns the user data if a valid session exists, null otherwise.
   */
  const fetchSessionFromServer = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await fetch("/api/auth/session", {
        credentials: 'include', // Ensure cookies are sent
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        const userData = data.data.user;
        return {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
          role: userData.role || "user",
        };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Load session on mount via server-side cookie validation
  useEffect(() => {
    const loadSession = async () => {
      const authUser = await fetchSessionFromServer();
      if (authUser) {
        setUser(authUser);
        setToken('cookie'); // Token is in httpOnly cookie, not accessible to JS
      }
      setIsLoading(false);
    };

    loadSession();

    // Check for OAuth error in URL query params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const authError = params.get("auth_error");
      if (authError) {
        const sanitized = decodeURIComponent(authError).replace(/[<>&"']/g, '');
        toast.error(sanitized);
        // Clean up the URL
        const url = new URL(window.location.href);
        url.searchParams.delete("auth_error");
        window.history.replaceState({}, "", url.pathname + url.hash);
      }
    }
  }, [fetchSessionFromServer]);

  const refreshUser = useCallback(async () => {
    const authUser = await fetchSessionFromServer();
    if (authUser) {
      setUser(authUser);
    }
  }, [fetchSessionFromServer]);

  /** Login with email + password (for all users, admin auto-detected) */
  const loginWithEmailPassword = useCallback(async (email: string, password: string, _rememberMe = false) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe: _rememberMe }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!data.success) {
        return {
          success: false,
          error: data.error || "Login failed.",
          needsVerification: data.needsVerification || false,
          email: data.email || email,
        };
      }

      // Server sets httpOnly session cookie; user data is in response body
      const authUser: AuthUser = {
        id: data.data.user.id,
        email: data.data.user.email,
        name: data.data.user.name,
        avatar: data.data.user.avatar,
        role: data.data.user.role || "user",
      };

      setUser(authUser);
      setToken('cookie');

      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  /** Send an 8-digit OTP to the user's email (for email verification) */
  const sendOtp = useCallback(async (email: string) => {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error || "Failed to send OTP." };
      }

      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  /** Verify OTP and authenticate the user */
  const verifyOtp = useCallback(async (email: string, otp: string, type: "signup" | "login" | "email" = "email") => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, type }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error || "Verification failed." };
      }

      // Server sets httpOnly session cookie; user data is in response body
      const authUser: AuthUser = {
        id: data.data.user.id,
        email: data.data.user.email,
        name: data.data.user.name,
        avatar: data.data.user.avatar,
        role: data.data.user.role || "user",
      };

      setUser(authUser);
      setToken('cookie');

      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  /** Create a new account. The backend sends an OTP automatically. */
  const signup = useCallback(async (signupData: SignupData) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error || "Signup failed." };
      }

      // Don't persist session yet — user must verify OTP first
      return {
        success: true,
        otpSent: data.data?.otpSent ?? true,
      };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  /** Initiate OAuth flow — redirects browser to the provider */
  const loginWithOAuth = useCallback(async (provider: "google" | "github") => {
    try {
      const res = await fetch("/api/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error || "Failed to initiate OAuth." };
      }

      // Redirect the browser to the OAuth provider
      if (data.url) {
        window.location.href = data.url;
        return { success: true };
      }

      return { success: false, error: "No OAuth URL returned." };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  /** Send a password reset OTP */
  const forgotPassword = useCallback(async (email: string) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || "Failed to send reset code." };
      }
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  /** Reset password with OTP */
  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string) => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || "Failed to reset password." };
      }
      return { success: true };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call the logout endpoint to revoke session server-side
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include',
      });
    } catch {
      // Continue with local cleanup even if API call fails
    }

    // Clean up legacy localStorage if present
    if (typeof window !== "undefined") {
      localStorage.removeItem("abwcurious_token");
      localStorage.removeItem("abwcurious_user");
    }

    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(() => ({
    user, token, isLoading, loginWithEmailPassword, sendOtp,
    verifyOtp, signup, loginWithOAuth, forgotPassword, resetPassword,
    logout, refreshUser,
  }), [user, token, isLoading, loginWithEmailPassword, sendOtp,
    verifyOtp, signup, loginWithOAuth, forgotPassword, resetPassword,
    logout, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}