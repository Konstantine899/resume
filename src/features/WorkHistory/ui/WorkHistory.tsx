// ============================================
// WorkHistory Feature
// ============================================

import { Job, JOBS, sortJobsByDate } from '@/entities/Job';
import { useLanguage } from '@/shared/lib/contexts/LanguageContext';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Card } from '@/shared/ui/Card';
import React from 'react';
import styles from '../styles/WorkHistory.module.scss';
import type { WorkHistoryProps } from '../types';
/**
 * WorkHistory Feature Component
 *
 * Displays work experience timeline.
 * Follows FSD architecture - features layer for user scenarios.
 */
export const WorkHistory: React.FC<WorkHistoryProps> = ({
  className = '',
  'data-testid': testId = 'work-history'
}) => {
  const { t, language  } = useLanguage();

  const jobs = sortJobsByDate(JOBS);

   const getDescription = (job: Job): string[] => {
    const lang = language === 'ru' ? 'ru' : 'en';
    return job.description[lang] || job.description.en || [];
  };

  return (
    <section
      id="experience"
      className={`${styles.workHistory} ${className}`}
      data-testid={testId}
    >
      <AnimatedSection animation="fadeUp">
        <h2 className={styles.sectionTitle}>{t.workHistory}</h2>
      </AnimatedSection>

      <div className={styles.timeline}>
        {jobs.map((job: Job, index) => (
          <AnimatedSection key={job.id} animation="fadeUp" delay={index * 100}>
            <Card className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <h3 className={styles.jobPosition}>{job.position}</h3>
                <span className={styles.jobCompany}>{job.company}</span>
              </div>
              <div className={styles.jobPeriod}>
                {job.period} {/* ✅ Используем готовый период из сущности */}
                {job.current && <span className={styles.currentBadge}> {t.present}</span>}
              </div>
               <div className={styles.jobLocation}>
                📍 {job.location}
              </div>

             <ul className={styles.jobDescription}>
                {getDescription(job).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              {/* ✅ Технологии */}
              <div className={styles.technologies}>
                {job.technologies.map((tech) => (
                  <span key={tech} className={styles.techTag}>{tech}</span>
                ))}
              </div>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
};

WorkHistory.displayName = 'WorkHistory';

export default WorkHistory;
