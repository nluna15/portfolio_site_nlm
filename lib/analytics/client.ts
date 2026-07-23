import type { AnalyticsCategory, AnalyticsEventInput } from './events';

/**
 * Browser-side tracker. Deliberately dependency-free and failure-tolerant:
 * analytics must never be able to break the page, so every entry point is
 * wrapped and errors are swallowed.
 */

const ENDPOINT = '/api/analytics/collect';
const VISITOR_KEY = 'nl.analytics.visitor';
const SESSION_KEY = 'nl.analytics.session';

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Stable per-browser id (localStorage) — this is what "unique visitor" counts.
 * Anonymous and random; it is never derived from IP, user agent, or anything
 * else that could identify a person.
 */
function visitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) {
      return existing;
    }
    const fresh = randomId();
    window.localStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    // Private mode or storage disabled — fall back to a per-pageview id.
    return randomId();
  }
}

/** Per-tab-session id (sessionStorage) — this is what "visits" counts. */
function sessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      return existing;
    }
    const fresh = randomId();
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return randomId();
  }
}

/**
 * The plan tracks deployed traffic only. The server enforces this too, but
 * short-circuiting here keeps dev consoles quiet and saves the round trip.
 */
function isLocalhost(): boolean {
  // Dev-only escape hatch for exercising the pipeline end to end on a laptop.
  // Mirrors ANALYTICS_ALLOW_LOCALHOST on the ingest route; leave both unset in
  // Vercel so deployed traffic stays the only thing recorded.
  if (process.env.NEXT_PUBLIC_ANALYTICS_ALLOW_LOCALHOST === '1') {
    return false;
  }

  const { hostname } = window.location;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1' ||
    hostname.endsWith('.local')
  );
}

function send(payload: AnalyticsEventInput, opts: { beacon?: boolean } = {}): void {
  try {
    const body = JSON.stringify(payload);

    // Clicks and page exits race navigation; sendBeacon survives the unload.
    if (opts.beacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      return;
    }

    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Never let instrumentation surface to the user.
  }
}

type EventFields = Omit<AnalyticsEventInput, 'visitorId' | 'sessionId' | 'path'> & {
  path?: string;
};

function emit(fields: EventFields, opts?: { beacon?: boolean }): void {
  if (typeof window === 'undefined' || isLocalhost()) {
    return;
  }
  send(
    {
      ...fields,
      path: fields.path ?? window.location.pathname,
      visitorId: visitorId(),
      sessionId: sessionId(),
    },
    opts
  );
}

/* ------------------------------------------------------------------ *
 * Engagement: scroll depth + visible time, accumulated per pageview
 * and flushed once when the page is left or the route changes.
 * ------------------------------------------------------------------ */

interface EngagementState {
  path: string;
  maxScroll: number;
  visibleMs: number;
  lastResumedAt: number | null;
}

let engagement: EngagementState | null = null;

function scrollPercent(): number {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  if (scrollable <= 0) {
    return 100; // Page fits the viewport: it was seen in full.
  }
  const ratio = (window.scrollY / scrollable) * 100;
  return Math.max(0, Math.min(100, Math.round(ratio)));
}

function accrueVisibleTime(): void {
  if (engagement?.lastResumedAt != null) {
    engagement.visibleMs += Date.now() - engagement.lastResumedAt;
    engagement.lastResumedAt = null;
  }
}

function onScroll(): void {
  if (engagement) {
    engagement.maxScroll = Math.max(engagement.maxScroll, scrollPercent());
  }
}

function onVisibilityChange(): void {
  if (!engagement) {
    return;
  }
  if (document.visibilityState === 'hidden') {
    accrueVisibleTime();
    flushEngagement();
  } else {
    engagement.lastResumedAt = Date.now();
  }
}

/**
 * Emit the accumulated engagement for the current pageview. Safe to call more
 * than once — the counters reset, so a tab hidden and re-shown reports the two
 * stretches separately rather than double counting.
 */
function flushEngagement(opts: { beacon?: boolean } = { beacon: true }): void {
  if (!engagement) {
    return;
  }
  accrueVisibleTime();

  const { path, maxScroll, visibleMs } = engagement;
  // Sub-second glances carry no signal and would drag the average down.
  if (visibleMs >= 1000 || maxScroll > 0) {
    emit(
      {
        type: 'engagement',
        path,
        scrollDepth: maxScroll,
        durationMs: Math.round(visibleMs),
      },
      opts
    );
  }

  engagement.maxScroll = 0;
  engagement.visibleMs = 0;
  engagement.lastResumedAt = document.visibilityState === 'visible' ? Date.now() : null;
}

function startEngagement(path: string): void {
  engagement = {
    path,
    maxScroll: scrollPercent(),
    visibleMs: 0,
    lastResumedAt: document.visibilityState === 'visible' ? Date.now() : null,
  };
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

/** Record a pageview and (re)start engagement accounting for it. */
export function trackPageview(path: string, referrer?: string): void {
  if (typeof window === 'undefined' || isLocalhost()) {
    return;
  }
  // Close out the previous page before switching, so soft navigations still
  // report the time and scroll they earned.
  flushEngagement({ beacon: false });

  emit({
    type: 'pageview',
    path,
    referrer: referrer ?? document.referrer ?? null,
  });

  startEngagement(path);
}

/** Project modal opened, or the masthead About link followed. */
export function trackCategoryClick(category: AnalyticsCategory, label?: string): void {
  emit({ type: 'category_click', category, label: label ?? null });
}

/** Outbound link or CTA — mailto, socials, project links, NowBar/Goodreads. */
export function trackOutbound(label: string, href: string): void {
  emit({ type: 'outbound', label, href }, { beacon: true });
}

let listenersBound = false;

/** Attach the scroll/visibility listeners. Idempotent. */
export function initAnalytics(): () => void {
  if (typeof window === 'undefined' || isLocalhost() || listenersBound) {
    return () => undefined;
  }
  listenersBound = true;

  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
  // pagehide is the reliable terminal event on mobile Safari; unload is not.
  window.addEventListener('pagehide', () => flushEngagement());

  return () => {
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    listenersBound = false;
  };
}
