'use client';

import { Job, JOBS, sortJobsByDate } from '@/entities/Job';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { WorkHistoryCard } from '@/shared/ui/Card';
import { Container } from '@/shared/ui/Container';
import { Heading } from '@/shared/ui/Heading';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Section } from '@/shared/ui/Section';
import React, { memo } from 'react';
import type { WorkHistoryProps } from '../../model/types/types';
import styles from './WorkHistory.module.scss';

/**
 * WorkHistory Feature Component
 *
 * Displays work experience timeline with gradient container.
 * Pixel-perfect match to original Tailwind design.
 * Follows FSD architecture - features layer.
 *
 * WorkHistory CRUD WU-4 (Design C): store-free — HomePage feeds the sorted
 * store value through `content`; bare renders fall back to the seed via
 * nullish `??` (an explicit [] reaches the empty state, never the seed).
 */
const WorkHistoryInner: React.FC<WorkHistoryProps> = ({
  className = '',
  content,
  'data-testid': testId = 'work-history',
}) => {
  const { t, language } = useLanguage();

  // WU-4: content ?? seed — nullish, never length-based (resume-shared-key-splitbrain).
  const jobs = content ?? sortJobsByDate(JOBS);

  // Get description based on current language
  const getDescription = (job: Job): string[] => {
    const lang = language === 'ru' ? 'ru' : 'en';
    return job.description[lang] || job.description.en || [];
  };

  // Position title is localized on the entity — no render-time translation.
  const getPosition = (job: Job): string =>
    (language === 'ru' ? job.position.ru : job.position.en) || job.position.en;

  return (
    <Section
      size="lg"
      id="experience"
      className={classNames(styles.workHistory, className)}
      data-testid={testId}
    >
      <Container size="lg" padding="lg" className={styles.gradientContainer}>
        <AnimatedSection animation="fadeUp">
          <Heading level={2} size="4xl" theme="inverted" align="center">
            {t(`workHistory`)}
          </Heading>
        </AnimatedSection>

        <div className={styles.timeline}>
          {/* Empty state (WU-4, i18n R-7: no hardcoded copy) */}
          {jobs.length === 0 ? (
            <Paragraph theme="muted" align="center">
              {t('workHistoryEmpty')}
            </Paragraph>
          ) : (
            jobs.map((job: Job, index: number) => (
              <AnimatedSection key={job.id} animation="fadeUp" delay={index * 150}>
                <WorkHistoryCard
                  title={getPosition(job)}
                  company={job.company}
                  companyUrl={job.companyUrl}
                  period={job.period}
                  periodBadge={job.current ? t(`present`) : undefined}
                  location={job.location}
                  achievements={getDescription(job)}
                  techStack={job.technologies}
                />
              </AnimatedSection>
            ))
          )}
        </div>
      </Container>
    </Section>
  );
};

// WorkHistory CRUD WU-4: memoized at the section level (plan §9) so parent
// re-renders with an unchanged jobs list skip the whole timeline.
export const WorkHistory = memo(WorkHistoryInner);

WorkHistory.displayName = 'WorkHistory';
export default WorkHistory;
