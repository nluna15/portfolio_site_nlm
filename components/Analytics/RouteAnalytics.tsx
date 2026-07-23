import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { initAnalytics, trackPageview } from '../../lib/analytics/client';

/**
 * Renders nothing; binds first-party pageview tracking to the router. Soft
 * navigations (home ↔ archives) fire `routeChangeComplete`, which is also what
 * closes out the previous page's engagement window.
 */
export function RouteAnalytics() {
  const router = useRouter();

  useEffect(() => {
    const teardown = initAnalytics();

    // The first pageview of the session, before any route change fires.
    trackPageview(window.location.pathname);

    const onRouteChangeComplete = (url: string) => {
      trackPageview(new URL(url, window.location.origin).pathname);
    };

    router.events.on('routeChangeComplete', onRouteChangeComplete);
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete);
      teardown();
    };
  }, [router.events]);

  return null;
}
