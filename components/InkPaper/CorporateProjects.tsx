import Link from 'next/link';
import { CORPORATE_PROJECTS, type ProjectItem } from './data';
import { Frame } from './Frame';
import { useProjectModal } from './ProjectModal';
import { TAG_TONE_CLASS } from './tagTone';
import classes from './InkPaper.module.css';

const preview = CORPORATE_PROJECTS.slice(0, 3);

export function CorporateRow({ project }: { project: ProjectItem }) {
  const { openProject } = useProjectModal();

  return (
    <button
      type="button"
      className={`${classes.tap} ${classes.corpRow}`}
      onClick={() => openProject(project)}
    >
      <span className={classes.corpNumeral}>{project.numeral}</span>
      <Frame className={classes.corpThumb} src={project.image} alt={project.imageAlt} />
      <span className={classes.corpText}>
        <span className={classes.corpTitle}>{project.title}</span>
        <span className={classes.corpDesc}>{project.blurb}</span>
        {project.tags && project.tags.length > 0 && (
          <span className={`${classes.tags} ${classes.rowTags}`}>
            {project.tags.map((tag) => (
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
      <span className={`${classes.date} ${classes.corpDate}`}>{project.meta}</span>
    </button>
  );
}

export function CorporateProjects() {
  return (
    <section
      id="work"
      className={classes.corporate}
      data-screen-label="Work — Selected Product Work"
    >
      <div className={classes.workInner}>
        <div className={`${classes.sectionHead} ${classes.sectionHeadRuled} ${classes.corporateHead}`}>
          <h2 className={`${classes.sectionTitle} ${classes.sectionTitleSm}`}>Selected Product Work</h2>
          <span className={`${classes.kicker} ${classes.kickerNavy}`}>01 — Selected Product Work</span>
        </div>

        <div className={classes.rows}>
          {preview.map((project) => (
            <CorporateRow key={project.id} project={project} />
          ))}
        </div>

        <Link href="/archive/corporate" className={classes.sectionArchiveLink}>
          Full archive →
        </Link>
      </div>
    </section>
  );
}
