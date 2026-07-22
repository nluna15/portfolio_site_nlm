import classes from './InkPaper.module.css';

interface FrameProps {
  src: string;
  alt?: string;
  caption?: string;
  className?: string;
}

export function Frame({ src, alt = '', caption, className }: FrameProps) {
  return (
    <div className={className ? `${classes.frame} ${className}` : classes.frame}>
      <img src={src} alt={alt} />
      {caption && <span className={classes.cap}>{caption}</span>}
    </div>
  );
}
