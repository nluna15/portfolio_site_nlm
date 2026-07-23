import { useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { useHeadroom, useWindowScroll } from '@mantine/hooks';
import Link from 'next/link';
import { trackCategoryClick } from '../../lib/analytics/client';
import classes from './InkPaper.module.css';

const STICKY_BAR_OFFSET = 240;

function MastheadRow() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  return (
    <>
      <Link href="/" className={classes.brand}>
        Nehemias Luna
      </Link>
      <nav className={classes.nav}>
        <Link href="/#work" className={classes.navLink}>
          Work
        </Link>
        <Link href="/#writing" className={classes.navLink}>
          Writing
        </Link>
        {/* Per the plan, `about` counts only the masthead link — not the section. */}
        <Link
          href="/#about"
          className={classes.navLink}
          onClick={() => trackCategoryClick('about')}
        >
          About
        </Link>
        <button
          type="button"
          className={classes.themeToggle}
          title="Toggle light / dark"
          aria-label="Toggle light / dark"
          onClick={() => setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')}
        >
          {computedColorScheme === 'dark' ? '◑' : '◐'}
        </button>
      </nav>
    </>
  );
}

export function Masthead() {
  const { pinned } = useHeadroom({ fixedAt: STICKY_BAR_OFFSET });
  const [scroll] = useWindowScroll();
  const showStickyBar = pinned && scroll.y > STICKY_BAR_OFFSET;

  return (
    <>
      <div
        aria-hidden={!showStickyBar}
        className={`${classes.stickyBar} ${showStickyBar ? classes.stickyBarVisible : ''}`}
      >
        <div className={classes.stickyBarInner}>
          <MastheadRow />
        </div>
      </div>
      <header className={classes.masthead} data-screen-label="Masthead">
        <div className={classes.mastheadRow}>
          <MastheadRow />
        </div>
        <div className={classes.ruleThick} />
        <div className={`${classes.ruleThin} ${classes.ruleGap}`} />
        <div className={classes.dateline}>
          <span>Philadelphia, PA</span>
          <span>Vol. 04 — 2026</span>
        </div>
      </header>
    </>
  );
}
