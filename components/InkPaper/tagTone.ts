import type { TagTone } from './data';
import classes from './InkPaper.module.css';

export const TAG_TONE_CLASS: Record<TagTone, string> = {
  navy: classes.tagNavy,
  rust: classes.tagRust,
  moss: classes.tagMoss,
  gold: classes.tagGold,
  plum: classes.tagPlum,
  teal: classes.tagTeal,
};
