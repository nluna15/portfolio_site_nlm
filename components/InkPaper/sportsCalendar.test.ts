import { parseCalendar, selectWatching } from './sportsCalendar';

const SAMPLE = `# a comment line
# another comment

Fallback: the winter transfer window

- 2026-07-04 → 2026-07-26 | the Tour de France | the Tour
- 2026-08-31 → 2026-09-13 | the US Open
- 2026-09-25 → 2026-09-27 | Ryder Cup weekend | the Ryder Cup
`;

describe('parseCalendar', () => {
  it('reads events and the fallback, skipping comments and blank lines', () => {
    const { events, fallback } = parseCalendar(SAMPLE);
    expect(fallback).toBe('the winter transfer window');
    expect(events).toHaveLength(3);
    expect(events[0]).toEqual({
      start: '2026-07-04',
      end: '2026-07-26',
      label: 'the Tour de France',
      shortName: 'the Tour',
    });
    // Short name is omitted when the third column is absent.
    expect(events[1].shortName).toBeUndefined();
  });

  it('sorts events by start date', () => {
    const { events } = parseCalendar(
      '- 2026-09-25 → 2026-09-27 | B\n- 2026-07-04 → 2026-07-26 | A'
    );
    expect(events.map((event) => event.label)).toEqual(['A', 'B']);
  });
});

describe('selectWatching', () => {
  const { events, fallback } = parseCalendar(SAMPLE);

  it('returns the live event label when one is on', () => {
    expect(selectWatching(events, fallback, new Date('2026-07-13T12:00:00'))).toEqual([
      'the Tour de France',
    ]);
  });

  it('counts down to the next event when nothing is live', () => {
    expect(selectWatching(events, fallback, new Date('2026-08-01T12:00:00'))).toEqual([
      'Counting down to the US Open',
    ]);
  });

  it('uses the short name in the countdown when present', () => {
    expect(selectWatching(events, fallback, new Date('2026-06-01T12:00:00'))).toEqual([
      'Counting down to the Tour',
    ]);
  });

  it('falls back when every event is in the past', () => {
    expect(selectWatching(events, fallback, new Date('2027-01-01T12:00:00'))).toEqual([
      'the winter transfer window',
    ]);
  });

  it('returns every live event shortest-first when several overlap', () => {
    const { events: overlapping } = parseCalendar(
      '- 2026-03-26 → 2026-09-27 | the Phillies\n- 2026-06-29 → 2026-07-12 | Wimbledon'
    );
    // Both live on this date; the two-week Wimbledon leads the season-long Phillies.
    expect(selectWatching(overlapping, 'fallback', new Date('2026-07-05T12:00:00'))).toEqual([
      'Wimbledon',
      'the Phillies',
    ]);
    // Once Wimbledon ends, only the long season remains.
    expect(selectWatching(overlapping, 'fallback', new Date('2026-08-01T12:00:00'))).toEqual([
      'the Phillies',
    ]);
  });
});
