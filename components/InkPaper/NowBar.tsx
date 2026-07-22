import { Fragment } from 'react';
import type { ReadingItem } from './goodreads';
import { RotatingText, type RotatingItem } from './RotatingText';
import classes from './InkPaper.module.css';

const DEFAULT_WATCHING = ['Wimbledon finals week'];
const DEFAULT_READING: ReadingItem[] = [{ title: 'The MVP Machine', url: null }];

export function NowBar({
  reading = DEFAULT_READING,
  watching = DEFAULT_WATCHING,
}: {
  reading?: ReadingItem[];
  watching?: string[];
}) {
  const readingItems = (reading.length > 0 ? reading : DEFAULT_READING).map(
    (book): RotatingItem => ({ label: book.title, url: book.url })
  );
  const watchingItems = (watching.length > 0 ? watching : DEFAULT_WATCHING).map(
    (label): RotatingItem => ({ label })
  );

  const nowItems: { verb: string; values: RotatingItem[] }[] = [
    { verb: 'Building', values: [{ label: 'AI Powered Articles' }] },
    { verb: 'Reading', values: readingItems },
    { verb: 'Watching', values: watchingItems },
  ];

  return (
    <section className={classes.nowBar} data-screen-label="Currently">
      <span className={classes.nowChip}>Now</span>
      {nowItems.map((item, index) => (
        <Fragment key={item.verb}>
          {index > 0 && <span className={classes.nowDot}>·</span>}
          <span>
            <span className={classes.nowMuted}>{item.verb}</span>{' '}
            <span className={classes.nowValue}>
              <RotatingText items={item.values} />
            </span>
          </span>
        </Fragment>
      ))}
    </section>
  );
}
