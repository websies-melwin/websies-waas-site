'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface AnalyticsEvent {
  name: string;
  path: string;
  timestamp: number;
  referrer?: string;
  props?: Record<string, any>;
}

class AnalyticsClient {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private siteId: string;
  private flushTimer: NodeJS.Timeout | null = null;
  private consent: boolean = false;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.siteId = process.env.NEXT_PUBLIC_SITE_ID || 'websies';
    this.consent = this.checkConsent();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('analytics_session');
    if (!sessionId) {
      sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session', sessionId);
    }
    return sessionId;
  }

  private checkConsent(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('analytics_consent') === 'true';
  }

  setConsent(consent: boolean) {
    this.consent = consent;
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_consent', String(consent));
    }
  }

  track(name: string, props?: Record<string, any>) {
    if (!this.consent) return;

    const event: AnalyticsEvent = {
      name,
      path: window.location.pathname,
      timestamp: Date.now(),
      referrer: document.referrer,
      props,
    };

    this.events.push(event);
    this.scheduleFlush();
  }

  pageView() {
    this.track('page_view', {
      title: document.title,
    });
  }

  private scheduleFlush() {
    if (this.flushTimer) return;

    this.flushTimer = setTimeout(() => {
      this.flush();
    }, 5000); // Batch events for 5 seconds
  }

  async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];
    this.flushTimer = null;

    try {
      await fetch('/api/analytics/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend,
          sessionId: this.sessionId,
          siteId: this.siteId,
        }),
      });
    } catch (error) {
      console.error('Analytics flush failed:', error);
      // Re-add events for retry
      this.events = [...eventsToSend, ...this.events];
    }
  }
}

// Singleton instance
let analyticsClient: AnalyticsClient | null = null;

function getAnalyticsClient(): AnalyticsClient {
  if (!analyticsClient && typeof window !== 'undefined') {
    analyticsClient = new AnalyticsClient();
  }
  return analyticsClient!;
}

export function useAnalytics() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const client = getAnalyticsClient();
    
    // Track page view on route change
    if (previousPathname.current !== pathname) {
      client.pageView();
      previousPathname.current = pathname;
    }

    // Flush events on page unload
    const handleUnload = () => {
      client.flush();
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [pathname]);

  const track = useCallback((name: string, props?: Record<string, any>) => {
    const client = getAnalyticsClient();
    client.track(name, props);
  }, []);

  const setConsent = useCallback((consent: boolean) => {
    const client = getAnalyticsClient();
    client.setConsent(consent);
  }, []);

  return {
    track,
    setConsent,
  };
}