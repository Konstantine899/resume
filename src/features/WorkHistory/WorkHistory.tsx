'use client';

import { Job, JOBS, sortJobsByDate } from '@/entities/Job';
import { useLanguage } from '@/features/LanguageSwitch';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import React from 'react';
import styles from './WorkHistory.module.scss';
import type { WorkHistoryProps } from './types';

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
              <article className={styles.jobCard}>
                {/* Header: Position + Company */}
                <div className={styles.jobHeader}>
                  <h3 className={styles.jobPosition}>{job.position}</h3>
                  <span className={styles.jobCompany}>{job.company}</span>
                </div>

                {/* Period with current badge */}
                <div className={styles.jobPeriod}>
                  <time dateTime={job.startDate.toISOString()}>{job.period}</time>
                  {job.current && <span className={styles.currentBadge}>{t(`present`)}</span>}
                </div>

                {/* Location */}
                {job.location && (
                  <div className={styles.jobLocation}>
                    <span>📍</span>
                    <span>{job.location}</span>
                  </div>
                )}

                {/* Description list */}
                <ul className={styles.jobDescription}>
                  {getDescription(job).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>

                {/* Technologies */}
                {job.technologies.length > 0 && (
                  <div className={styles.technologies}>
                    {job.technologies.map((tech) => (
                      <span key={tech} className={styles.techTag}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

WorkHistory.displayName = 'WorkHistory';
export default WorkHistory;
