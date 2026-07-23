import { trackOutbound } from '../../lib/analytics/client';
import classes from './InkPaper.module.css';

const EMAIL_HREF = 'mailto:luna.nehemias@gmail.com';
const LINKEDIN_HREF = 'https://www.linkedin.com/in/nmluna/';
const GITHUB_HREF = 'https://github.com/nluna15';
const SUBSTACK_HREF = 'https://substack.com/@nehemiasluna';

export function SiteFooter() {
  return (
    <footer className={classes.footer} data-screen-label="Footer">
      <div className={classes.ruleThin} />
      <div className={`${classes.ruleThick} ${classes.ruleGap}`} />
      <div className={classes.footerRow}>
        <div className={classes.footerLinks}>
          <a href={EMAIL_HREF} onClick={() => trackOutbound('email', EMAIL_HREF)}>
            Email
          </a>
          <a
            href={LINKEDIN_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOutbound('linkedin', LINKEDIN_HREF)}
          >
            LinkedIn
          </a>
          <a
            href={GITHUB_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOutbound('github', GITHUB_HREF)}
          >
            GitHub
          </a>
          <a
            href={SUBSTACK_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOutbound('substack', SUBSTACK_HREF)}
          >
            Substack
          </a>
        </div>
        <span className={classes.colophon}>© 2026 Nehemias Luna — Set in Fraunces &amp; Plex</span>
      </div>
    </footer>
  );
}
