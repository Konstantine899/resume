// ============================================
// About Feature
// ============================================

import { useLanguage } from '@/shared/lib/contexts';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Card } from '@/shared/ui/Card';
import React from 'react';
import styles from './About.module.scss';
import type { AboutProps } from './types';

/**
 * About Feature Component
 *
 * Displays personal information and bio.
 * Follows FSD architecture - features layer for user scenarios.
 */
export const About: React.FC<AboutProps> = ({
  className = '',
  'data-testid': testId = 'about',
}) => {
  const { t } = useLanguage();

  return (
    <section id="about" className={`${styles.about} ${className}`} data-testid={testId}>
      <AnimatedSection animation="fadeUp">
        <h2 className={styles.sectionTitle}>{t.about}</h2>
      </AnimatedSection>

      <AnimatedSection animation="fadeUp" delay={100}>
        <Card className={styles.aboutCard}>
          <div className={styles.aboutContent}>
            <p className={styles.aboutDescription}>{t.aboutDescription}</p>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>6+</span>
                <span className={styles.statLabel}>Years Experience</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>50+</span>
                <span className={styles.statLabel}>Projects Completed</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>20+</span>
                <span className={styles.statLabel}>Happy Clients</span>
              </div>
            </div>
          </div>
        </Card>
      </AnimatedSection>
    </section>
  );
};

About.displayName = 'About';

export default About;
