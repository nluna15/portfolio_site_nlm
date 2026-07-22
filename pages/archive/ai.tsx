import Head from 'next/head';
import { ArchiveLayout } from '../../components/InkPaper/ArchiveLayout';
import { AI_PROJECTS } from '../../components/InkPaper/data';
import { Frame } from '../../components/InkPaper/Frame';
import { useProjectModal } from '../../components/InkPaper/ProjectModal';
import { TAG_TONE_CLASS } from '../../components/InkPaper/tagTone';
import classes from '../../components/InkPaper/InkPaper.module.css';

export default function AiArchivePage() {
  const { openProject } = useProjectModal();

  return (
    <>
      <Head>
        <title>AI Projects — Archive · Nehemias Luna</title>
      </Head>
      <ArchiveLayout
        title="AI Projects"
        kicker="Archive — Building with AI"
        intro="Things I've built by vibe-coding with AI agents — a World Cup lineup builder, a daily player-guessing game, a dog-walking app, an interview simulator, a Hollywood agent game, and a model-comparison tool. Select any project to read the full story."
        backHref="/#work"
        backLabel="Back to home"
      >
        <div className={classes.archiveGrid}>
          {AI_PROJECTS.map((project) => (
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
                  <span
                    key={tag.label}
                    className={TAG_TONE_CLASS[tag.tone]}
                  >
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
      </ArchiveLayout>
    </>
  );
}
