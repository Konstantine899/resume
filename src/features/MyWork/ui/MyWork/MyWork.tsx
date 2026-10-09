// ============================================
// MyWork Feature
// ============================================

import { PROJECTS, resolveTechIcons } from '@/entities/Project';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Button } from '@/shared/ui/Button';
import { CardGrid, ProjectCard } from '@/shared/ui/Card';
import { Container } from '@/shared/ui/Container';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Pagination } from '@/shared/ui/Pagination';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Section } from '@/shared/ui/Section';
import { FolderOpen } from 'lucide-react';
import React, { useId, useState } from 'react';
import type { MyWorkProps } from '../../model/types/types';
import styles from './MyWork.module.scss';

// Owner decision (2026-10-08): fixed page sizes for the vitrina window
// (spec src/features/MyWork). The control lives in the consumer — one
// consumer means the kit seam is not justified yet.
// Owner revision (2026-10-09): sizes are 5 / 10 / 20 (50 replaced — the
// "filters by pages" selector lives above the grid, right-aligned).
const PAGE_SIZES = [5, 10, 20] as const;

export const MyWork: React.FC<MyWorkProps> = ({
  className = '',
  content,
  onProjectClick,
  'data-testid': testId = 'my-work',
}) => {
  const { t, language } = useLanguage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const sizeLabelId = useId();

  // Owner decision (2026-10-08): the vitrina surfaces ALL projects — the
  // featured flag no longer gates visibility (spec: src/features/MyWork).
  // Design C (Projects CRUD WU-3): HomePage feeds the store value through
  // the `content` prop; the seed fallback keeps bare renders store-free.
  const projects = content ?? PROJECTS;
  const totalPages = Math.ceil(projects.length / pageSize);
  // Container-owned clamp (Pagination pilot rule): a shrinking list derives
  // back into range during render — no setState-in-effect (react-hooks v7).
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const windowRows = projects.slice((safePage - 1) * pageSize, safePage * pageSize);
  // Owner directive (2026-10-09): the size group and the pagination must
  // never disappear on interaction — a size that fits everything on one page
  // would otherwise strand the user with no way back. Only an empty list
  // (empty state) hides them.
  const showControls = projects.length > 0;

  const handleProjectClick = (projectId: string) => {
    onProjectClick?.(projectId);
  };

  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  // Owner directive (2026-10-09): a page switch returns the viewport to the
  // section top — same behavior as clicking the Nav `#work` anchor. That
  // anchor is a native jump (html `scroll-behavior: smooth` +
  // `scroll-padding/scroll-margin` offsets, see HomePage.module.scss), so
  // `behavior` is intentionally omitted here: the default follows the CSS
  // and stays prefers-reduced-motion aware.
  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    document.getElementById('work')?.scrollIntoView({ block: 'start' });
  };

  return (
    <Section size="xl" id="work" className={className} data-testid={testId}>
      <Container size="lg" padding="lg">
        <AnimatedSection animation="fadeUp">
          <Heading level={2} theme="gradient" align="center" className={styles.title}>
            {t('myWork')}
          </Heading>
        </AnimatedSection>

        {/* Owner layout (2026-10-09): the size selector sits under the
            heading, right-aligned, above the cards — pagination stays
            centered at the bottom. Both appear only for multi-page lists. */}
        {showControls && (
          <div className={styles.sizeRow}>
            <div className={styles.sizeGroup} role="group" aria-labelledby={sizeLabelId}>
              {/* Visible caption (owner 2026-10-09): the aria-label alone left
                  sighted users with a bare «5 10 20» — label and accessible
                  name share this one i18n string via aria-labelledby. */}
              <span id={sizeLabelId} className={styles.sizeLabel}>
                {t('perPageLabel')}
              </span>
              {PAGE_SIZES.map((size) => (
                <Button
                  key={size}
                  variant="ghost"
                  size="sm"
                  aria-pressed={pageSize === size}
                  onClick={() => handlePageSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        )}

        <CardGrid columns={1} gap="md">
          {windowRows.map((project, index) => (
            <AnimatedSection key={project.id} animation="fadeUp" delay={index * 100}>
              <ProjectCard
                title={project.title}
                description={language === 'en' ? project.description.en : project.description.ru}
                backgroundImage={project.image}
                techIcons={resolveTechIcons(project.techIcons)}
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

        {/* Owner layout (2026-10-09): pagination centered at the bottom. */}
        {showControls && (
          <div className={styles.paginationRow}>
            <Pagination page={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}

        {/* Empty State (i18n — R-7: no hardcoded copy) */}
        {projects.length === 0 && (
          <div className={styles.emptyState}>
            <Icon name={FolderOpen} size={48} color="foreground-muted" decorative />
            <Paragraph theme="muted" align="center">
              {t('noProjectsYet')}
            </Paragraph>
          </div>
        )}
      </Container>
    </Section>
  );
};

MyWork.displayName = 'MyWork';

export default MyWork;
