// ============================================
// MyWork Feature
// ============================================

import { PROJECTS } from '@/entities/Project';
import { useTheme } from '@/features/ThemeSwitch/hooks/useTheme';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Card } from '@/shared/ui/Card';
import React from 'react';
import styles from './MyWork.module.scss';
import type { MyWorkProps } from './types';

export const MyWork: React.FC<MyWorkProps> = ({
  className = '',
  onProjectClick,
  'data-testid': testId = 'my-work',
}) => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();

  const handleProjectClick = (projectId: string) => {
    console.log(projectId);
    onProjectClick?.(projectId);
  };

  return (
    <section id="work" className={`${styles.section} ${className}`} data-testid={testId}>
      <AnimatedSection animation="fadeUp">
        <h2 className={styles.title}>{t(`myWork`)}</h2>
      </AnimatedSection>

      <div className={styles.projectsGrid}>
        {PROJECTS.map((project, index) => (
          <AnimatedSection key={project.id} animation="fadeUp" delay={index * 100}>
            <Card variant="project" size="default" backgroundImage={project.image}>
              <div
                className={styles.backgroundImage}
                style={{
                  backgroundImage: `url('${project.image}')`,
                }}
                onClick={() => handleProjectClick}
              />

              <div className={styles.gradientOverlay} />

              <div className={styles.content}>
                <h3 className={styles.projectTitle}>{project.title}</h3>

                <p className={styles.projectDescription}>
                  {language == 'en' ? project.description.en : project.description.ru}
                </p>

                {/* Tech Icons Row */}
                <div className={styles.techRow}>
                  <span className={styles.techLabel}>{t(`builtUsing`)}</span>
                  {project.techIcons.map((tech, techIndex) => (
                    <img
                      key={techIndex}
                      src={tech.url}
                      alt={tech.name || 'Technology'}
                      className={`${styles.techIcon} ${tech.invertInDark && theme === 'dark' ? styles.invert : ''}`}
                    />
                  ))}
                </div>

                {/* Project Link */}
                {project.link && (
                  <div className={styles.projectLink}>
                    <span className={styles.linkLabel}>{t(`link`)}</span>
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

      {/* Empty State */}
      {PROJECTS.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.icon}>📁</div>
          <p>No projects yet</p>
        </div>
      )}
    </section>
  );
};

MyWork.displayName = 'MyWork';

export default MyWork;
