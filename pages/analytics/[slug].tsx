import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState, type CSSProperties, type FormEvent } from 'react';
import { DASHBOARD_SLUG_ENV } from '../../lib/analytics/auth';
import {
  compareBreakdowns,
  delta,
  formatDuration,
  type Breakdown,
  type Report,
} from '../../lib/analytics/metrics';
import { formatEt } from '../../lib/analytics/period';

/**
 * Private analytics dashboard. Two independent gates: the URL slug must match
 * ANALYTICS_DASHBOARD_SLUG (otherwise the route 404s and never reveals that a
 * dashboard exists), and the data itself needs the password.
 */
export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const expectedSlug = process.env[DASHBOARD_SLUG_ENV];

  // Unset slug means no dashboard is exposed at all — a safe default.
  if (!expectedSlug || params?.slug !== expectedSlug) {
    return { notFound: true };
  }

  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return { props: {} };
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#faf8f4',
    color: '#1a1a1a',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    padding: '2.5rem 1.5rem 4rem',
  },
  shell: { maxWidth: 860, margin: '0 auto' },
  title: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '2rem',
    margin: '0 0 0.25rem',
  },
  subtitle: { color: '#6b6b6b', fontSize: '0.85rem', margin: '0 0 2rem' },
  sectionTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: '1.15rem',
    margin: '2.25rem 0 0.75rem',
    paddingBottom: '0.4rem',
    borderBottom: '2px solid #1a1a1a',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th: {
    textAlign: 'left',
    padding: '0.5rem 0.4rem',
    borderBottom: '1px solid #d8d3c8',
    fontSize: '0.7rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#6b6b6b',
    fontWeight: 500,
  },
  thNum: { textAlign: 'right' },
  td: { padding: '0.5rem 0.4rem', borderBottom: '1px solid #ece8e0' },
  tdNum: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
  label: { fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.85rem' },
  empty: { color: '#9a9a9a', fontStyle: 'italic', padding: '0.75rem 0.4rem' },
  form: { maxWidth: 320, margin: '4rem auto', textAlign: 'center' },
  input: {
    width: '100%',
    padding: '0.6rem 0.7rem',
    fontSize: '1rem',
    border: '1px solid #1a1a1a',
    background: '#fff',
    marginBottom: '0.75rem',
  },
  button: {
    width: '100%',
    padding: '0.6rem',
    fontSize: '0.95rem',
    background: '#1a1a1a',
    color: '#faf8f4',
    border: 'none',
    cursor: 'pointer',
  },
  error: { color: '#a3231b', fontSize: '0.85rem', marginTop: '0.75rem' },
};

const DELTA_COLOR: Record<string, string> = {
  up: '#1f6f43',
  down: '#a3231b',
  flat: '#6b6b6b',
};

function DeltaCell({ current, previous }: { current: number; previous: number }) {
  const change = delta(current, previous);
  return (
    <td style={{ ...styles.td, ...styles.tdNum, color: DELTA_COLOR[change.direction] }}>
      {change.label}
    </td>
  );
}

interface MetricRow {
  label: string;
  current: number;
  previous: number;
  /** Renders the raw number unless the metric needs units (time, percent). */
  format?: (value: number) => string;
}

function MetricTable({ caption, rows }: { caption: string; rows: MetricRow[] }) {
  return (
    <>
      <h2 style={styles.sectionTitle}>{caption}</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Metric</th>
            <th style={{ ...styles.th, ...styles.thNum }}>WTD</th>
            <th style={{ ...styles.th, ...styles.thNum }}>Last week</th>
            <th style={{ ...styles.th, ...styles.thNum }}>Δ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const format = row.format ?? ((value: number) => String(value));
            return (
              <tr key={row.label}>
                <td style={styles.td}>{row.label}</td>
                <td style={{ ...styles.td, ...styles.tdNum }}>{format(row.current)}</td>
                <td style={{ ...styles.td, ...styles.tdNum }}>{format(row.previous)}</td>
                <DeltaCell current={row.current} previous={row.previous} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function BreakdownTable({
  caption,
  heading,
  current,
  previous,
}: {
  caption: string;
  heading: string;
  current: Breakdown[];
  previous: Breakdown[];
}) {
  const rows = compareBreakdowns(current, previous);

  return (
    <>
      <h2 style={styles.sectionTitle}>{caption}</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>{heading}</th>
            <th style={{ ...styles.th, ...styles.thNum }}>WTD</th>
            <th style={{ ...styles.th, ...styles.thNum }}>Last week</th>
            <th style={{ ...styles.th, ...styles.thNum }}>Δ</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td style={styles.empty} colSpan={4}>
                No activity in either period.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.key}>
                <td style={{ ...styles.td, ...styles.label }}>{row.key}</td>
                <td style={{ ...styles.td, ...styles.tdNum }}>{row.current}</td>
                <td style={{ ...styles.td, ...styles.tdNum }}>{row.previous}</td>
                <DeltaCell current={row.current} previous={row.previous} />
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}

export default function AnalyticsDashboard() {
  const [password, setPassword] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? 'Something went wrong.');
        return;
      }
      setReport(payload as Report);
    } catch {
      setError('Could not reach the analytics API.');
    } finally {
      setLoading(false);
    }
  }

  const head = (
    <Head>
      <title>Analytics</title>
      <meta name="robots" content="noindex, nofollow" />
    </Head>
  );

  if (!report) {
    return (
      <div style={styles.page}>
        {head}
        <form style={styles.form} onSubmit={onSubmit}>
          <h1 style={styles.title}>Analytics</h1>
          <p style={styles.subtitle}>Enter the dashboard password.</p>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            aria-label="Dashboard password"
            autoFocus
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Loading…' : 'View'}
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    );
  }

  const { current, previous, periods } = report;

  return (
    <div style={styles.page}>
      {head}
      <div style={styles.shell}>
        <h1 style={styles.title}>Analytics</h1>
        <p style={styles.subtitle}>
          Week to date ({formatEt(new Date(periods.current.start))} → now) vs the same span last
          week ({formatEt(new Date(periods.previous.start))} →{' '}
          {formatEt(new Date(periods.previous.end))}). All times ET.
        </p>

        <MetricTable
          caption="1 · Traffic"
          rows={[
            { label: 'Visits', current: current.visits, previous: previous.visits },
            {
              label: 'Unique visitors',
              current: current.uniqueVisitors,
              previous: previous.uniqueVisitors,
            },
            { label: 'Pageviews', current: current.pageviews, previous: previous.pageviews },
          ]}
        />

        <MetricTable
          caption="2 · Engagement"
          rows={[
            {
              label: 'Avg time on site',
              current: current.avgTimeOnSiteMs,
              previous: previous.avgTimeOnSiteMs,
              format: formatDuration,
            },
            {
              label: 'Avg scroll depth',
              current: current.avgScrollDepth,
              previous: previous.avgScrollDepth,
              format: (value) => `${value}%`,
            },
          ]}
        />

        <BreakdownTable
          caption="3 · Where"
          heading="Path"
          current={current.topPaths}
          previous={previous.topPaths}
        />
        <BreakdownTable
          caption="4 · Category clicks"
          heading="Category"
          current={current.categoryClicks}
          previous={previous.categoryClicks}
        />
        <BreakdownTable
          caption="5 · Outbound / CTAs"
          heading="Destination"
          current={current.outbound}
          previous={previous.outbound}
        />
        <BreakdownTable
          caption="6 · Context — referrers"
          heading="Referrer"
          current={current.referrers}
          previous={previous.referrers}
        />
        <BreakdownTable
          caption="6 · Context — devices"
          heading="Device"
          current={current.devices}
          previous={previous.devices}
        />
      </div>
    </div>
  );
}
