'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, Globe, Phone, MapPin, Camera, Save, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  country: string | null;
  city: string | null;
  pincode: string | null;
  phone: string | null;
  date_of_birth: string | null;
  role: string;
  created_at: string;
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
  const [formPincode, setFormPincode] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formDateOfBirth, setFormDateOfBirth] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.data);
          setFormName(data.data.name || '');
          setFormCountry(data.data.country || '');
          setFormCity(data.data.city || '');
          setFormPincode(data.data.pincode || '');
          setFormPhone(data.data.phone || '');
          setFormAvatar(data.data.avatar || '');
          setFormDateOfBirth(data.data.date_of_birth ? data.data.date_of_birth.split('T')[0] : '');
        }
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
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
        headers: { Authorization: `Bearer ${token}` },
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName || undefined,
          country: formCountry || undefined,
          city: formCity || undefined,
          pincode: formPincode || undefined,
          phone: formPhone || undefined,
          avatar: formAvatar || undefined,
          date_of_birth: formDateOfBirth || undefined,
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
              <Badge variant="outline" className="mt-1 capitalize">{profile.role}</Badge>
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
              <div>
                <Label htmlFor="profile-pincode" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Pincode
                </Label>
                <Input
                  id="profile-pincode"
                  value={formPincode}
                  onChange={(e) => setFormPincode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10))}
                  className="mt-1.5"
                  placeholder="400703"
                  maxLength={10}
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
                <Label htmlFor="profile-dob" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Date of Birth
                </Label>
                <Input
                  id="profile-dob"
                  type="date"
                  value={formDateOfBirth}
                  onChange={(e) => setFormDateOfBirth(e.target.value)}
                  className="mt-1.5"
                />
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
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Pincode</p>
                  <p className="text-sm text-foreground">{profile.pincode || 'Not set'}</p>
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
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="text-sm text-foreground">{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2">
                <Badge variant="outline" className="capitalize">{profile.role}</Badge>
                <div>
                  <p className="text-xs text-muted-foreground">Member since</p>
                  <p className="text-sm text-foreground">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
