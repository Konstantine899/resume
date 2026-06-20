'use client';

import { Job, JOBS, sortJobsByDate } from '@/entities/Job';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { WorkHistoryCard } from '@/shared/ui/Card';
import React from 'react';
import type { WorkHistoryProps } from '../model/types';
import styles from './WorkHistory.module.scss';

/**
 * WorkHistory Feature Component
 *
 * Displays work experience timeline with gradient container.
 * Pixel-perfect match to original Tailwind design.
 * Follows FSD architecture - features layer.
 */
export const WorkHistory: React.FC<WorkHistoryProps> = ({
  className = '',
  'data-testid': testId = 'work-history',
}) => {
  const { t, language } = useLanguage();

  // Sort jobs by date (newest first)
  const jobs = sortJobsByDate(JOBS);

  // Get description based on current language
  const getDescription = (job: Job): string[] => {
    const lang = language === 'ru' ? 'ru' : 'en';
    return job.description[lang] || job.description.en || [];
  };

  return (
    <section
      id="experience"
      className={`${styles.workHistory} ${styles.sectionPadding} ${className}`}
      data-testid={testId}
    >
      <div className={styles.gradientContainer}>
        <AnimatedSection animation="fadeUp">
          <h2 className={styles.sectionTitle}>{t(`workHistory`)}</h2>
        </AnimatedSection>

        <div className={styles.timeline}>
          {jobs.map((job: Job, index) => (
            <AnimatedSection key={job.id} animation="fadeUp" delay={index * 150}>
              <WorkHistoryCard
                title={job.position}
                company={job.company}
                period={job.period}
                periodBadge={job.current ? t(`present`) : undefined}
                location={job.location}
                achievements={getDescription(job)}
                techStack={job.technologies}
              />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

WorkHistory.displayName = 'WorkHistory';
export default WorkHistory;
