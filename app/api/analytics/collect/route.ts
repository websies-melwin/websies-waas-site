import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, number[]>();

// Event schema validation
const eventSchema = z.object({
  events: z.array(
    z.object({
      name: z.string().max(50),
      path: z.string().max(200),
      timestamp: z.number(),
      referrer: z.string().optional(),
      props: z.record(z.any()).optional(),
    })
  ).max(10), // Max 10 events per batch
  sessionId: z.string(),
  siteId: z.string(),
});

function hashUserAgent(ua: string): string {
  return crypto.createHash('sha256').update(ua).digest('hex').substring(0, 16);
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100;
  
  const requests = rateLimitStore.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get headers
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // Reject bot traffic
    const botPatterns = /bot|crawler|spider|scraper|facebookexternalhit|whatsapp/i;
    if (botPatterns.test(userAgent)) {
      return NextResponse.json({ success: true }); // Silent success for bots
    }
    
    // Parse and validate body
    const body = await request.json();
    const validated = eventSchema.parse(body);
    
    // Get country from IP (in production, use geo-ip library)
    const country = 'US'; // Placeholder
    
    // Hash user agent for privacy
    const uaHash = hashUserAgent(userAgent);
    
    // Initialize Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Process events
    const eventsToInsert = validated.events.map(event => ({
      site_id: validated.siteId,
      session_id: validated.sessionId,
      event_name: event.name,
      path: event.path,
      referrer: event.referrer || null,
      country,
      ua_hash: uaHash,
      props: event.props || {},
      created_at: new Date(event.timestamp).toISOString(),
    }));
    
    // Insert events
    const { error } = await supabase
      .from('analytics_events')
      .insert(eventsToInsert);
    
    if (error) {
      console.error('Analytics insert error:', error);
      return NextResponse.json(
        { error: 'Failed to record events' },
        { status: 500 }
      );
    }
    
    // Update session
    await supabase
      .from('analytics_sessions')
      .upsert({
        session_id: validated.sessionId,
        site_id: validated.siteId,
        country,
        last_seen: new Date().toISOString(),
      });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';