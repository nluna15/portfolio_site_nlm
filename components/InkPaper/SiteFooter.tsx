import classes from './InkPaper.module.css';

export function SiteFooter() {
  return (
    <footer className={classes.footer} data-screen-label="Footer">
      <div className={classes.ruleThin} />
      <div className={`${classes.ruleThick} ${classes.ruleGap}`} />
      <div className={classes.footerRow}>
        <div className={classes.footerLinks}>
          <a href="mailto:luna.nehemias@gmail.com">Email</a>
          <a href="https://www.linkedin.com/in/nmluna/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href="https://github.com/nluna15" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://substack.com/@nehemiasluna" target="_blank" rel="noopener noreferrer">
            Substack
          </a>
        </div>
        <span className={classes.colophon}>© 2026 Nehemias Luna — Set in Fraunces &amp; Plex</span>
      </div>
    </footer>
  );
}
