/**
 * Shared event vocabulary for first-party analytics.
 * Imported by both the browser tracker and the ingest route, so it must stay
 * free of any node- or dom-only dependencies.
 */

export type AnalyticsEventType = 'pageview' | 'category_click' | 'outbound' | 'engagement';

/** Category-click taxonomy: project modal opens, plus the masthead About link. */
export type AnalyticsCategory = 'ai' | 'corporate' | 'writing' | 'about';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface AnalyticsEventInput {
  type: AnalyticsEventType;
  /** Pathname only — never the query string, which can carry identifying params. */
  path: string;
  category?: AnalyticsCategory | null;
  /** Project id for category clicks, destination name for outbound clicks. */
  label?: string | null;
  href?: string | null;
  visitorId: string;
  sessionId: string;
  referrer?: string | null;
  /** Percentage 0-100, max reached during the pageview. */
  scrollDepth?: number | null;
  /** Milliseconds of visible time on the page. */
  durationMs?: number | null;
}

export const MAX_TEXT_LENGTH = 512;

export function isAnalyticsEventType(value: unknown): value is AnalyticsEventType {
  return (
    value === 'pageview' ||
    value === 'category_click' ||
    value === 'outbound' ||
    value === 'engagement'
  );
}

export function isAnalyticsCategory(value: unknown): value is AnalyticsCategory {
  return value === 'ai' || value === 'corporate' || value === 'writing' || value === 'about';
}
