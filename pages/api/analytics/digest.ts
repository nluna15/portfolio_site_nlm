import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { buildReport } from '../../../lib/analytics/aggregate';
import { secretsMatch } from '../../../lib/analytics/auth';
import {
  renderDigestHtml,
  renderDigestSubject,
  renderDigestText,
} from '../../../lib/analytics/digestEmail';

const RECIPIENT = 'luna.nehemias@gmail.com';
/**
 * Resend's shared sender works without a verified domain, but only delivers to
 * the address that owns the Resend account. Set DIGEST_FROM once a domain is
 * verified.
 */
const DEFAULT_FROM = 'Portfolio Analytics <onboarding@resend.dev>';

/**
 * Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is
 * set on the project. The same secret allows a manual trigger, which is how the
 * digest gets tested outside the schedule.
 */
function isAuthorized(req: NextApiRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Without a configured secret the endpoint would be world-triggerable.
    return false;
  }

  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return secretsMatch(header.slice('Bearer '.length), secret);
  }
  return secretsMatch(req.headers['x-cron-secret'], secret);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!process.env.CRON_SECRET) {
    res.status(503).json({ error: 'CRON_SECRET is not configured on this deployment.' });
    return;
  }
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'RESEND_API_KEY is not configured.' });
    return;
  }

  try {
    const report = await buildReport();

    // `?dryRun=1` renders and returns the digest without sending, so the
    // aggregation and template can be checked without mailing anything.
    if (req.query.dryRun === '1') {
      res.status(200).json({
        sent: false,
        subject: renderDigestSubject(report),
        html: renderDigestHtml(report),
        text: renderDigestText(report),
        report,
      });
      return;
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: process.env.DIGEST_FROM ?? DEFAULT_FROM,
      to: RECIPIENT,
      subject: renderDigestSubject(report),
      html: renderDigestHtml(report),
      text: renderDigestText(report),
    });

    if (error) {
      console.error('[analytics] resend rejected the digest', error);
      res.status(502).json({ sent: false, error: error.message });
      return;
    }

    res.status(200).json({ sent: true, id: data?.id, to: RECIPIENT });
  } catch (error) {
    console.error('[analytics] digest failed', error);
    res.status(500).json({ sent: false, error: 'Digest failed.' });
  }
}
