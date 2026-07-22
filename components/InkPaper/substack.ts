import Parser from 'rss-parser';
import { toneForLabel, type ProjectItem } from './data';

const FEED_URL = 'https://nehemiasluna.substack.com/feed';
const EXCERPT_LENGTH = 1000;
const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/substack/210/158';

/** Extra <item> fields Substack ships that rss-parser doesn't map by default. */
interface SubstackItem {
  title?: string;
  link?: string;
  guid?: string;
  isoDate?: string;
  enclosure?: { url?: string; type?: string };
  categories?: string[];
  content?: string;
  contentEncoded?: string;
}

const parser: Parser<unknown, SubstackItem> = new Parser({
  customFields: {
    item: [['content:encoded', 'contentEncoded']],
  },
});

/** Strip HTML tags, decode the common named/numeric entities, collapse whitespace. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, ' ')
    .trim();
}

/** First `EXCERPT_LENGTH` characters of plain text, with an ellipsis when truncated. */
function excerptOf(html: string): string {
  const text = stripHtml(html);
  if (text.length <= EXCERPT_LENGTH) {
    return text;
  }
  return `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…`;
}

/** "JUL 2026" — matches the uppercase month/year style used across the writing UI. */
function formatDate(isoDate?: string): string {
  if (!isoDate) {
    return '';
  }
  return new Date(isoDate)
    .toLocaleString('en-US', { month: 'short', year: 'numeric' })
    .toUpperCase();
}

/**
 * Prefer the feed's <enclosure> image, but only when it's actually an image —
 * podcast posts carry an audio enclosure. Otherwise use the first <img> in the body.
 */
function imageOf(item: SubstackItem): string {
  const enclosure = item.enclosure;
  if (enclosure?.url && (enclosure.type?.startsWith('image/') ?? true)) {
    return enclosure.url;
  }
  const body = item.contentEncoded ?? item.content ?? '';
  const match = body.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? PLACEHOLDER_IMAGE;
}

function slugOf(item: SubstackItem): string {
  if (item.link) {
    try {
      const last = new URL(item.link).pathname.split('/').filter(Boolean).pop();
      if (last) {
        return last;
      }
    } catch {
      // fall through to guid
    }
  }
  return item.guid ?? item.title ?? 'post';
}

function toProjectItem(item: SubstackItem): ProjectItem {
  const excerpt = excerptOf(item.contentEncoded ?? item.content ?? '');
  const href = item.link ?? FEED_URL;
  const tags = item.categories
    ?.slice(0, 2)
    .map((label) => ({ label, tone: toneForLabel(label) }));
  return {
    id: slugOf(item),
    kind: 'writing',
    title: item.title ?? 'Untitled',
    blurb: excerpt,
    image: imageOf(item),
    imageAlt: item.title ?? 'Substack article',
    // Only include `tags` when the feed has categories — getStaticProps can't
    // serialize `undefined`, so the key must be omitted rather than set to it.
    ...(tags && tags.length > 0 ? { tags } : {}),
    meta: formatDate(item.isoDate),
    venue: 'Substack ↗',
    summary: [excerpt],
    link: { label: 'Read on Substack ↗', href },
  };
}

/**
 * Fetch and parse the Substack RSS feed into the site's ProjectItem shape.
 * Runs server-side (getStaticProps). Returns [] on any failure so ISR keeps
 * serving the last good page and the Writing section still renders.
 */
export async function fetchSubstackArticles(): Promise<ProjectItem[]> {
  try {
    const feed = await parser.parseURL(FEED_URL);
    return feed.items.map(toProjectItem);
  } catch (error) {
    console.error('Failed to fetch Substack feed:', error);
    return [];
  }
}
