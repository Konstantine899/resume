// ============================================
// ProjectCard Component
// ============================================

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
  builtUsingLabel = 'Создано с помощью',
  linkLabel = 'Ссылка',
  className = '',
}) => {
  return (
    <div className={`${styles.projectCard} ${className}`}>
      {backgroundImage && (
        <div
          className={styles.backgroundImage}
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
      )}

      <div className={styles.gradientOverlay} />

      <div className={styles.content}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {description && <p className={styles.description}>{description}</p>}
        {techIcons && techIcons.length > 0 && (
          <div className={styles.techSection}>
            <span className={styles.techLabel}>{builtUsingLabel}</span>
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
            <span className={styles.linkLabel}>{linkLabel}</span>
            <a href={link} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {link.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

ProjectCardComponent.displayName = 'ProjectCard';

export const ProjectCard = memo(ProjectCardComponent);
ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;
