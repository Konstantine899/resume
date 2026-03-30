// ============================================
// MyWork Feature
// ============================================

import { projects } from '@/entities/Project';
import { useTheme } from '@/features/ThemeSwitch/hooks/useTheme';
import { useLanguage } from '@/shared/lib/contexts/LanguageContext';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Card } from '@/shared/ui/Card';
import React from 'react';
import styles from '../styles/MyWork.module.scss';
import type { MyWorkProps } from '../types';

/**
 * MyWork Feature Component
 *
 * Displays portfolio projects with filtering and animations.
 * Follows FSD architecture - features layer for user scenarios.
 */
export const MyWork: React.FC<MyWorkProps> = ({
  className = '',
  onProjectClick,
  'data-testid': testId = 'my-work'
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const handleProjectClick = (projectId: string) => {
    onProjectClick?.(projectId);
  };

  return (
    <section
      id="work"
      className={`${styles.myWork} ${className}`}
      data-testid={testId}
    >
      <AnimatedSection animation="fadeUp">
        <h2 className={styles.sectionTitle}>{t.myWork}</h2>
      </AnimatedSection>

      <div className={styles.projectsGrid}>
        {projects.map((project, index) => (
          <AnimatedSection key={project.id} animation="fadeUp" delay={index * 100}>
            <Card
              className={styles.projectCard}
              onClick={() => handleProjectClick(project.id)}
              hoverable
            >
              <div className={styles.projectContent}>
                <h3 className={styles.projectTitle}>
                  {project.title}
                </h3>
                <p className={styles.projectDescription}>
                  {project.description[t.language as 'en' | 'ru']}
                </p>

                {/* Tech icons */}
                <div className={styles.techStack}>
                  <span className={styles.techLabel}>{t.builtUsing}</span>
                  <div className={styles.techIcons}>
                    {project.techIcons.map((tech, techIndex) => (
                      <img
                        key={techIndex}
                        src={tech.url}
                        alt={tech.name}
                        className={`${styles.techIcon} ${tech.invertInDark && theme === "dark" ? styles.inverted : ''}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Link */}
                {project.link && (
                  <div className={styles.projectLink}>
                    <span className={styles.linkLabel}>{t.link}</span>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkUrl}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {project.link.replace('https://', '').replace('www.', '')}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
};

MyWork.displayName = 'MyWork';

export default MyWork;
