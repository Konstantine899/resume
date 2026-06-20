import React from 'react';
import type { TechIcon } from '../../model/types';
import styles from './ProjectCard.module.scss';

export interface ProjectCardProps {
  title?: string;
  description?: string;
  backgroundImage?: string;
  techIcons?: TechIcon[];
  link?: string | null;
  builtUsingLabel?: string;
  linkLabel?: string;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
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

ProjectCard.displayName = 'ProjectCard';
