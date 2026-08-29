// ============================================
// WorkHistoryCard Component
// ============================================

import { memo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Paragraph } from '@/shared/ui/Paragraph';
import { CardTitle } from '../CardTitle';
import type { WorkHistoryCardProps } from '../../model/types';
import styles from './WorkHistoryCard.module.scss';

/**
 * WorkHistoryCard Component — карточка истории работы для резюме
 *
 * @example
 * // Basic usage
 * ```tsx
 * <WorkHistoryCard
 *   title="Senior Full-Stack Developer"
 *   company="Tech Corp International"
 *   period="2022 — Present"
 *   periodBadge="Настоящее время"
 *   location="Remote"
 *   achievements={['Led team of 5 developers']}
 *   techStack={['React', 'Node.js', 'AWS']}
 * />
 * ```
 *
 * @example
 * // Minimal usage
 * ```tsx
 * <WorkHistoryCard title="Developer" company="Company Name" />
 * ```
 */
const WorkHistoryCardComponent: React.FC<WorkHistoryCardProps> = ({
  title,
  company,
  period,
  periodBadge,
  location,
  achievements,
  techStack,
  titleLevel,
  className = '',
  fullWidth,
  style,
}) => {
  return (
    <div
      className={classNames(styles.workHistoryCard, fullWidth && styles.fullWidth, className)}
      style={style}
    >
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <CardTitle as={titleLevel} className={styles.title}>
            {title}
          </CardTitle>
          {company && (
            <Paragraph as="span" weight="semibold">
              {company}
            </Paragraph>
          )}
        </div>
        {period && (
          <div className={styles.periodSection}>
            <Paragraph as="span" size="s" theme="muted">
              {period}
            </Paragraph>
            {periodBadge && <span className={styles.periodBadge}>{periodBadge}</span>}
          </div>
        )}
      </div>
      {location && (
        <div className={styles.location}>
          <span className={styles.locationIcon} aria-hidden="true">
            📍
          </span>
          <span>{location}</span>
        </div>
      )}
      {achievements && achievements.length > 0 && (
        <ul className={styles.achievements}>
          {achievements.map((achievement) => (
            <li key={achievement}>{achievement}</li>
          ))}
        </ul>
      )}
      {techStack && techStack.length > 0 && (
        <div className={styles.techStack}>
          {techStack.map((tech) => (
            <span key={tech} className={styles.techBadge}>
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

WorkHistoryCardComponent.displayName = 'WorkHistoryCard';

export const WorkHistoryCard = memo(WorkHistoryCardComponent);
WorkHistoryCard.displayName = 'WorkHistoryCard';
