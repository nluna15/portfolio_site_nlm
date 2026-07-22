import { AboutSection } from './AboutSection';
import { AiProjects } from './AiProjects';
import { CorporateProjects } from './CorporateProjects';
import type { ProjectItem } from './data';
import type { ReadingItem } from './goodreads';
import { Hero } from './Hero';
import { Masthead } from './Masthead';
import { NowBar } from './NowBar';
import { SiteFooter } from './SiteFooter';
import { WhatIDo } from './WhatIDo';
import { WritingSection } from './WritingSection';
import classes from './InkPaper.module.css';

export function InkPaper({
  writingArticles = [],
  reading,
  watching,
}: {
  writingArticles?: ProjectItem[];
  reading?: ReadingItem[];
  watching?: string[];
}) {
  return (
    <div id="top" className={classes.root}>
      <div className={classes.container}>
        <Masthead />
        <Hero />
        <NowBar reading={reading} watching={watching} />
        <WhatIDo />
        <CorporateProjects />
        <AiProjects />
        <WritingSection articles={writingArticles} />
        <AboutSection />
        <SiteFooter />
      </div>
    </div>
  );
}
