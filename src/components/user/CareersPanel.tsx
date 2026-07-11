'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Briefcase,
  MapPin,
  Building,
  Loader2,
  ExternalLink,
  X,
  Upload,
  FileText,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/auth-fetch';

interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string | null;
  is_active: boolean;
}

interface Application {
  id: string;
  career_id: string;
  cover_letter: string | null;
  resume_url: string | null;
  status: string;
  created_at: string;
}

interface CareersPanelProps {
  token: string;
  userId: string;
}

const typeColors: Record<string, string> = {
  'full-time': 'bg-emerald-500/10 text-emerald-600',
  'part-time': 'bg-blue-500/10 text-blue-600',
  'internship': 'bg-purple-500/10 text-purple-600',
  'contract': 'bg-amber-500/10 text-amber-600',
};

const appStatusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600',
  reviewing: 'bg-blue-500/10 text-blue-600',
  shortlisted: 'bg-purple-500/10 text-purple-600',
  accepted: 'bg-emerald-500/10 text-emerald-600',
  rejected: 'bg-red-500/10 text-red-600',
};

export default function CareersPanel({ token, userId }: CareersPanelProps) {
  const [careers, setCareers] = useState<Career[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState('');
  const [tab, setTab] = useState<'positions' | 'applications'>('positions');

  useEffect(() => {
    async function fetchCareers() {
      try {
        const res = await fetch('/api/user/careers', {
          headers: getAuthHeaders(token),
        });
        if (res.ok) {
          const data = await res.json();
          setCareers(data.data?.careers || []);
          setApplications(data.data?.applications || []);
        }
      } catch {
        toast.error('Failed to load careers');
      } finally {
        setLoading(false);
      }
    }
    fetchCareers();
  }, [token]);

  const handleApply = async () => {
    if (!selectedCareer) return;
    setApplying(true);

    try {
      let resumeUrl = '';
      if (resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        formData.append('type', 'resume');
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          resumeUrl = uploadData.url || '';
        }
      }

      const res = await fetch('/api/user/careers', {
        method: 'POST',
        headers: getAuthHeaders(token, 'application/json'),
        body: JSON.stringify({
          careerId: selectedCareer.id,
          coverLetter: coverLetter || undefined,
          resumeUrl: resumeUrl || undefined,
          videoLink: videoLink || undefined,
        }),
      });

      if (res.ok) {
        toast.success('Application submitted!');
        setApplyDialogOpen(false);
        setCoverLetter('');
        setResumeFile(null);
        setVideoLink('');
        // Refresh
        const data = await (await fetch('/api/user/careers', { headers: getAuthHeaders(token) })).json();
        setApplications(data.data?.applications || []);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to apply');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setApplying(false);
    }
  };

  const appliedCareerIds = new Set(applications.map((a) => a.career_id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
          Careers
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Join our team and help build the future of cybersecurity
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={tab === 'positions' ? 'default' : 'outline'} size="sm" onClick={() => setTab('positions')}>
          Open Positions
        </Button>
        <Button variant={tab === 'applications' ? 'default' : 'outline'} size="sm" onClick={() => setTab('applications')}>
          My Applications ({applications.length})
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : tab === 'positions' ? (
        careers.length === 0 ? (
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-1">No open positions</h3>
              <p className="text-sm text-muted-foreground">Check back later for new opportunities!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {careers.map((career) => {
              const alreadyApplied = appliedCareerIds.has(career.id);
              return (
                <Card key={career.id} className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground mb-1">{career.title}</h3>
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building className="h-3 w-3" /> {career.department}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {career.location}
                          </span>
                          <Badge className={`text-xs ${typeColors[career.type] || 'bg-gray-500/10 text-gray-600'}`}>
                            {career.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{career.description}</p>
                      </div>
                      <Button
                        variant={alreadyApplied ? 'outline' : 'default'}
                        size="sm"
                        className="shrink-0"
                        disabled={alreadyApplied}
                        onClick={() => {
                          setSelectedCareer(career);
                          setApplyDialogOpen(true);
                        }}
                      >
                        {alreadyApplied ? 'Applied' : 'Apply'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        applications.length === 0 ? (
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-1">No applications yet</h3>
              <p className="text-sm text-muted-foreground">Apply for open positions to see them here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const career = careers.find((c) => c.id === app.career_id);
              return (
                <Card key={app.id} className="border-border bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground">{career?.title || 'Unknown Position'}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${appStatusColors[app.status] || 'bg-gray-500/10 text-gray-600'}`}>
                            {app.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Applied {new Date(app.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Apply Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for {selectedCareer?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="cover-letter">Cover Letter</Label>
              <Textarea
                id="cover-letter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're a great fit..."
                className="mt-1.5"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="resume-upload">Resume (PDF/DOC/DOCX, max 2MB)</Label>
              <div className="mt-1.5">
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error('File size must be under 2MB');
                        return;
                      }
                      setResumeFile(file);
                    }
                  }}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {resumeFile && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{resumeFile.name}</span>
                    <button onClick={() => setResumeFile(null)} className="text-destructive hover:text-destructive/80">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="video-link">Video Introduction Link <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                id="video-link"
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className="mt-1.5"
                placeholder="https://youtube.com/watch?v=... or any video URL"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-1.5" />}
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
