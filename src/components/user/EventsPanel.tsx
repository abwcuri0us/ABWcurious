'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Loader2, Video, Users, Presentation, Coffee } from 'lucide-react';
import { toast } from 'sonner';

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  type: string;
  is_registration_open: boolean;
  max_registrations: number | null;
  created_at: string;
}

interface Registration {
  id: string;
  event_id: string;
  created_at: string;
}

interface EventsPanelProps {
  token: string;
  userId: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  webinar: { icon: Video, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Webinar' },
  conference: { icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Conference' },
  workshop: { icon: Presentation, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Workshop' },
  meetup: { icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Meetup' },
};

export default function EventsPanel({ token, userId }: EventsPanelProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'webinars' | 'workshops' | 'conferences' | 'meetups' | 'my'>('all');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/user/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEvents(data.data?.events || []);
          setRegistrations(data.data?.registrations || []);
        }
      } catch {
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [token]);

  const handleRegister = async (event: EventItem) => {
    setRegistering(event.id);
    try {
      const res = await fetch('/api/user/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ eventId: event.id }),
      });

      if (res.ok) {
        toast.success(`Registered for ${event.title}!`);
        // Refresh
        const data = await (await fetch('/api/user/events', { headers: { Authorization: `Bearer ${token}` } })).json();
        setRegistrations(data.data?.registrations || []);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to register');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setRegistering(null);
    }
  };

  const registeredEventIds = new Set(registrations.map((r) => r.event_id));

  // Filter events by tab
  const filteredEvents = events.filter((event) => {
    if (tab === 'all') return true;
    if (tab === 'my') return registeredEventIds.has(event.id);
    if (tab === 'webinars') return event.type === 'webinar';
    if (tab === 'workshops') return event.type === 'workshop';
    if (tab === 'conferences') return event.type === 'conference';
    if (tab === 'meetups') return event.type === 'meetup';
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-sora)' }}>
          Events & Webinars
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Register for events to expand your knowledge and network
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'webinars', label: 'Webinars' },
          { key: 'workshops', label: 'Workshops' },
          { key: 'conferences', label: 'Conferences' },
          { key: 'meetups', label: 'Meetups' },
          { key: 'my', label: 'My Events' },
        ].map(({ key, label }) => (
          <Button
            key={key}
            variant={tab === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab(key as typeof tab)}
          >
            {label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              {tab === 'my' ? 'No registered events' : 'No upcoming events'}
            </h3>
            <p className="text-sm text-muted-foreground">Check back later for new events!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
            const config = typeConfig[event.type] || typeConfig.webinar;
            const Icon = config.icon;
            const isRegistered = registeredEventIds.has(event.id);
            const isRegistering = registering === event.id;
            return (
              <Card key={event.id} className="border-border bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground">{event.title}</h3>
                        <Badge className={`text-xs ${config.bg} ${config.color}`}>{config.label}</Badge>
                      </div>
                      <div className="flex items-center flex-wrap gap-3 mb-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {event.location}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
                      )}
                      <Button
                        size="sm"
                        variant={isRegistered ? 'outline' : 'default'}
                        className={isRegistered ? 'text-emerald-600 border-emerald-500/30' : ''}
                        onClick={() => handleRegister(event)}
                        disabled={isRegistered || isRegistering || !event.is_registration_open}
                      >
                        {isRegistering ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : isRegistered ? (
                          '✓ Registered'
                        ) : !event.is_registration_open ? (
                          'Registration Closed'
                        ) : (
                          'Register'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
