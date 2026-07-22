import fs from 'node:fs';
import path from 'node:path';

/** One sport event on the rotating calendar. Dates are inclusive `YYYY-MM-DD`. */
export interface SportEvent {
  start: string;
  end: string;
  /** Shown verbatim while the event is live, e.g. "the Tour de France". */
  label: string;
  /** Shown in the countdown phrase, e.g. "the Tour"; falls back to `label`. */
  shortName?: string;
}

const CALENDAR_PATH = 'content/sports-calendar.md';

/** Last-resort value if the file is missing or unparseable — keeps the build green. */
const DEFAULT_WATCHING = 'whatever is on this weekend';

/** Parse a `YYYY-MM-DD` day into a local Date at the given end of the day. */
function dayStart(date: string): Date {
  return new Date(`${date}T00:00:00`);
}
function dayEnd(date: string): Date {
  return new Date(`${date}T23:59:59.999`);
}

/**
 * Parse the calendar markdown into events + a fallback line. Pure — no I/O.
 * Event bullets look like `- 2026-07-04 → 2026-07-26 | live label | short name`.
 * The short name is optional. Comment (`#`), blank, and unrecognized lines are ignored.
 * Events are returned sorted by start date.
 */
export function parseCalendar(md: string): { events: SportEvent[]; fallback: string } {
  const events: SportEvent[] = [];
  let fallback = DEFAULT_WATCHING;

  for (const raw of md.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('#') || line.length === 0) {
      continue;
    }
    if (line.startsWith('Fallback:')) {
      fallback = line.slice('Fallback:'.length).trim() || fallback;
      continue;
    }
    if (!line.startsWith('- ')) {
      continue;
    }

    const [dateRange, label, shortName] = line
      .slice(2)
      .split('|')
      .map((part) => part.trim());
    const [start, end] = (dateRange ?? '').split('→').map((part) => part.trim());
    // Skip malformed rows rather than crashing the whole calendar.
    if (!start || !end || !label) {
      continue;
    }
    events.push({ start, end, label, ...(shortName ? { shortName } : {}) });
  }

  events.sort((a, b) => a.start.localeCompare(b.start));
  return { events, fallback };
}

/** Length of an event in ms — used to favor short, acute events over long seasons. */
function durationMs(event: SportEvent): number {
  return dayEnd(event.end).getTime() - dayStart(event.start).getTime();
}

/**
 * Pick the "Watching" strings for a given moment. Every live event is returned,
 * shortest-running first — so a marquee two-week event (Wimbledon, the World Cup)
 * leads over a months-long regular season it overlaps, and the NowBar can rotate
 * through the rest. Otherwise a single-element countdown to the next upcoming
 * event, and the fallback when nothing is live or upcoming.
 */
export function selectWatching(events: SportEvent[], fallback: string, now: Date): string[] {
  const liveEvents = events.filter(
    (event) => dayStart(event.start) <= now && now <= dayEnd(event.end)
  );
  if (liveEvents.length > 0) {
    // Stable sort keeps the earliest-starting event first on ties (events are
    // start-sorted going in), so equal-length events stay in calendar order.
    return [...liveEvents]
      .sort((a, b) => durationMs(a) - durationMs(b))
      .map((event) => event.label);
  }

  // `events` is sorted by start, so the first future event is the soonest.
  const next = events.find((event) => dayStart(event.start) > now);
  if (next) {
    return [`Counting down to ${next.shortName ?? next.label}`];
  }

  return [fallback];
}

/**
 * Read the calendar file and resolve the current "Watching" values. Server-only
 * (uses `fs`) — call from `getStaticProps`. Never throws: on any failure it logs
 * and returns a safe default so ISR keeps serving the page.
 */
export function loadWatching(now: Date = new Date()): string[] {
  try {
    const md = fs.readFileSync(path.join(process.cwd(), CALENDAR_PATH), 'utf8');
    const { events, fallback } = parseCalendar(md);
    return selectWatching(events, fallback, now);
  } catch (error) {
    console.error('Failed to load sports calendar:', error);
    return [DEFAULT_WATCHING];
  }
}
