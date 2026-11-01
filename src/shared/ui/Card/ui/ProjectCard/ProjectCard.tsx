// ============================================
// ProjectCard Component
// ============================================

import { classNames } from '@/shared/lib/utils/classNames';
import { mediaUrl } from '@/shared/lib/media';
import { Link } from '@/shared/ui/Link';
import { Paragraph } from '@/shared/ui/Paragraph';
import { useLanguage } from '@/shared/lib/i18n';
import { memo } from 'react';
import type { ProjectCardProps } from '../../model/types';
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
  builtUsingLabel,
  linkLabel,
  role,
  metrics,
  year,
  className = '',
  onClick,
}) => {
  const { t } = useLanguage();
  const builtUsingDisplay = builtUsingLabel ?? t('builtUsing');
  const linkDisplay = linkLabel ?? t('link');
  return (
    <div
      className={classNames(styles.projectCard, className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {backgroundImage && (
        <div
          className={styles.backgroundImage}
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
      )}

      <div className={styles.gradientOverlay} />

      <div className={styles.content}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {(role || year !== undefined) && (
          <p className={styles.meta}>
            {role && <span className={styles.role}>{role}</span>}
            {role && year !== undefined && (
              <span className={styles.metaDivider} aria-hidden="true">
                ·
              </span>
            )}
            {year !== undefined && <span className={styles.year}>{year}</span>}
          </p>
        )}
        {description && (
          <Paragraph lineClamp={3} theme="muted">
            {description}
          </Paragraph>
        )}
        {metrics && metrics.length > 0 && (
          <div className={styles.metrics}>
            {metrics.map((metric) => (
              <span key={metric} className={styles.metric}>
                {metric}
              </span>
            ))}
          </div>
        )}
        {techIcons && techIcons.length > 0 && (
          <div className={styles.techSection}>
            <Paragraph as="span" size="xs" theme="muted">
              {builtUsingDisplay}
            </Paragraph>
            <div className={styles.techIcons}>
              {techIcons.map((tech) => (
                <img
                  key={tech.url}
                  src={mediaUrl(tech.url)}
                  alt={tech.name || (tech.url.split('/').pop() ?? tech.url)}
                  className={classNames(
                    styles.techIcon,
                    tech.invertInDark ? styles.techIconInvert : undefined
                  )}
                  title={tech.name}
                />
              ))}
            </div>
          </div>
        )}
        {link && (
          <div className={styles.linkSection}>
            <Paragraph as="span" size="xs" theme="muted">
              {linkDisplay}
            </Paragraph>
            <Link
              href={link}
              variant="ghost"
              size="sm"
              external
              showExternalIcon={false}
              className={styles.link}
            >
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
