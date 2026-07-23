import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Postgres access for analytics. The Neon Marketplace integration exposes the
 * connection string under a few names depending on how it was provisioned, so
 * we accept any of them.
 */
function connectionString(): string {
  const url =
    process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.ANALYTICS_DATABASE_URL;

  if (!url) {
    throw new Error(
      'No Postgres connection string. Set DATABASE_URL (or POSTGRES_URL) — the Neon ' +
        'Marketplace integration provides this automatically once linked.'
    );
  }
  return url;
}

let client: NeonQueryFunction<false, false> | null = null;

export function sql(): NeonQueryFunction<false, false> {
  if (!client) {
    client = neon(connectionString());
  }
  return client;
}

let schemaReady: Promise<void> | null = null;

/**
 * Idempotent schema creation, memoized per process so it costs one round trip
 * per cold start rather than one per request.
 */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = sql();
      await db`
        CREATE TABLE IF NOT EXISTS analytics_events (
          id            BIGSERIAL PRIMARY KEY,
          event_type    TEXT        NOT NULL,
          path          TEXT        NOT NULL,
          category      TEXT,
          label         TEXT,
          href          TEXT,
          visitor_id    TEXT        NOT NULL,
          session_id    TEXT        NOT NULL,
          device_type   TEXT,
          referrer      TEXT,
          scroll_depth  INTEGER,
          duration_ms   INTEGER,
          created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await db`
        CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx
          ON analytics_events (created_at DESC)
      `;
      await db`
        CREATE INDEX IF NOT EXISTS analytics_events_type_created_at_idx
          ON analytics_events (event_type, created_at DESC)
      `;
    })().catch((error) => {
      // Let the next request retry rather than caching a failed init forever.
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}
