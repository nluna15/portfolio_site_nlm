import { compareBreakdowns, delta, formatDuration, type Breakdown, type Report } from './metrics';
import { formatEt } from './period';

/**
 * Email HTML has to survive Gmail: tables for layout, inline styles only, no
 * external stylesheets, no flexbox.
 */

const INK = '#1a1a1a';
const MUTED = '#6b6b6b';
const RULE = '#e0dbd2';
const UP = '#1f6f43';
const DOWN = '#a3231b';

/** Paths, referrers, and labels all originate from the network — always escape. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function deltaCell(current: number, previous: number): string {
  const change = delta(current, previous);
  const color = change.direction === 'up' ? UP : change.direction === 'down' ? DOWN : MUTED;
  return `<td align="right" style="padding:6px 4px;border-bottom:1px solid #f0ede7;color:${color};font-variant-numeric:tabular-nums;">${escapeHtml(
    change.label
  )}</td>`;
}

function sectionHeading(title: string): string {
  return `<tr><td colspan="4" style="padding:22px 4px 6px;border-bottom:2px solid ${INK};font-family:Georgia,serif;font-size:16px;color:${INK};">${escapeHtml(
    title
  )}</td></tr>`;
}

function columnHeaders(firstColumn: string): string {
  const style = `padding:6px 4px;border-bottom:1px solid ${RULE};font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};font-weight:normal;`;
  return (
    `<tr>` +
    `<th align="left" style="${style}">${escapeHtml(firstColumn)}</th>` +
    `<th align="right" style="${style}">WTD</th>` +
    `<th align="right" style="${style}">Last week</th>` +
    `<th align="right" style="${style}">&#916;</th>` +
    `</tr>`
  );
}

function dataRow(label: string, current: string, previous: string, mono = false): string {
  const cell = 'padding:6px 4px;border-bottom:1px solid #f0ede7;';
  const font = mono ? 'font-family:Menlo,Consolas,monospace;font-size:13px;' : '';
  return (
    `<td style="${cell}${font}color:${INK};">${escapeHtml(label)}</td>` +
    `<td align="right" style="${cell}font-variant-numeric:tabular-nums;color:${INK};">${escapeHtml(current)}</td>` +
    `<td align="right" style="${cell}font-variant-numeric:tabular-nums;color:${MUTED};">${escapeHtml(previous)}</td>`
  );
}

function metricSection(
  title: string,
  rows: { label: string; current: number; previous: number; format?: (n: number) => string }[]
): string {
  const body = rows
    .map((row) => {
      const format = row.format ?? ((value: number) => String(value));
      return `<tr>${dataRow(row.label, format(row.current), format(row.previous))}${deltaCell(
        row.current,
        row.previous
      )}</tr>`;
    })
    .join('');
  return sectionHeading(title) + columnHeaders('Metric') + body;
}

function breakdownSection(
  title: string,
  firstColumn: string,
  current: Breakdown[],
  previous: Breakdown[]
): string {
  const rows = compareBreakdowns(current, previous);

  if (rows.length === 0) {
    return `${sectionHeading(title)}<tr><td colspan="4" style="padding:10px 4px;color:#9a9a9a;font-style:italic;font-size:13px;">No activity in either period.</td></tr>`;
  }

  const body = rows
    .map(
      (row) =>
        `<tr>${dataRow(row.key, String(row.current), String(row.previous), true)}${deltaCell(
          row.current,
          row.previous
        )}</tr>`
    )
    .join('');

  return sectionHeading(title) + columnHeaders(firstColumn) + body;
}

export function renderDigestSubject(report: Report): string {
  const { current, previous } = report;
  const change = delta(current.visits, previous.visits);
  const visits = `${current.visits} visit${current.visits === 1 ? '' : 's'}`;
  return `Portfolio WTD — ${visits} (${change.label}) · ${formatEt(new Date(report.generatedAt))}`;
}

export function renderDigestHtml(report: Report): string {
  const { current, previous, periods } = report;

  const sections =
    metricSection('1 · Traffic', [
      { label: 'Visits', current: current.visits, previous: previous.visits },
      {
        label: 'Unique visitors',
        current: current.uniqueVisitors,
        previous: previous.uniqueVisitors,
      },
      { label: 'Pageviews', current: current.pageviews, previous: previous.pageviews },
    ]) +
    metricSection('2 · Engagement', [
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
    ]) +
    breakdownSection('3 · Where', 'Path', current.topPaths, previous.topPaths) +
    breakdownSection(
      '4 · Category clicks',
      'Category',
      current.categoryClicks,
      previous.categoryClicks
    ) +
    breakdownSection('5 · Outbound / CTAs', 'Destination', current.outbound, previous.outbound) +
    breakdownSection('6 · Context — referrers', 'Referrer', current.referrers, previous.referrers) +
    breakdownSection('6 · Context — devices', 'Device', current.devices, previous.devices);

  const window = `${escapeHtml(formatEt(new Date(periods.current.start)))} &rarr; now, vs ${escapeHtml(
    formatEt(new Date(periods.previous.start))
  )} &rarr; ${escapeHtml(formatEt(new Date(periods.previous.end)))}`;

  return `<!doctype html>
<html>
<body style="margin:0;padding:24px 12px;background:#faf8f4;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;padding:28px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <tr>
      <td colspan="4" style="font-family:Georgia,serif;font-size:24px;color:${INK};padding-bottom:4px;">
        Portfolio analytics
      </td>
    </tr>
    <tr>
      <td colspan="4" style="font-size:12px;color:${MUTED};padding-bottom:8px;">
        Week to date, Monday start. ${window}. All times ET.
      </td>
    </tr>
    ${sections}
    <tr>
      <td colspan="4" style="padding-top:22px;font-size:11px;color:#9a9a9a;border-top:1px solid ${RULE};">
        First-party events from nehemiasluna.com. Localhost traffic excluded.
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Plain-text alternative, so the digest stays readable without HTML. */
export function renderDigestText(report: Report): string {
  const { current, previous } = report;

  /**
   * The delta is computed from the raw values, never re-parsed out of the
   * display strings — "1m 30s" carries no usable number.
   */
  const line = (
    label: string,
    currentValue: number,
    previousValue: number,
    format: (value: number) => string = String
  ) =>
    `${label.padEnd(20)} ${format(currentValue).padStart(10)} ${format(previousValue).padStart(
      12
    )}   ${delta(currentValue, previousValue).label}`;

  const breakdownLines = (a: Breakdown[], b: Breakdown[]) =>
    compareBreakdowns(a, b).map((row) => line(row.key, row.current, row.previous));

  return [
    'PORTFOLIO ANALYTICS — week to date vs last week (ET)',
    '',
    '1 · TRAFFIC',
    line('Visits', current.visits, previous.visits),
    line('Unique visitors', current.uniqueVisitors, previous.uniqueVisitors),
    line('Pageviews', current.pageviews, previous.pageviews),
    '',
    '2 · ENGAGEMENT',
    line('Avg time on site', current.avgTimeOnSiteMs, previous.avgTimeOnSiteMs, formatDuration),
    line(
      'Avg scroll depth',
      current.avgScrollDepth,
      previous.avgScrollDepth,
      (value) => `${value}%`
    ),
    '',
    '3 · WHERE',
    ...breakdownLines(current.topPaths, previous.topPaths),
    '',
    '4 · CATEGORY CLICKS',
    ...breakdownLines(current.categoryClicks, previous.categoryClicks),
    '',
    '5 · OUTBOUND / CTAS',
    ...breakdownLines(current.outbound, previous.outbound),
    '',
    '6 · CONTEXT',
    ...breakdownLines(current.referrers, previous.referrers),
    ...breakdownLines(current.devices, previous.devices),
  ].join('\n');
}
