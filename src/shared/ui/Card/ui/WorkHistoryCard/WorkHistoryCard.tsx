import React from 'react';
import styles from './WorkHistoryCard.module.scss';

export interface WorkHistoryCardProps {
  title?: string;
  company?: string;
  period?: string;
  periodBadge?: string;
  location?: string;
  achievements?: string[];
  techStack?: string[];
  className?: string;
}

export const WorkHistoryCard: React.FC<WorkHistoryCardProps> = ({
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
    <div className={`${styles.workHistoryCard} ${className}`}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          {company && <span className={styles.company}>{company}</span>}
        </div>
        {period && (
          <div className={styles.periodSection}>
            <span className={styles.period}>{period}</span>
            {periodBadge && <span className={styles.periodBadge}>{periodBadge}</span>}
          </div>
        )}
      </div>
      {location && (
        <div className={styles.location}>
          <span className={styles.locationIcon}>📍</span>
          <span>{location}</span>
        </div>
      )}
      {achievements && achievements.length > 0 && (
        <ul className={styles.achievements}>
          {achievements.map((achievement, index) => (
            <li key={index}>{achievement}</li>
          ))}
        </ul>
      )}
      {techStack && techStack.length > 0 && (
        <div className={styles.techStack}>
          {techStack.map((tech, index) => (
            <span key={index} className={styles.techBadge}>
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

WorkHistoryCard.displayName = 'WorkHistoryCard';
