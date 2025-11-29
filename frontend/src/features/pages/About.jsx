import React from "react";
import namoTopCut from "../../shared/assets/img/NAMO - Top - cut.png";
import styles from "./SectionHow.module.css";

const About = () => (
  <>
    <section className={`section-hero ${styles.heroSection}`}>
      <div className="hero">
        <div className={`hero-text-box slide-up ${styles.heroTextBox}`}>
          <div className="tag-heading">
            <p className="tag-heading-text">Who we are</p>
            <ion-icon name="leaf-outline" className="tag-icon"></ion-icon>
          </div>
          <h1 className="heading-primary">Crafted for natural relief</h1>
          <p className="hero-description">
            NAMO was founded to help people move freely again—without harsh
            chemicals or complicated routines. We combine time-tested botanicals
            with modern quality standards to deliver consistent, dependable
            relief.
          </p>
        </div>
        <div className={`hero-img-box slide-up ${styles.heroImageBox}`}>
          <img
            src={namoTopCut}
            className={`hero-img ${styles.heroImage}`}
            alt="Namo Herbal Ointment jar"
          />
        </div>
      </div>
    </section>

    <section className={`section-how ${styles.aboutStory}`} id="about-story">
      <div className={`container ${styles.aboutContainer}`}>
        <div className={`grid grid--2-cols ${styles.aboutGrid}`}>
          <article className={`step-text-box slide-up ${styles.aboutCard}`}>
            <h3 className={`heading-tertiary ${styles.darkHeading}`}>
              Our mission
            </h3>
            <p
              className={`step-description ${styles.darkParagraph} ${styles.paragraphSpacing}`}
            >
              We exist to help people move freely and comfortably with a formula
              that’s simple, effective, and trustworthy.
            </p>
            <p className={`step-description ${styles.darkParagraph}`}>
              Each batch is crafted with traceable botanicals and lab-checked
              for consistency—so you feel the same reliable relief every time.
            </p>
          </article>

          <article className={`step-text-box slide-up ${styles.aboutCard}`}>
            <h3 className={`heading-tertiary ${styles.darkHeading}`}>
              What sets us apart
            </h3>
            <ul className={styles.aboutList}>
              <li>
                Balanced botanicals that calm inflammation without harsh
                additives.
              </li>
              <li>
                Transparent sourcing, batch testing, and clear usage guidance.
              </li>
              <li>
                Real customer support, quick answers, and a focus on long-term
                relief.
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <section className={styles.aboutTestimonialsSection}>
      <div className="container">
        <h2 className="heading-secondary slide-up">Our promise</h2>
        <div className={`slide-up ${styles.aboutTestimonialsContainer}`}>
          <div className={styles.aboutTestimonialsGrid}>
            <article className={styles.aboutTestimonialCard}>
              <p className={styles.aboutTestimonialText}>
                “Consistency matters. We blend and test each batch so you feel
                the same reliable relief every time.”
              </p>
              <p className={styles.aboutTestimonialName}>- The NAMO Team</p>
            </article>
            <article className={styles.aboutTestimonialCard}>
              <p className={styles.aboutTestimonialText}>
                “We’re obsessed with clear communication—what’s inside, how to
                use it, and how we support you.”
              </p>
              <p className={styles.aboutTestimonialName}>- Customer Care</p>
            </article>
            <article className={styles.aboutTestimonialCard}>
              <p className={styles.aboutTestimonialText}>
                “Natural shouldn’t mean uncertain. We partner with trusted
                suppliers and test for purity and potency.”
              </p>
              <p className={styles.aboutTestimonialName}>- Product Quality</p>
            </article>
            <article className={styles.aboutTestimonialCard}>
              <p className={styles.aboutTestimonialText}>
                “Every jar ships with guidance from our team—how to use it, what
                to expect, and how to reach us anytime.”
              </p>
              <p className={styles.aboutTestimonialName}>- Customer Success</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  </>
);

export default About;
