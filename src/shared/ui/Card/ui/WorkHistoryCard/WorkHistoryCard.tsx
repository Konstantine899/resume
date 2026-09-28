// ============================================
// WorkHistoryCard Component
// ============================================

import { memo } from 'react';
import { classNames as cn } from '@/shared/lib/utils/classNames';
import { Badge } from '@/shared/ui/Badge';
// Direct imports (not the Card barrel) to avoid a circular dependency:
// Card.tsx itself imports this file, and the barrel goes through Card.tsx.
import { CardBody } from '../CardBody';
import { CardHeader } from '../CardHeader';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Divider } from '@/shared/ui/Divider';
import { MapPin } from 'lucide-react';
import type { WorkHistoryCardProps } from '../../model/types';
import styles from './WorkHistoryCard.module.scss';
import cardStyles from '../Card.module.scss';

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
  className = '',
}) => {
  return (
    <div className={cn(cardStyles.card, cardStyles.workHistory, className)}>
      <CardHeader className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleGroup}>
            {/* no size prop — .title owns the typography scale (sm→2xl) */}
            <Heading level={3} theme="primary" className={styles.title}>
              {title}
            </Heading>
            {company && (
              <Paragraph as="span" weight="semibold" className={styles.company}>
                {company}
              </Paragraph>
            )}
          </div>
          {(period || periodBadge) && (
            <div className={styles.periodGroup}>
              {period && (
                <Paragraph as="span" size="s" theme="muted" className={styles.period}>
                  {period}
                </Paragraph>
              )}
              {periodBadge && (
                <Badge variant="accent" size="sm">
                  {periodBadge}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardBody className={styles.body}>
        {location && (
          <div className={styles.location}>
            <Icon name={MapPin} size={14} color="foreground-muted" decorative />
            <Paragraph as="span" size="xs">
              {location}
            </Paragraph>
          </div>
        )}

        {achievements && achievements.length > 0 && (
          <ul className={styles.achievements}>
            {achievements.map((achievement, index) => (
              <li key={index}>
                <Paragraph as="span" size="xs">
                  {achievement}
                </Paragraph>
              </li>
            ))}
          </ul>
        )}

        {techStack && techStack.length > 0 && (
          <div className={styles.techStack}>
            <Divider className={styles.techDivider} />
            <div className={styles.techBadges}>
              {techStack.map((tech, index) => (
                <Badge key={index} variant="accent" size="sm">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </div>
  );
};

WorkHistoryCardComponent.displayName = 'WorkHistoryCard';

export const WorkHistoryCard = memo(WorkHistoryCardComponent);
WorkHistoryCard.displayName = 'WorkHistoryCard';
