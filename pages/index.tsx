import type { ProjectItem } from '../components/InkPaper/data';
import { fetchCurrentlyReading, type ReadingItem } from '../components/InkPaper/goodreads';
import { InkPaper } from '../components/InkPaper/InkPaper';
import { loadWatching } from '../components/InkPaper/sportsCalendar';
import { fetchSubstackArticles } from '../components/InkPaper/substack';

export const getStaticProps = async () => ({
  props: {
    articles: await fetchSubstackArticles(),
    reading: await fetchCurrentlyReading(),
    watching: loadWatching(),
  },
  revalidate: 3600,
});

export default function HomePage({
  articles,
  reading,
  watching,
}: {
  articles: ProjectItem[];
  reading: ReadingItem[];
  watching: string[];
}) {
  return <InkPaper writingArticles={articles} reading={reading} watching={watching} />;
}
