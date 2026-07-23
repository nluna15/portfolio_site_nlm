import type { PeriodPair } from './period';

/**
 * Metric shapes and presentation helpers, deliberately free of any database
 * import. The dashboard renders in the browser and the digest renders on the
 * server; both need these, and neither should drag the Postgres driver along.
 */

export interface Breakdown {
  key: string;
  count: number;
}

export interface Metrics {
  /* 1. Traffic */
  visits: number;
  uniqueVisitors: number;
  pageviews: number;
  /* 2. Engagement */
  avgTimeOnSiteMs: number;
  avgScrollDepth: number;
  /* 3. Where */
  topPaths: Breakdown[];
  /* 4. Category clicks */
  categoryClicks: Breakdown[];
  /* 5. Outbound / CTAs */
  outbound: Breakdown[];
  /* 6. Context */
  referrers: Breakdown[];
  devices: Breakdown[];
}

export interface Report {
  current: Metrics;
  previous: Metrics;
  periods: PeriodPair;
  generatedAt: string;
}

export interface Delta {
  label: string;
  direction: 'up' | 'down' | 'flat';
}

export function delta(current: number, previous: number): Delta {
  if (previous === 0) {
    if (current === 0) {
      return { label: '—', direction: 'flat' };
    }
    // A percentage against zero is meaningless; name the state instead.
    return { label: 'new', direction: 'up' };
  }

  const rounded = Math.round(((current - previous) / previous) * 100);
  if (rounded === 0) {
    return { label: '0%', direction: 'flat' };
  }
  return {
    label: `${rounded > 0 ? '+' : ''}${rounded}%`,
    direction: rounded > 0 ? 'up' : 'down',
  };
}

export function formatDuration(ms: number): string {
  if (ms <= 0) {
    return '0s';
  }
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export interface ComparisonRow {
  key: string;
  current: number;
  previous: number;
}

/**
 * Align two periods' breakdowns into shared rows. Keys present only last week
 * are kept with a current count of 0, so something that stopped happening
 * reads as a drop rather than silently disappearing from the table.
 */
export function compareBreakdowns(current: Breakdown[], previous: Breakdown[]): ComparisonRow[] {
  const previousByKey = new Map(previous.map((item) => [item.key, item.count]));
  const rows: ComparisonRow[] = current.map((item) => ({
    key: item.key,
    current: item.count,
    previous: previousByKey.get(item.key) ?? 0,
  }));

  const currentKeys = new Set(current.map((item) => item.key));
  for (const item of previous) {
    if (!currentKeys.has(item.key)) {
      rows.push({ key: item.key, current: 0, previous: item.count });
    }
  }

  return rows.sort((a, b) => b.current - a.current || b.previous - a.previous);
}
