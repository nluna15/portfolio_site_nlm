import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { trackCategoryClick, trackOutbound } from '../../lib/analytics/client';
import type { ProjectItem } from './data';
import { Frame } from './Frame';
import { TAG_TONE_CLASS } from './tagTone';
import classes from './InkPaper.module.css';

interface ProjectModalContextValue {
  openProject: (project: ProjectItem) => void;
  closeProject: () => void;
}

const ProjectModalContext = createContext<ProjectModalContextValue | null>(null);

const KIND_KICKER: Record<ProjectItem['kind'], string> = {
  ai: 'Agentic AI Project',
  corporate: 'Product Work',
  writing: 'Writing',
};

export function useProjectModal() {
  const context = useContext(ProjectModalContext);
  if (!context) {
    throw new Error('useProjectModal must be used within a ProjectModalProvider');
  }
  return context;
}

export function ProjectModalProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ProjectItem | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const openProject = useCallback((project: ProjectItem) => {
    lastFocused.current = (document.activeElement as HTMLElement) ?? null;
    setActive(project);
    // Every modal entry point routes through here, so this one call covers the
    // homepage sections and all three archive pages.
    trackCategoryClick(project.kind, project.id);
  }, []);

  const closeProject = useCallback(() => {
    setActive(null);
  }, []);

  // Escape to close + lock body scroll while a project is open.
  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeProject();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      lastFocused.current?.focus();
    };
  }, [active, closeProject]);

  const value = useMemo(() => ({ openProject, closeProject }), [openProject, closeProject]);

  return (
    <ProjectModalContext.Provider value={value}>
      {children}
      {active ? (
        <ProjectModalView project={active} closeRef={closeRef} onClose={closeProject} />
      ) : null}
    </ProjectModalContext.Provider>
  );
}

interface ProjectModalViewProps {
  project: ProjectItem;
  onClose: () => void;
  closeRef: React.RefObject<HTMLButtonElement | null>;
}

function ProjectModalView({ project, onClose, closeRef }: ProjectModalViewProps) {
  const titleId = `project-modal-${project.id}`;

  return (
    <div
      className={classes.overlay}
      role="presentation"
      onClick={onClose}
      data-screen-label="Project detail"
    >
      <div
        className={classes.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          ref={closeRef}
          className={classes.modalClose}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <Frame
          className={classes.modalFrame}
          src={project.image}
          alt={project.imageAlt}
          caption={project.caption}
        />

        <div className={classes.modalBody}>
          <span className={`${classes.kicker} ${classes.kickerNavy}`}>
            {KIND_KICKER[project.kind]}
          </span>
          <h2 id={titleId} className={classes.modalTitle}>
            {project.title}
          </h2>

          <div className={classes.modalMeta}>
            <span className={classes.date}>{project.meta}</span>
            {project.role && (
              <>
                <span className={classes.nowDot}>·</span>
                <span className={classes.date}>{project.role}</span>
              </>
            )}
            {project.venue && (
              <>
                <span className={classes.nowDot}>·</span>
                <span className={classes.writeVenue}>{project.venue}</span>
              </>
            )}
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className={classes.tags}>
              {project.tags.map((tag) => (
                <span
                  key={tag.label}
                  className={TAG_TONE_CLASS[tag.tone]}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}

          {project.summary.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className={classes.modalText}>
              {paragraph}
            </p>
          ))}

          {project.highlights && project.highlights.length > 0 && (
            <ul className={classes.modalHighlights}>
              {project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          )}

          {project.linksLead && (project.link || project.secondaryLink) && (
            <p className={classes.modalText}>{project.linksLead}</p>
          )}

          {(project.link || project.secondaryLink) && (
            <div className={classes.modalLinks}>
              {project.link && (
                <a
                  className={classes.modalLink}
                  href={project.link.href}
                  onClick={() => trackOutbound(`project:${project.id}`, project.link!.href)}
                >
                  {project.link.label}
                </a>
              )}
              {project.secondaryLink && (
                <a
                  className={classes.modalLink}
                  href={project.secondaryLink.href}
                  onClick={() => trackOutbound(`project:${project.id}`, project.secondaryLink!.href)}
                >
                  {project.secondaryLink.label}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
