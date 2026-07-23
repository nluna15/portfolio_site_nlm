import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureSchema, sql } from '../../../lib/analytics/db';
import {
  MAX_TEXT_LENGTH,
  isAnalyticsCategory,
  isAnalyticsEventType,
  type DeviceType,
} from '../../../lib/analytics/events';

/** Clamp and normalize any client-supplied string before it reaches Postgres. */
function text(value: unknown, maxLength = MAX_TEXT_LENGTH): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function boundedInt(value: unknown, min: number, max: number): number | null {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.round(Math.max(min, Math.min(max, parsed)));
}

function deviceTypeFrom(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(ua)) {
    return 'tablet';
  }
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

const BOT_PATTERN =
  /bot|crawler|spider|crawling|slurp|bingpreview|headlesschrome|lighthouse|pingdom|monitor|curl|wget|python-requests|axios|node-fetch/i;

function isLocalHostname(hostname: string): boolean {
  const host = hostname.replace(/:\d+$/, '').toLowerCase();
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '[::1]' ||
    host.endsWith('.local') ||
    host.endsWith('.localhost')
  );
}

/**
 * The plan tracks deployed traffic only. `ANALYTICS_ALLOW_LOCALHOST=1` exists
 * purely as a development escape hatch and should stay unset in Vercel.
 */
function isExcludedOrigin(req: NextApiRequest): boolean {
  if (process.env.ANALYTICS_ALLOW_LOCALHOST === '1') {
    return false;
  }

  const host = req.headers.host;
  if (host && isLocalHostname(host)) {
    return true;
  }

  const origin = req.headers.origin;
  if (origin) {
    try {
      if (isLocalHostname(new URL(origin).hostname)) {
        return true;
      }
    } catch {
      // Malformed Origin header — fall through to the remaining checks.
    }
  }

  return false;
}

/** Reduce a referrer URL to its host, dropping self-referrals and paths. */
function referrerSource(raw: string | null, selfHost: string | undefined): string | null {
  if (!raw) {
    return null;
  }
  try {
    const { hostname } = new URL(raw);
    if (selfHost && hostname === selfHost.replace(/:\d+$/, '')) {
      return null; // Internal navigation, not an acquisition source.
    }
    return hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userAgent = req.headers['user-agent'] ?? '';
  if (BOT_PATTERN.test(userAgent)) {
    res.status(204).end();
    return;
  }

  if (isExcludedOrigin(req)) {
    res.status(204).end();
    return;
  }

  // sendBeacon delivers a Blob, which Next may hand over unparsed.
  let body: Record<string, unknown>;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const type = body.type;
  if (!isAnalyticsEventType(type)) {
    res.status(400).json({ error: 'Unknown event type' });
    return;
  }

  const path = text(body.path, 256);
  const visitorId = text(body.visitorId, 64);
  const sessionId = text(body.sessionId, 64);
  if (!path || !visitorId || !sessionId) {
    res.status(400).json({ error: 'Missing path, visitorId, or sessionId' });
    return;
  }

  const category = isAnalyticsCategory(body.category) ? body.category : null;

  try {
    await ensureSchema();
    await sql()`
      INSERT INTO analytics_events (
        event_type, path, category, label, href,
        visitor_id, session_id, device_type, referrer, scroll_depth, duration_ms
      ) VALUES (
        ${type}, ${path}, ${category}, ${text(body.label, 200)}, ${text(body.href)},
        ${visitorId}, ${sessionId}, ${deviceTypeFrom(userAgent)},
        ${referrerSource(text(body.referrer), req.headers.host)},
        ${boundedInt(body.scrollDepth, 0, 100)},
        ${boundedInt(body.durationMs, 0, 6 * 60 * 60 * 1000)}
      )
    `;
    res.status(204).end();
  } catch (error) {
    // Log for the Vercel runtime logs, but never fail the caller's page.
    console.error('[analytics] ingest failed', error);
    res.status(204).end();
  }
}
