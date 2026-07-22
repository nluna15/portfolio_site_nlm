import Head from 'next/head';
import { ArchiveLayout } from '../../components/InkPaper/ArchiveLayout';
import { CorporateRow } from '../../components/InkPaper/CorporateProjects';
import { CORPORATE_PROJECTS } from '../../components/InkPaper/data';
import classes from '../../components/InkPaper/InkPaper.module.css';

export default function CorporateArchivePage() {
  return (
    <>
      <Head>
        <title>Selected Product Work — Archive · Nehemias Luna</title>
      </Head>
      <ArchiveLayout
        title="Selected Product Work"
        kicker="Archive — Selected Product Work"
        intro="Product work across travel marketplaces, generative AI, social infrastructure, and internal operations. Select any project to read the full story."
        backHref="/#work-corporate"
        backLabel="Back to home"
      >
        <div className={classes.rows}>
          {CORPORATE_PROJECTS.map((project) => (
            <CorporateRow key={project.id} project={project} />
          ))}
        </div>
      </ArchiveLayout>
    </>
  );
}
