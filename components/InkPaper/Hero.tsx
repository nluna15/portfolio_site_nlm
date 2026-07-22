import { Frame } from './Frame';
import classes from './InkPaper.module.css';

export function Hero() {
  return (
    <section className={classes.hero} data-screen-label="Hero">
      <div className={classes.heroText}>
        <h1 className={classes.heroTitle}>
          Senior product manager shipping with <em className={classes.emNavy}>AI</em>.
          <br />
          Analyzing the <em className={classes.emRust}>business of sports</em>.
        </h1>
      </div>
      <Frame
        className={classes.heroFrame}
        src="/portrait.webp"
        alt="Nehemias Luna"
        caption="Press box, Wk 14"
      />
    </section>
  );
}
