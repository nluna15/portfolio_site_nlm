import classes from './InkPaper.module.css';

const SKILLS = [
  {
    id: 'define-strategy',
    num: '01',
    title: 'Define the Strategy',
    kicker: 'Validate before building',
    desc: 'Crafting product strategies based on our core competencies, make or break assumptions, and financial impact.',
  },
  {
    id: 'find-signal',
    num: '02',
    title: 'Find the Signal',
    kicker: 'Ambiguity to product, fast',
    desc: 'Partner with teammates to conduct data-backed hypotheses that give the team insights on the right directions to go to next. We go from uncertainty to confidence quickly.',
  },
  {
    id: 'build-business',
    num: '03',
    title: 'Build the Business',
    kicker: 'Products that compound',
    desc: 'Scale the product by optimizing the user journey and focusing on monitoring monetization outcomes.',
  },
];

export function WhatIDo() {
  return (
    <section id="what-i-do" className={classes.work} data-screen-label="What I Do">
      <div className={classes.workInner}>
        <div className={`${classes.sectionHead} ${classes.sectionHeadRuled}`}>
          <h2 className={classes.sectionTitle}>What I Do</h2>
          <span className={`${classes.kicker} ${classes.kickerNavy}`}>00 — What I Do</span>
        </div>

        <p className={classes.skillsIntro}>
          I am obsessed with building the experiences people will love. I anchor my decisions in
          service to the people we serve and the teammates I partner with.
        </p>

        <div className={classes.skillsGrid}>
          {SKILLS.map((skill) => (
            <div key={skill.id} className={classes.skillCard}>
              <span className={classes.skillNum}>{skill.num}</span>
              <h3 className={classes.skillTitle}>{skill.title}</h3>
              <span className={classes.skillKicker}>{skill.kicker}</span>
              <p className={classes.skillDesc}>{skill.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
