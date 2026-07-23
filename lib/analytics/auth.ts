import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time secret comparison. Hashing both sides to a fixed width first
 * means `timingSafeEqual` never throws on a length mismatch and the comparison
 * leaks nothing about the expected length.
 */
export function secretsMatch(provided: unknown, expected: string | undefined): boolean {
  if (typeof provided !== 'string' || !expected) {
    return false;
  }

  const a = Buffer.from(provided.padEnd(128).slice(0, 128));
  const b = Buffer.from(expected.padEnd(128).slice(0, 128));
  return timingSafeEqual(a, b) && provided.length === expected.length;
}

export const DASHBOARD_PASSWORD_ENV = 'ANALYTICS_DASHBOARD_PASSWORD';
export const DASHBOARD_SLUG_ENV = 'ANALYTICS_DASHBOARD_SLUG';
