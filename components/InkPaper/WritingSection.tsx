import Link from 'next/link';
import type { ProjectItem } from './data';
import { Frame } from './Frame';
import { useProjectModal } from './ProjectModal';
import { TAG_TONE_CLASS } from './tagTone';
import classes from './InkPaper.module.css';

export function WritingRow({ article }: { article: ProjectItem }) {
  const { openProject } = useProjectModal();

  return (
    <button
      type="button"
      className={`${classes.tap} ${classes.writeRow}`}
      onClick={() => openProject(article)}
    >
      <span className={classes.date}>{article.meta}</span>
      <Frame className={classes.writeThumb} src={article.image} alt={article.imageAlt} />
      <span className={classes.writeTitleWrap}>
        <span className={classes.writeTitle}>{article.title}</span>
        {article.tags && article.tags.length > 0 && (
          <span className={`${classes.tags} ${classes.rowTags}`}>
            {article.tags.map((tag) => (
              <span
                key={tag.label}
                className={TAG_TONE_CLASS[tag.tone]}
              >
                {tag.label}
              </span>
            ))}
          </span>
        )}
      </span>
      <span className={classes.writeVenue}>{article.venue}</span>
    </button>
  );
}

export function WritingSection({ articles }: { articles: ProjectItem[] }) {
  const preview = articles.slice(0, 4);

  return (
    <section id="writing" className={classes.writing} data-screen-label="Writing">
      <div className={classes.workInner}>
        <div className={`${classes.sectionHead} ${classes.sectionHeadRuled} ${classes.writingHead}`}>
          <h2 className={classes.sectionTitle}>Writing</h2>
          <span className={`${classes.kicker} ${classes.kickerRust}`}>03 — Sports desk</span>
        </div>

        <p className={classes.writingSub}>
          Understanding how money moves through the sports product — revenue, models, and the tech redefining winning.
        </p>

        <div className={classes.rows}>
          {preview.map((article) => (
            <WritingRow key={article.id} article={article} />
          ))}
        </div>

        <Link href="/archive/writing" className={classes.sectionArchiveLink}>
          Full archive →
        </Link>
      </div>
    </section>
  );
}
