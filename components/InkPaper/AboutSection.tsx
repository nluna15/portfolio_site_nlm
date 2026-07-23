import { trackOutbound } from "../../lib/analytics/client";
import { Frame } from "./Frame";
import classes from "./InkPaper.module.css";

const EMAIL_HREF = "mailto:luna.nehemias@gmail.com";

export function AboutSection() {
  return (
    <section id="about" data-screen-label="About">
      <div className={`${classes.sectionHead} ${classes.sectionHeadRuled}`}>
        <h2 className={classes.sectionTitle}>About</h2>
        <span className={`${classes.kicker} ${classes.kickerSoft}`}>
          04 — About
        </span>
      </div>
      <div className={classes.about}>
        <Frame
          className={classes.portrait}
          src="/about-portrait.webp"
          alt="Portrait of Nehemias Luna"
          caption="Lunchtime, acrylic on canvas"
        />
        <div className={classes.aboutBody}>
          <p className={classes.pullQuote}>
            I&apos;m Nehemias and I operate in a state of restless optimism.
          </p>
          <p className={classes.aboutText}>
            I&apos;m an experienced senior product manager who first came across
            the profession while at Amazon. What I enjoy most about product is
            that it&apos;s a representation of how you interact with the people
            in your community. It&apos;s why I obsess over the customer data that
            helps our team make decisions quickly. It also motivates me to reign
            in our scope so that we can iterate as well as learn more. I operate
            with the understanding that collaboration and open-mindedness sits at
            the heart of product development. And lastly, I care not only for how
            the product scales, but also for how the design feels to the user.
          </p>
          <p className={classes.aboutText}>
            My expertise is consumer mobile app products. I&apos;ve built
            strategies and products focused on growth and retention levers.
            I&apos;ve also orchestrated multiple agentic AI launches for
            consumers in the travel industry. Teams I&apos;ve led have been part
            of huge wins that have compounded our impact. I&apos;ve also had
            project failures that set us back. Each moment brings its own lessons
            that I carry into the next.
          </p>
          <p className={classes.aboutText}>
            Right now, I&apos;m tinkering with the application of AI for consumer
            products. Plus, I am practicing my value of constant learning by
            diving into the economic and technological trends changing how fans
            interact with sport. The business of sports has long been a personal
            interest that I&apos;ve followed, and I&apos;m using my time now to
            really understand what drives the ecosystems in the industry.
          </p>
          <p className={classes.aboutText}>
            I&apos;m seeking Lead or Senior roles in product management or
            applied AI. I&apos;m prioritizing opportunities in sports technology
            firms and consumer technology companies. If you&apos;re hiring — or
            just looking to chat —{" "}
            <a
              href={EMAIL_HREF}
              onClick={() => trackOutbound("email", EMAIL_HREF)}
            >
              I&apos;d love to talk
            </a>
            !
            Email me at luna (dot) nehemias (at) gmail (dot) com.
          </p>
          <div className={classes.credentials}>
            <div className={classes.credentialsColumn}>
              <span className={classes.credentialsHeading}>Past Companies</span>
              <ul className={classes.credentialsList}>
                <li>
                  <span className={classes.credentialsName}>Expedia Group</span>
                  <span className={classes.credentialsDetail}>
                    Product, Mobile App User Growth, B2B Affiliates
                  </span>
                </li>
                <li>
                  <span className={classes.credentialsName}>
                    Gates Foundation
                  </span>
                  <span className={classes.credentialsDetail}>
                    Strategy Intern, Post Secondary Education
                  </span>
                </li>
                <li>
                  <span className={classes.credentialsName}>
                    Amazon Web Services
                  </span>
                  <span className={classes.credentialsDetail}>
                    Program Manager, AWS Marketing
                  </span>
                </li>
                <li>
                  <span className={classes.credentialsName}>
                    Texas Instruments
                  </span>
                  <span className={classes.credentialsDetail}>
                    Corporate Finance, Supply Chain &amp; Logistics
                  </span>
                </li>
              </ul>
            </div>
            <div className={classes.credentialsColumn}>
              <span className={classes.credentialsHeading}>Education</span>
              <ul className={classes.credentialsList}>
                <li>
                  <span className={classes.credentialsName}>
                    Harvard Business School
                  </span>
                  <span className={classes.credentialsDetail}>
                    MBA, Focus on Strategy and Entrepreneurship
                  </span>
                </li>
                <li>
                  <span className={classes.credentialsName}>
                    Santa Clara University
                  </span>
                  <span className={classes.credentialsDetail}>BS, Finance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
