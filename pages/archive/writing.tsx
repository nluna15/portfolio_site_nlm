import Head from 'next/head';
import { ArchiveLayout } from '../../components/InkPaper/ArchiveLayout';
import type { ProjectItem } from '../../components/InkPaper/data';
import { fetchSubstackArticles } from '../../components/InkPaper/substack';
import { WritingRow } from '../../components/InkPaper/WritingSection';
import classes from '../../components/InkPaper/InkPaper.module.css';

export const getStaticProps = async () => ({
  props: { articles: await fetchSubstackArticles() },
  revalidate: 3600,
});

export default function WritingArchivePage({ articles }: { articles: ProjectItem[] }) {
  return (
    <>
      <Head>
        <title>Writing — Archive · Nehemias Luna</title>
      </Head>
      <ArchiveLayout
        title="Writing"
        kicker="Archive — Sports desk"
        intro="The full run from the sports desk — on analytics, front offices, and the games behind the numbers. Select any piece to read the summary."
        backHref="/#writing"
        backLabel="Back to home"
      >
        <div className={classes.rows}>
          {articles.map((article) => (
            <WritingRow key={article.id} article={article} />
          ))}
        </div>
      </ArchiveLayout>
    </>
  );
}
