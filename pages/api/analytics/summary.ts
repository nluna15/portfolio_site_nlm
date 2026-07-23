import type { NextApiRequest, NextApiResponse } from 'next';
import { buildReport } from '../../../lib/analytics/aggregate';
import { DASHBOARD_PASSWORD_ENV, secretsMatch } from '../../../lib/analytics/auth';

/**
 * Password-gated read model behind the dashboard. POST-only so the password
 * never lands in a URL, a browser history entry, or an access log.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const expected = process.env[DASHBOARD_PASSWORD_ENV];
  if (!expected) {
    res
      .status(503)
      .json({ error: `${DASHBOARD_PASSWORD_ENV} is not configured on this deployment.` });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
  if (!secretsMatch(body.password, expected)) {
    res.status(401).json({ error: 'Incorrect password.' });
    return;
  }

  try {
    const report = await buildReport();
    // A dashboard read is always live; never let a CDN hold onto it.
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(report);
  } catch (error) {
    console.error('[analytics] summary failed', error);
    res.status(500).json({ error: 'Could not build the report.' });
  }
}
