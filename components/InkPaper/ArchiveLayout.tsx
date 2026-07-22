import type { ReactNode } from 'react';
import Link from 'next/link';
import { Masthead } from './Masthead';
import { SiteFooter } from './SiteFooter';
import classes from './InkPaper.module.css';

interface ArchiveLayoutProps {
  title: string;
  kicker: string;
  intro: string;
  backHref: string;
  backLabel: string;
  children: ReactNode;
}

export function ArchiveLayout({
  title,
  kicker,
  intro,
  backHref,
  backLabel,
  children,
}: ArchiveLayoutProps) {
  return (
    <div id="top" className={classes.root}>
      <div className={classes.container}>
        <Masthead />

        <main className={classes.archivePage} data-screen-label={`Archive — ${title}`}>
          <Link href={backHref} className={classes.backLink}>
            ← {backLabel}
          </Link>

          <div className={`${classes.sectionHead} ${classes.sectionHeadRuled} ${classes.archiveHead}`}>
            <h1 className={classes.archiveTitle}>{title}</h1>
            <span className={`${classes.kicker} ${classes.kickerNavy}`}>{kicker}</span>
          </div>

          <p className={classes.archiveIntro}>{intro}</p>

          {children}
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
