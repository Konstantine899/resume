// ============================================
// MyWork Feature
// ============================================

import { PROJECTS, getFeaturedProjects } from '@/entities/Project';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { CardGrid, ProjectCard } from '@/shared/ui/Card';
import { Container } from '@/shared/ui/Container';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Section } from '@/shared/ui/Section';
import { FolderOpen } from 'lucide-react';
import React from 'react';
import type { MyWorkProps } from '../model/types';
import styles from './MyWork.module.scss';

export const MyWork: React.FC<MyWorkProps> = ({
  className = '',
  onProjectClick,
  'data-testid': testId = 'my-work',
}) => {
  const { t, language } = useLanguage();

  // Recruiter audit P1: only the featured projects surface here.
  const projects = getFeaturedProjects(PROJECTS);

  const handleProjectClick = (projectId: string) => {
    onProjectClick?.(projectId);
  };

  return (
    <Section size="xl" id="work" className={className} data-testid={testId}>
      <Container size="lg" padding="lg">
        <AnimatedSection animation="fadeUp">
          <Heading level={2} theme="gradient" align="center" className={styles.title}>
            {t('myWork')}
          </Heading>
        </AnimatedSection>

        <CardGrid columns={1} gap="md">
          {projects.map((project, index) => (
            <AnimatedSection key={project.id} animation="fadeUp" delay={index * 100}>
              <ProjectCard
                title={project.title}
                description={language === 'en' ? project.description.en : project.description.ru}
                backgroundImage={project.image}
                techIcons={project.techIcons}
                link={project.link}
                role={
                  project.role ? (language === 'en' ? project.role.en : project.role.ru) : undefined
                }
                metrics={project.metrics}
                year={project.year}
                builtUsingLabel={t('builtUsing')}
                linkLabel={t('link')}
                onClick={() => handleProjectClick(project.id)}
              />
            </AnimatedSection>
          ))}
        </CardGrid>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className={styles.emptyState}>
            <Icon name={FolderOpen} size={48} color="foreground-muted" decorative />
            <Paragraph theme="muted" align="center">
              No projects yet
            </Paragraph>
          </div>
        )}
      </Container>
    </Section>
  );
};

MyWork.displayName = 'MyWork';

export default MyWork;
