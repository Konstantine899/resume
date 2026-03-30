// ============================================
// WorkHistory Feature
// ============================================

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
  const { t } = useLanguage();

  // Mock data - will be replaced with actual Job entity
  const jobs = [
    {
      id: '1',
      company: 'Freelance',
      position: 'Full Stack Developer',
      startDate: '2020',
      endDate: t.present,
      description: 'Developing web applications for various clients using modern technologies.'
    },
    {
      id: '2',
      company: 'Startup Company',
      position: 'Frontend Developer',
      startDate: '2019',
      endDate: '2020',
      description: 'Built responsive user interfaces and collaborated with design team.'
    }
  ];

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
        {jobs.map((job, index) => (
          <AnimatedSection key={job.id} animation="fadeUp" delay={index * 100}>
            <Card className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <h3 className={styles.jobPosition}>{job.position}</h3>
                <span className={styles.jobCompany}>{job.company}</span>
              </div>
              <div className={styles.jobPeriod}>
                {job.startDate} - {job.endDate}
              </div>
              <p className={styles.jobDescription}>
                {job.description}
              </p>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
};

WorkHistory.displayName = 'WorkHistory';

export default WorkHistory;
