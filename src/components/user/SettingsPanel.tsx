'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Moon, Sun, Shield, Save, Loader2, AlertTriangle, Trash2, KeyRound, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/auth-fetch';
import { useTheme } from 'next-themes';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import OtpInput from '@/components/OtpInputField';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SettingsPanelProps {
  token: string;
  userId: string;
}

const NOTIF_STORAGE_KEY = 'abwcurious_notification_prefs';

function loadNotificationPrefs() {
  if (typeof window === 'undefined') {
    return { emailEvents: true, emailNewsletter: false, emailSystem: true };
  }
  try {
    const stored = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { emailEvents: true, emailNewsletter: false, emailSystem: true };
}

function saveNotificationPrefs(prefs: Record<string, boolean>) {
  try {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

export default function SettingsPanel({ token, userId }: SettingsPanelProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Email change
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailStep, setEmailStep] = useState<'idle' | 'sending' | 'verify' | 'done'>('idle');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailError, setEmailError] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);

  const [notifications, setNotifications] = useState(loadNotificationPrefs);

  // Fetch current email on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile', {
          headers: getAuthHeaders(token),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.data?.email) setCurrentEmail(data.data.email);
        }
      } catch { /* ignore */ }
    }
    fetchProfile();
  }, [token]);

  // Save notification prefs to localStorage when they change
  useEffect(() => {
    saveNotificationPrefs(notifications);
  }, [notifications]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      toast.error('Password must contain uppercase, lowercase, and a number');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: getAuthHeaders(token, 'application/json'),
        body: JSON.stringify({
          action: 'change-password',
          newPassword,
        }),
      });

      if (res.ok) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to change password');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      toast.error('New email must be different from your current email');
      return;
    }

    setChangingEmail(true);
    setEmailError('');
    try {
      const res = await fetch('/api/user/change-email', {
        method: 'POST',
        headers: getAuthHeaders(token, 'application/json'),
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();

      if (data.success) {
        setEmailStep('verify');
        toast.success('A verification code has been sent to your new email.');
      } else {
        setEmailError(data.error || 'Failed to send verification code');
      }
    } catch {
      setEmailError('Network error. Please try again.');
    } finally {
      setChangingEmail(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      setEmailError('Please enter the complete 6-digit code.');
      return;
    }

    setChangingEmail(true);
    setEmailError('');
    try {
      const res = await fetch('/api/user/change-email', {
        method: 'PUT',
        headers: getAuthHeaders(token, 'application/json'),
        body: JSON.stringify({ newEmail, otp: emailOtp }),
      });
      const data = await res.json();

      if (data.success) {
        setEmailStep('done');
        setCurrentEmail(newEmail);
        toast.success('Email updated successfully!');
      } else {
        setEmailError(data.error || 'Failed to verify code.');
      }
    } catch {
      setEmailError('Network error. Please try again.');
    } finally {
      setChangingEmail(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setDeletingAccount(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: getAuthHeaders(token, 'application/json'),
        body: JSON.stringify({
          action: 'delete-account',
          confirmDelete: deleteConfirm,
        }),
      });

      if (res.ok) {
        // Clear localStorage before reload
        localStorage.removeItem('abwcurious_token');
        localStorage.removeItem('abwcurious_user');
        toast.success('Account deleted. Redirecting...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete account');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDeletingAccount(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      saveNotificationPrefs(notifications);
      toast.success('Settings saved successfully!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
          Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your preferences and account settings
        </p>
      </div>

      {/* Theme Preference */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <div className="p-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            {resolvedTheme === 'dark' ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
            Appearance
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Theme</Label>
              <p className="text-xs text-muted-foreground">Choose your preferred color theme</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={resolvedTheme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4 mr-1.5" />
                Light
              </Button>
              <Button
                variant={resolvedTheme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4 mr-1.5" />
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <div className="p-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Notification Preferences
          </h3>
        </div>
        <CardContent className="p-6 space-y-4">
          {[
            { key: 'emailEvents' as const, label: 'Event Reminders', desc: 'Get reminders for upcoming events' },
            { key: 'emailNewsletter' as const, label: 'Newsletter', desc: 'Receive our periodic newsletter' },
            { key: 'emailSystem' as const, label: 'System Announcements', desc: 'Important updates and announcements' },
          ].map((item, i) => (
            <React.Fragment key={item.key}>
              {i > 0 && <div className="h-px bg-border" />}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key]}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, [item.key]: checked })
                  }
                />
              </div>
            </React.Fragment>
          ))}
        </CardContent>
      </Card>

      {/* Change Email */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <div className="p-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Change Email
          </h3>
        </div>
        <CardContent className="p-6 space-y-4">
          {emailStep === 'done' ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-500">Email updated successfully!</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your email is now {currentEmail}</p>
              </div>
            </div>
          ) : emailStep === 'verify' ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  A 6-digit code was sent to <span className="font-semibold text-foreground">{newEmail}</span>
                </p>
              </div>
              <div className="flex justify-center">
                <OtpInput value={emailOtp} onChange={setEmailOtp} disabled={changingEmail} />
              </div>
              {emailError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  {emailError}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setEmailStep('idle'); setEmailOtp(''); setEmailError(''); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleVerifyEmailOtp}
                  disabled={changingEmail || emailOtp.length !== 6}
                  className="flex-1"
                >
                  {changingEmail ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1.5" />}
                  Verify
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Current Email</Label>
                <p className="text-sm font-medium text-foreground mt-0.5">{currentEmail || 'Loading...'}</p>
              </div>
              <div>
                <Label htmlFor="new-email">New Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1.5"
                  placeholder="Enter new email address"
                />
              </div>
              {emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
              )}
              <Button onClick={handleSendEmailOtp} disabled={changingEmail} variant="outline">
                {changingEmail ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-1.5" />}
                Send Verification Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <div className="p-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Change Password
          </h3>
        </div>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1.5"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1.5"
              placeholder="Min 8 chars, upper, lower, number"
            />
            <PasswordStrengthMeter password={newPassword} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="confirm-new-password">Confirm New Password</Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="mt-1.5"
              placeholder="Confirm new password"
            />
          </div>
          <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline">
            {changingPassword ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <KeyRound className="h-4 w-4 mr-1.5" />}
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30 bg-card/50 backdrop-blur-sm">
        <div className="p-4 border-b border-destructive/20">
          <h3 className="text-base font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-destructive">Delete Account</Label>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data. This cannot be undone.</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
          Save Settings
        </Button>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account Permanently
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your data, posts, and settings will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="delete-confirm" className="text-sm font-medium">
              Type <span className="font-bold text-destructive">DELETE</span> to confirm:
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="mt-1.5"
              placeholder="DELETE"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'DELETE' || deletingAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingAccount ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1.5" />}
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
