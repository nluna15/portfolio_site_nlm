/**
 * Week-to-date windows anchored to America/New_York, computed without a date
 * library. "This week" runs Monday 00:00 ET → now; "last week" covers the same
 * elapsed span starting from the previous Monday, so the two are comparable at
 * any point in the week.
 */

export const TIME_ZONE = 'America/New_York';

const PARTS_FORMAT = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function wallClockAt(instant: Date): WallClock {
  const parts = PARTS_FORMAT.formatToParts(instant);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const hour = read('hour');
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    // Some ICU versions render midnight as hour 24 under hour12:false.
    hour: hour === 24 ? 0 : hour,
    minute: read('minute'),
    second: read('second'),
  };
}

/** Offset of the zone from UTC, in ms, at a given instant (DST-aware). */
function offsetMsAt(instant: Date): number {
  const wc = wallClockAt(instant);
  const asIfUtc = Date.UTC(wc.year, wc.month - 1, wc.day, wc.hour, wc.minute, wc.second);
  return asIfUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/**
 * Resolve a zone-local wall clock to a UTC instant. Two passes, because the
 * applicable offset depends on the very instant we are solving for.
 */
function fromWallClock(wc: WallClock): Date {
  const naive = Date.UTC(wc.year, wc.month - 1, wc.day, wc.hour, wc.minute, wc.second);
  const firstGuess = new Date(naive - offsetMsAt(new Date(naive)));
  return new Date(naive - offsetMsAt(firstGuess));
}

/** Midnight ET on the calendar date `dayOffset` days from the given wall clock. */
function midnightEtOffsetBy(wc: WallClock, dayOffset: number): Date {
  const shifted = new Date(Date.UTC(wc.year, wc.month - 1, wc.day + dayOffset));
  return fromWallClock({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: 0,
    minute: 0,
    second: 0,
  });
}

export interface Period {
  start: Date;
  end: Date;
}

export interface PeriodPair {
  current: Period;
  previous: Period;
  timeZone: string;
}

/**
 * Week-to-date (Monday start) versus the same weekday-and-time span one week
 * earlier. Both boundaries are recomputed from the ET calendar rather than by
 * subtracting 7×24h, so a DST transition mid-comparison does not shift the
 * window by an hour.
 */
export function weekToDatePeriods(now: Date = new Date()): PeriodPair {
  const wc = wallClockAt(now);
  const dayOfWeek = new Date(Date.UTC(wc.year, wc.month - 1, wc.day)).getUTCDay(); // 0 = Sunday
  const daysSinceMonday = (dayOfWeek + 6) % 7;

  const currentStart = midnightEtOffsetBy(wc, -daysSinceMonday);
  const previousStart = midnightEtOffsetBy(wc, -daysSinceMonday - 7);
  const elapsedMs = now.getTime() - currentStart.getTime();

  return {
    current: { start: currentStart, end: now },
    previous: { start: previousStart, end: new Date(previousStart.getTime() + elapsedMs) },
    timeZone: TIME_ZONE,
  };
}

export function formatEt(instant: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(instant);
}
