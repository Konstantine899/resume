// ============================================
// MyWork Feature
// ============================================

import { PROJECTS } from '@/entities/Project';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Paragraph } from '@/shared/ui/Paragraph';
import { ProjectCard } from '@/shared/ui/Card';
import React from 'react';
import type { MyWorkProps } from '../model/types';
import styles from './MyWork.module.scss';

export const MyWork: React.FC<MyWorkProps> = ({
  className = '',
  onProjectClick,
  'data-testid': testId = 'my-work',
}) => {
  const { t, language } = useLanguage();

  const handleProjectClick = (projectId: string) => {
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
            <div onClick={() => handleProjectClick(project.id)}>
              <ProjectCard
                title={project.title}
                description={language === 'en' ? project.description.en : project.description.ru}
                backgroundImage={project.image}
                techIcons={project.techIcons}
                link={project.link}
                builtUsingLabel={t(`builtUsing`)}
                linkLabel={t(`link`)}
              />
            </div>
          </AnimatedSection>
        ))}
      </div>

      {/* Empty State */}
      {PROJECTS.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.icon}>📁</div>
          <Paragraph theme="muted" align="center">
            No projects yet
          </Paragraph>
        </div>
      )}
    </section>
  );
};

MyWork.displayName = 'MyWork';

export default MyWork;
