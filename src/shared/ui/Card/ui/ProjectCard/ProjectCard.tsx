// ============================================
// ProjectCard Component
// ============================================

import { memo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Link } from '@/shared/ui/Link';
import type { ProjectCardProps } from '../../model/types';
import { sanitizeBackgroundImage } from '../../lib/utils/sanitizeBackgroundImage';
import styles from './ProjectCard.module.scss';

/**
 * ProjectCard Component — карточка проекта для портфолио
 *
 * @example
 * // Basic usage
 * ```tsx
 * <ProjectCard
 *   title="Dragonfly"
 *   description="Вертикально интегрированная каннабис-компания"
 *   backgroundImage="/dragonfly.jpg"
 *   techIcons={[{ name: 'React', url: '/react.svg' }]}
 *   link="https://dragonflyprocessing.com"
 * />
 * ```
 *
 * @example
 * // Minimal usage
 * ```tsx
 * <ProjectCard title="Project Name" description="Brief description" />
 * ```
 */
const ProjectCardComponent: React.FC<ProjectCardProps> = ({
  title,
  description,
  backgroundImage,
  techIcons,
  link,
  builtUsingLabel = 'Создано с помощью',
  linkLabel = 'Ссылка',
  className = '',
}) => {
  // CARD-P0-5: sanitize the backgroundImage; skip the layer on rejection (no throw).
  const safeBackground = sanitizeBackgroundImage(backgroundImage);

  return (
    <div className={classNames(styles.projectCard, className)}>
      {safeBackground && (
        <div className={styles.backgroundImage} style={{ backgroundImage: safeBackground }} />
      )}

      <div className={styles.gradientOverlay} />

      <div className={styles.content}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {description && (
          <Paragraph lineClamp={3} theme="muted">
            {description}
          </Paragraph>
        )}
        {techIcons && techIcons.length > 0 && (
          <div className={styles.techSection}>
            <Paragraph as="span" size="xs" theme="muted">
              {builtUsingLabel}
            </Paragraph>
            <div className={styles.techIcons}>
              {techIcons.map((tech, index) => (
                <img
                  key={index}
                  src={tech.url}
                  alt={tech.name || 'Tech icon'}
                  className={styles.techIcon}
                />
              ))}
            </div>
          </div>
        )}
        {link && (
          <div className={styles.linkSection}>
            <Paragraph as="span" size="xs" theme="muted">
              {linkLabel}
            </Paragraph>
            <Link href={link} external showExternalIcon={false} unstyled className={styles.link}>
              {link.replace(/^https?:\/\//, '')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

ProjectCardComponent.displayName = 'ProjectCard';

export const ProjectCard = memo(ProjectCardComponent);
ProjectCard.displayName = 'ProjectCard';
