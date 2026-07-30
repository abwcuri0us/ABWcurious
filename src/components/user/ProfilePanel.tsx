'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Mail, Globe, Phone, MapPin, Camera, Save, CalendarDays, Info } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/auth-fetch';

interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  phone: string | null;
  role: string;
  provider: string | null;
  created_at: string;
  updated_at: string | null;
}

interface ProfilePanelProps {
  token: string;
  onProfileUpdate?: () => void;
}

export default function ProfilePanel({ token, onProfileUpdate }: ProfilePanelProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [formName, setFormName] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch('/api/user/profile', {
          headers: getAuthHeaders(token),
        });
        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setProfile(data.data);
          setFormName(data.data.name || '');
          setFormCountry(data.data.country || '');
          setFormCity(data.data.city || '');
          setFormBio(data.data.bio || '');
          setFormPhone(data.data.phone || '');
          setFormAvatar(data.data.avatar || '');
        } else {
          const data = await res.json().catch(() => ({}));
          toast.error(data.error || 'Failed to load profile');
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load profile');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchProfile();

    return () => { cancelled = true; };
  }, [token]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile-photo');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setFormAvatar(data.url || '');
        toast.success('Avatar uploaded!');
      } else {
        toast.error('Failed to upload avatar');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: getAuthHeaders(token, 'application/json'),
        body: JSON.stringify({
          name: formName || undefined,
          country: formCountry || undefined,
          city: formCity || undefined,
          bio: formBio || undefined,
          phone: formPhone || undefined,
          avatar: formAvatar || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.data);
        setEditing(false);
        toast.success('Profile updated successfully!');
        onProfileUpdate?.();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update profile');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Could not load profile data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
          My Profile
        </h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)} size="sm">
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)} size="sm">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Avatar Section */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold overflow-hidden border-2 border-primary/20">
                {(editing ? formAvatar : profile.avatar) ? (
                  <img src={editing ? formAvatar : profile.avatar!} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  (profile.name || profile.email)[0].toUpperCase()
                )}
              </div>
              {editing && (
                <label className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                  {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                </label>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {profile.name || 'No name set'}
              </h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">{profile.role}</Badge>
                {profile.provider && (
                  <Badge variant="secondary" className="text-xs">
                    via {profile.provider}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {editing && formAvatar && (
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
              <Label htmlFor="avatar-url" className="text-xs">Avatar URL</Label>
              <Input
                id="avatar-url"
                value={formAvatar}
                onChange={(e) => setFormAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="h-8 text-xs"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <div className="p-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Personal Information</h3>
        </div>
        <CardContent className="p-6">
          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profile-name" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Full Name
                </Label>
                <Input
                  id="profile-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-1.5"
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="profile-email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <Input
                  id="profile-email"
                  value={profile.email}
                  disabled
                  className="mt-1.5 bg-muted/50"
                />
              </div>
              <div>
                <Label htmlFor="profile-phone" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone
                </Label>
                <Input
                  id="profile-phone"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="mt-1.5"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="profile-country" className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Country
                </Label>
                <Input
                  id="profile-country"
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value)}
                  className="mt-1.5"
                  placeholder="India"
                />
              </div>
              <div>
                <Label htmlFor="profile-city" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> City
                </Label>
                <Input
                  id="profile-city"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="mt-1.5"
                  placeholder="Navi Mumbai"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="profile-bio" className="flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" /> Bio
                </Label>
                <Textarea
                  id="profile-bio"
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="mt-1.5"
                  placeholder="Tell us about yourself..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">{formBio.length}/500</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 py-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Full Name</p>
                  <p className="text-sm text-foreground">{profile.name || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm text-foreground">{profile.phone || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Country</p>
                  <p className="text-sm text-foreground">{profile.country || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">City</p>
                  <p className="text-sm text-foreground">{profile.city || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Bio</p>
                  <p className="text-sm text-foreground">{profile.bio || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Member since</p>
                  <p className="text-sm text-foreground">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {profile.provider && (
                <div className="flex items-center gap-3 py-2">
                  <Badge variant="secondary" className="text-xs">via {profile.provider}</Badge>
                  <div>
                    <p className="text-xs text-muted-foreground">Auth Provider</p>
                    <p className="text-sm text-foreground capitalize">{profile.provider}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
