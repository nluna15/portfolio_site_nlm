import { TIME_ZONE, weekToDatePeriods } from './period';

/** Render an instant as ET wall-clock, to assert against the boundaries. */
function et(instant: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instant);
}

describe('weekToDatePeriods', () => {
  it('starts the current week on Monday 00:00 ET', () => {
    // Wednesday 2026-07-22, 16:10 ET (EDT = UTC-4).
    const { current } = weekToDatePeriods(new Date('2026-07-22T20:10:00Z'));
    expect(et(current.start)).toBe('2026-07-20, 00:00');
  });

  it('treats Sunday as the last day of the week, not the first', () => {
    // Sunday 2026-07-26 12:00 ET — the week still starts Monday the 20th.
    const { current } = weekToDatePeriods(new Date('2026-07-26T16:00:00Z'));
    expect(et(current.start)).toBe('2026-07-20, 00:00');
  });

  it('anchors Monday itself to midnight the same day', () => {
    const { current } = weekToDatePeriods(new Date('2026-07-20T13:00:00Z'));
    expect(et(current.start)).toBe('2026-07-20, 00:00');
  });

  it('compares against the same elapsed span one week earlier', () => {
    const now = new Date('2026-07-22T20:10:00Z');
    const { current, previous } = weekToDatePeriods(now);

    expect(et(previous.start)).toBe('2026-07-13, 00:00');
    // Same weekday and wall-clock time as `now`, one week back.
    expect(et(previous.end)).toBe('2026-07-15, 16:10');
    expect(previous.end.getTime() - previous.start.getTime()).toBe(
      current.end.getTime() - current.start.getTime()
    );
  });

  it('ends the current period at the supplied instant', () => {
    const now = new Date('2026-07-22T20:10:00Z');
    expect(weekToDatePeriods(now).current.end).toEqual(now);
  });

  it('holds both boundaries at ET midnight across a DST transition', () => {
    // DST ends Sunday 2026-11-01. This Wednesday is EST (UTC-5) while the
    // comparison week is EDT (UTC-4) — a naive 7×24h subtraction would land
    // the previous boundary at 23:00 the day before.
    const { current, previous } = weekToDatePeriods(new Date('2026-11-04T17:00:00Z'));
    expect(et(current.start)).toBe('2026-11-02, 00:00');
    expect(et(previous.start)).toBe('2026-10-26, 00:00');
  });

  it('crosses a month boundary correctly', () => {
    // Thursday 2026-04-02 ET; the week began the previous Monday, in March.
    const { current, previous } = weekToDatePeriods(new Date('2026-04-02T18:00:00Z'));
    expect(et(current.start)).toBe('2026-03-30, 00:00');
    expect(et(previous.start)).toBe('2026-03-23, 00:00');
  });
});
