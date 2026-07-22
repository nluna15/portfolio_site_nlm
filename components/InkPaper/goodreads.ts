import Parser from 'rss-parser';

const FEED_URL =
  'https://www.goodreads.com/review/list_rss/112276154?key=drhp5llXkv3KGYwB5eX96wyl1yhTHFGtujlvtryTYoGZR1XU&shelf=currently-reading';

interface GoodreadsItem {
  title?: string;
  link?: string;
  book_id?: string;
}

/** A book on the shelf: its title plus a Goodreads page to link to (null when unavailable). */
export interface ReadingItem {
  title: string;
  url: string | null;
}

const parser: Parser<unknown, GoodreadsItem> = new Parser({
  customFields: { item: ['book_id'] },
});

function formatReading(item: GoodreadsItem): ReadingItem | null {
  const title = item.title?.trim();
  if (!title) {
    return null;
  }
  const bookId = item.book_id?.trim();
  // Prefer the book page over the feed's <link>, which points at the review.
  const url = bookId
    ? `https://www.goodreads.com/book/show/${bookId}`
    : item.link?.trim() || null;
  return { title, url };
}

/**
 * Fetch the Goodreads "currently-reading" shelf and return every book on it for
 * the NowBar, most-recently-updated first. Runs server-side (getStaticProps).
 * Never throws: on any failure — or an empty shelf — it logs and returns [] so
 * the NowBar falls back to its default and ISR keeps serving.
 */
export async function fetchCurrentlyReading(): Promise<ReadingItem[]> {
  try {
    const feed = await parser.parseURL(FEED_URL);
    return feed.items
      .map(formatReading)
      .filter((entry): entry is ReadingItem => entry !== null);
  } catch (error) {
    console.error('Failed to fetch Goodreads feed:', error);
    return [];
  }
}
