import { useLanguage, useTheme } from '@/shared/lib/contexts';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import styles from './About.module.scss';

export function About() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <section id="about" className={styles.container}>
      <AnimatedSection animation="fadeUp">
        <h2 className={styles.sectionTitle}>{t.aboutTitle}</h2>
      </AnimatedSection>

      <AnimatedSection delay={200}>
        <div className={styles.content}>
          {/* Avatar */}
          <div className={styles.avatarContainer}>
            <div className={styles.avatarWrapper}>
              <div
                className={`${styles.avatarInner} ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                M
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className={styles.title}>{t.whoAmI}</h3>

          {/* Description */}
          <p className={styles.description}>{t.aboutDescription}</p>

          {/* CTA Button */}
          <a href="#contact" className={styles.ctaButton}>
            {t.getInTouch}
          </a>
        </div>
      </AnimatedSection>
    </section>
  );
}
