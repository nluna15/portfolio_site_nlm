import { renderDigestHtml, renderDigestSubject, renderDigestText } from './digestEmail';
import { compareBreakdowns, delta, formatDuration, type Metrics, type Report } from './metrics';

function metrics(overrides: Partial<Metrics> = {}): Metrics {
  return {
    visits: 0,
    uniqueVisitors: 0,
    pageviews: 0,
    avgTimeOnSiteMs: 0,
    avgScrollDepth: 0,
    topPaths: [],
    categoryClicks: [],
    outbound: [],
    referrers: [],
    devices: [],
    ...overrides,
  };
}

function report(current: Partial<Metrics>, previous: Partial<Metrics> = {}): Report {
  const now = new Date('2026-07-22T20:10:00Z');
  return {
    current: metrics(current),
    previous: metrics(previous),
    periods: {
      current: { start: new Date('2026-07-20T04:00:00Z'), end: now },
      previous: { start: new Date('2026-07-13T04:00:00Z'), end: new Date('2026-07-15T20:10:00Z') },
      timeZone: 'America/New_York',
    },
    generatedAt: now.toISOString(),
  };
}

describe('delta', () => {
  it('reports percentage change against the prior period', () => {
    expect(delta(120, 100)).toEqual({ label: '+20%', direction: 'up' });
    expect(delta(80, 100)).toEqual({ label: '-20%', direction: 'down' });
    expect(delta(100, 100)).toEqual({ label: '0%', direction: 'flat' });
  });

  it('avoids dividing by zero when the prior period was empty', () => {
    expect(delta(5, 0)).toEqual({ label: 'new', direction: 'up' });
    expect(delta(0, 0)).toEqual({ label: '—', direction: 'flat' });
  });
});

describe('formatDuration', () => {
  it('renders sub-minute and multi-minute spans', () => {
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(45_000)).toBe('45s');
    expect(formatDuration(90_000)).toBe('1m 30s');
  });
});

describe('compareBreakdowns', () => {
  it('keeps keys that appeared only last week, so drop-offs stay visible', () => {
    const rows = compareBreakdowns(
      [{ key: '/', count: 10 }],
      [
        { key: '/', count: 4 },
        { key: '/archive/ai', count: 7 },
      ]
    );

    expect(rows).toEqual([
      { key: '/', current: 10, previous: 4 },
      { key: '/archive/ai', current: 0, previous: 7 },
    ]);
  });
});

describe('renderDigestSubject', () => {
  it('leads with visits and the week-over-week change', () => {
    expect(renderDigestSubject(report({ visits: 12 }, { visits: 10 }))).toContain(
      '12 visits (+20%)'
    );
  });

  it('singularizes a single visit', () => {
    expect(renderDigestSubject(report({ visits: 1 }))).toContain('1 visit (new)');
  });
});

describe('renderDigestHtml', () => {
  const full = report(
    {
      visits: 12,
      uniqueVisitors: 9,
      pageviews: 20,
      avgTimeOnSiteMs: 90_000,
      avgScrollDepth: 62,
      topPaths: [{ key: '/', count: 14 }],
      categoryClicks: [{ key: 'ai', count: 5 }],
      outbound: [{ key: 'email', count: 2 }],
      referrers: [{ key: 'linkedin.com', count: 6 }],
      devices: [{ key: 'desktop', count: 8 }],
    },
    { visits: 10, uniqueVisitors: 8, pageviews: 15 }
  );

  it('renders all six sections in the planned hierarchy', () => {
    const html = renderDigestHtml(full);
    const order = [
      '1 · Traffic',
      '2 · Engagement',
      '3 · Where',
      '4 · Category clicks',
      '5 · Outbound / CTAs',
      '6 · Context — referrers',
    ].map((heading) => html.indexOf(heading));

    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('includes the metric values and their deltas', () => {
    const html = renderDigestHtml(full);
    expect(html).toContain('1m 30s');
    expect(html).toContain('62%');
    expect(html).toContain('+20%');
    expect(html).toContain('linkedin.com');
  });

  it('escapes breakdown keys, which arrive from the network', () => {
    const html = renderDigestHtml(
      report({ topPaths: [{ key: '/<script>alert(1)</script>', count: 1 }] })
    );
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('says so explicitly when a section has no data', () => {
    expect(renderDigestHtml(report({}))).toContain('No activity in either period.');
  });
});

describe('renderDigestText', () => {
  it('computes deltas from raw values rather than formatted strings', () => {
    const text = renderDigestText(
      report({ avgTimeOnSiteMs: 120_000 }, { avgTimeOnSiteMs: 60_000 })
    );
    expect(text).toContain('2m 0s');
    // 120s vs 60s is +100%; parsing "2m 0s" as a number would not yield this.
    expect(text).toMatch(/Avg time on site.*\+100%/);
  });
});
