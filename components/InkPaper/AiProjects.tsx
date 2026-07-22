import Link from 'next/link';
import { AI_PROJECTS } from './data';
import { Frame } from './Frame';
import { useProjectModal } from './ProjectModal';
import { TAG_TONE_CLASS } from './tagTone';
import classes from './InkPaper.module.css';

const featured = AI_PROJECTS.find((project) => project.featured) ?? AI_PROJECTS[0];
const cards = AI_PROJECTS.filter((project) => project !== featured).slice(0, 3);

export function AiProjects() {
  const { openProject } = useProjectModal();

  return (
    <section id="work-ai" className={classes.work} data-screen-label="Work — Agentic Projects">
      <div className={classes.workInner}>
        <div className={`${classes.sectionHead} ${classes.sectionHeadRuled}`}>
          <h2 className={classes.sectionTitle}>Agentic Projects</h2>
          <span className={`${classes.kicker} ${classes.kickerNavy}`}>02 — Building with AI</span>
        </div>

        <button
          type="button"
          className={`${classes.tap} ${classes.featured}`}
          onClick={() => openProject(featured)}
        >
          <Frame
            className={classes.featuredFrame}
            src={featured.image}
            alt={featured.imageAlt}
            caption={featured.caption}
          />
          <div className={classes.featuredBody}>
            <div className={classes.tags}>
              {featured.tags?.map((tag) => (
                <span key={tag.label} className={TAG_TONE_CLASS[tag.tone]}>
                  {tag.label}
                </span>
              ))}
            </div>
            <h3 className={classes.featuredTitle}>{featured.title}</h3>
            <p className={classes.featuredDesc}>{featured.blurb}</p>
            <span className={classes.date}>{featured.meta}</span>
          </div>
        </button>

        <div className={classes.cardGrid}>
          {cards.map((project) => (
            <button
              type="button"
              key={project.id}
              className={`${classes.tap} ${classes.card}`}
              onClick={() => openProject(project)}
            >
              <Frame
                className={classes.cardFrame}
                src={project.image}
                alt={project.imageAlt}
                caption={project.caption}
              />
              <div className={classes.tags}>
                {project.tags?.map((tag) => (
                  <span key={tag.label} className={TAG_TONE_CLASS[tag.tone]}>
                    {tag.label}
                  </span>
                ))}
              </div>
              <h3 className={classes.cardTitle}>{project.title}</h3>
              <p className={classes.cardDesc}>{project.blurb}</p>
              <span className={classes.date}>{project.meta}</span>
            </button>
          ))}
        </div>

        <Link href="/archive/ai" className={classes.sectionArchiveLink}>
          Full archive →
        </Link>
      </div>
    </section>
  );
}
