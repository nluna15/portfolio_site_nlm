/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://nehemiasluna.com/"}
 */

/**
 * The tracker runs against a deployed origin here, so events are expected to
 * fire. Localhost exclusion is covered separately in client.localhost.test.ts,
 * because the origin is fixed per test file.
 */

interface Captured {
  via: 'fetch' | 'beacon';
  body: Record<string, unknown>;
}

const captured: Captured[] = [];

function loadTracker() {
  return require('./client') as typeof import('./client');
}

beforeEach(() => {
  jest.resetModules();
  captured.length = 0;
  window.localStorage.clear();
  window.sessionStorage.clear();

  global.fetch = jest.fn((_url: unknown, opts: { body?: string } = {}) => {
    captured.push({ via: 'fetch', body: JSON.parse(opts.body ?? '{}') });
    return Promise.resolve({ ok: true, status: 204 } as Response);
  }) as unknown as typeof fetch;

  Object.defineProperty(navigator, 'sendBeacon', {
    configurable: true,
    writable: true,
    value: jest.fn((_url: string, blob: Blob) => {
      // The payload is what matters; read it off the Blob synchronously.
      captured.push({
        via: 'beacon',
        body: JSON.parse((blob as unknown as { _text: string })._text),
      });
      return true;
    }),
  });

  // jsdom's Blob has no synchronous accessor, so stash the text on construction.
  const RealBlob = global.Blob;
  global.Blob = class extends RealBlob {
    _text: string;
    constructor(parts: BlobPart[], options?: BlobPropertyBag) {
      super(parts, options);
      this._text = String(parts[0]);
    }
  } as unknown as typeof Blob;
});

describe('trackPageview', () => {
  it('emits a pageview carrying the path and anonymous ids', () => {
    loadTracker().trackPageview('/archive/ai');

    expect(captured).toHaveLength(1);
    expect(captured[0].via).toBe('fetch');
    expect(captured[0].body).toMatchObject({ type: 'pageview', path: '/archive/ai' });
    expect(typeof captured[0].body.visitorId).toBe('string');
    expect(typeof captured[0].body.sessionId).toBe('string');
  });

  it('reuses one visitor id across pageviews but mints it only once', () => {
    const tracker = loadTracker();
    tracker.trackPageview('/');
    tracker.trackPageview('/archive/writing');

    // The second pageview also flushes engagement for the first, so filter.
    const pageviews = captured.filter((event) => event.body.type === 'pageview');
    expect(pageviews).toHaveLength(2);
    expect(pageviews[0].body.visitorId).toBe(pageviews[1].body.visitorId);
    expect(window.localStorage.getItem('nl.analytics.visitor')).toBe(pageviews[0].body.visitorId);
    expect(window.sessionStorage.getItem('nl.analytics.session')).toBe(pageviews[0].body.sessionId);
  });

  it('passes an explicit referrer through', () => {
    loadTracker().trackPageview('/', 'https://www.linkedin.com/feed/');
    expect(captured[0].body.referrer).toBe('https://www.linkedin.com/feed/');
  });
});

describe('trackCategoryClick', () => {
  it('tags the project kind and id', () => {
    loadTracker().trackCategoryClick('ai', 'footy-eleven');
    expect(captured[0].body).toMatchObject({
      type: 'category_click',
      category: 'ai',
      label: 'footy-eleven',
    });
  });

  it('allows a bare category, as the masthead About link uses', () => {
    loadTracker().trackCategoryClick('about');
    expect(captured[0].body).toMatchObject({
      type: 'category_click',
      category: 'about',
      label: null,
    });
  });
});

describe('trackOutbound', () => {
  it('uses sendBeacon so the event survives the navigation it triggers', () => {
    loadTracker().trackOutbound('linkedin', 'https://www.linkedin.com/in/nmluna/');

    expect(captured[0].via).toBe('beacon');
    expect(captured[0].body).toMatchObject({
      type: 'outbound',
      label: 'linkedin',
      href: 'https://www.linkedin.com/in/nmluna/',
    });
  });
});

describe('engagement', () => {
  it('reports scroll depth and elapsed time when the page is left', () => {
    const tracker = loadTracker();
    tracker.initAnalytics();
    tracker.trackPageview('/');
    captured.length = 0;

    // A viewport-sized document counts as fully seen.
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('pagehide'));

    const engagement = captured.find((event) => event.body.type === 'engagement');
    expect(engagement).toBeDefined();
    expect(engagement?.body.path).toBe('/');
    expect(engagement?.body.scrollDepth).toBe(100);
    expect(typeof engagement?.body.durationMs).toBe('number');
  });

  it('closes out the previous page before a soft navigation', () => {
    const tracker = loadTracker();
    tracker.initAnalytics();
    tracker.trackPageview('/');
    captured.length = 0;

    tracker.trackPageview('/archive/ai');

    // The engagement for "/" must be flushed before the new pageview lands.
    const types = captured.map((event) => [event.body.type, event.body.path]);
    expect(types).toContainEqual(['engagement', '/']);
    expect(types).toContainEqual(['pageview', '/archive/ai']);
    expect(types.findIndex((t) => t[0] === 'engagement')).toBeLessThan(
      types.findIndex((t) => t[0] === 'pageview')
    );
  });
});

describe('resilience', () => {
  it('never throws when the transport fails', () => {
    global.fetch = jest.fn(() => {
      throw new Error('network down');
    }) as unknown as typeof fetch;

    expect(() => loadTracker().trackPageview('/')).not.toThrow();
  });
});
