'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, Bot, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ChatbotInstructionsPanel() {
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/chatbot-instructions');
      const data = await res.json();
      if (data.success) {
        const defaultContent = data.data?.default || data.data?.[Object.keys(data.data || {})[0]] || '';
        setInstructions(defaultContent);
      } else {
        setError(data.error || 'Failed to fetch instructions');
      }
    } catch {
      setError('Network error while fetching instructions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructions();
  }, [fetchInstructions]);

  const handleSave = async () => {
    if (!instructions.trim()) {
      toast.error('Instructions cannot be empty.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/chatbot-instructions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'default', content: instructions }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Chatbot instructions saved successfully.');
      } else {
        setError(data.error || 'Failed to save instructions');
        toast.error(data.error || 'Failed to save instructions.');
      }
    } catch {
      setError('Network error while saving instructions.');
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: 'var(--font-sora)' }}
        >
          Chatbot Instructions
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Edit the default instructions that guide the ABWcurious chatbot behavior.
        </p>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-primary" />
            Default Instructions
          </CardTitle>
          <CardDescription>
            These instructions are sent to the chatbot to define its personality, scope, and response style.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter chatbot instructions here..."
                rows={16}
                className="bg-secondary/50 border-border resize-y font-mono text-sm leading-relaxed"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {instructions.length} characters
                </p>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-glow bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Instructions
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
