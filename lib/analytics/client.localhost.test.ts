/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://localhost:3000/"}
 */

/**
 * The plan records deployed traffic only. jsdom fixes the origin per file, so
 * the localhost-exclusion case lives here rather than alongside the main
 * tracker tests.
 */

describe('localhost exclusion', () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.NEXT_PUBLIC_ANALYTICS_ALLOW_LOCALHOST;
    global.fetch = jest.fn() as unknown as typeof fetch;
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      writable: true,
      value: jest.fn(),
    });
    window.localStorage.clear();
  });

  it('sends nothing from localhost', () => {
    const tracker = require('./client') as typeof import('./client');

    tracker.trackPageview('/');
    tracker.trackCategoryClick('ai', 'footy-eleven');
    tracker.trackOutbound('email', 'mailto:luna.nehemias@gmail.com');

    expect(global.fetch).not.toHaveBeenCalled();
    expect(navigator.sendBeacon).not.toHaveBeenCalled();
  });

  it('does not even mint a visitor id from localhost', () => {
    (require('./client') as typeof import('./client')).trackPageview('/');
    expect(window.localStorage.getItem('nl.analytics.visitor')).toBeNull();
  });

  it('still tracks when the dev override is set', () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ALLOW_LOCALHOST = '1';
    (require('./client') as typeof import('./client')).trackPageview('/');
    expect(global.fetch).toHaveBeenCalled();
  });
});
