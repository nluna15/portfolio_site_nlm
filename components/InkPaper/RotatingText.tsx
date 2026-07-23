import { useEffect, useState } from 'react';
import { trackOutbound } from '../../lib/analytics/client';
import classes from './InkPaper.module.css';

const SWITCH_INTERVAL_MS = 3000;

export interface RotatingItem {
  label: string;
  url?: string | null;
}

function ItemContent({ item }: { item: RotatingItem }) {
  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackOutbound('nowbar', item.url as string)}
      >
        {item.label}
      </a>
    );
  }
  return <>{item.label}</>;
}

/**
 * Cycle through `items` with a vertical slide-in every 3s. A single item (or none)
 * renders as plain static text with no animation — the roll only kicks in when
 * there's actually more than one thing to show. First paint always shows items[0],
 * so it's SSR-safe; the interval starts after hydration. Items with a `url`
 * render as links.
 */
export function RotatingText({ items }: { items: RotatingItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, SWITCH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length <= 1) {
    return items[0] ? <ItemContent item={items[0]} /> : <>{''}</>;
  }

  // Guard the index against an item list that shrank between renders.
  const safeIndex = index % items.length;

  return (
    <span className={classes.rotator}>
      {/* Re-keying on the index restarts the CSS enter animation on every switch. */}
      <span key={safeIndex} className={classes.rotatorItem}>
        <ItemContent item={items[safeIndex]} />
      </span>
    </span>
  );
}
