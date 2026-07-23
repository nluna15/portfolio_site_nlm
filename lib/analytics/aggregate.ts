import { ensureSchema, sql } from './db';
import type { Breakdown, Metrics, Report } from './metrics';
import { weekToDatePeriods, type Period } from './period';

/** Postgres returns COUNT/SUM as strings; normalize everything to numbers. */
function num(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toBreakdown(rows: Record<string, unknown>[], keyColumn: string): Breakdown[] {
  return rows.map((row) => ({
    key: String(row[keyColumn] ?? 'unknown'),
    count: num(row.count),
  }));
}

const TOP_N = 8;

export async function collectMetrics(period: Period): Promise<Metrics> {
  await ensureSchema();
  const db = sql();
  const { start, end } = period;

  const [totals, engagement, paths, categories, outbound, referrers, devices] = await Promise.all([
    db`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'pageview')                    AS pageviews,
        COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'pageview')  AS visits,
        COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'pageview')  AS unique_visitors
      FROM analytics_events
      WHERE created_at >= ${start} AND created_at < ${end}
    `,
    // Average per session, not per event, so a many-page visit is still one
    // data point and long sessions do not skew the mean by page count.
    db`
      WITH per_session AS (
        SELECT
          session_id,
          SUM(COALESCE(duration_ms, 0)) AS total_ms,
          MAX(COALESCE(scroll_depth, 0)) AS max_scroll
        FROM analytics_events
        WHERE event_type = 'engagement'
          AND created_at >= ${start} AND created_at < ${end}
        GROUP BY session_id
      )
      SELECT
        COALESCE(AVG(total_ms), 0)    AS avg_ms,
        COALESCE(AVG(max_scroll), 0)  AS avg_scroll
      FROM per_session
    `,
    db`
      SELECT path, COUNT(*) AS count
      FROM analytics_events
      WHERE event_type = 'pageview' AND created_at >= ${start} AND created_at < ${end}
      GROUP BY path
      ORDER BY count DESC, path ASC
      LIMIT ${TOP_N}
    `,
    db`
      SELECT category, COUNT(*) AS count
      FROM analytics_events
      WHERE event_type = 'category_click' AND category IS NOT NULL
        AND created_at >= ${start} AND created_at < ${end}
      GROUP BY category
      ORDER BY count DESC, category ASC
    `,
    db`
      SELECT COALESCE(label, 'unlabelled') AS label, COUNT(*) AS count
      FROM analytics_events
      WHERE event_type = 'outbound' AND created_at >= ${start} AND created_at < ${end}
      GROUP BY label
      ORDER BY count DESC, label ASC
      LIMIT ${TOP_N}
    `,
    db`
      SELECT referrer, COUNT(DISTINCT session_id) AS count
      FROM analytics_events
      WHERE event_type = 'pageview' AND referrer IS NOT NULL
        AND created_at >= ${start} AND created_at < ${end}
      GROUP BY referrer
      ORDER BY count DESC, referrer ASC
      LIMIT ${TOP_N}
    `,
    db`
      SELECT COALESCE(device_type, 'unknown') AS device_type,
             COUNT(DISTINCT session_id) AS count
      FROM analytics_events
      WHERE event_type = 'pageview' AND created_at >= ${start} AND created_at < ${end}
      GROUP BY device_type
      ORDER BY count DESC
    `,
  ]);

  const totalsRow = (totals[0] ?? {}) as Record<string, unknown>;
  const engagementRow = (engagement[0] ?? {}) as Record<string, unknown>;

  return {
    visits: num(totalsRow.visits),
    uniqueVisitors: num(totalsRow.unique_visitors),
    pageviews: num(totalsRow.pageviews),
    avgTimeOnSiteMs: Math.round(num(engagementRow.avg_ms)),
    avgScrollDepth: Math.round(num(engagementRow.avg_scroll)),
    topPaths: toBreakdown(paths as Record<string, unknown>[], 'path'),
    categoryClicks: toBreakdown(categories as Record<string, unknown>[], 'category'),
    outbound: toBreakdown(outbound as Record<string, unknown>[], 'label'),
    referrers: toBreakdown(referrers as Record<string, unknown>[], 'referrer'),
    devices: toBreakdown(devices as Record<string, unknown>[], 'device_type'),
  };
}

export async function buildReport(now: Date = new Date()): Promise<Report> {
  const periods = weekToDatePeriods(now);
  const [current, previous] = await Promise.all([
    collectMetrics(periods.current),
    collectMetrics(periods.previous),
  ]);
  return { current, previous, periods, generatedAt: now.toISOString() };
}
