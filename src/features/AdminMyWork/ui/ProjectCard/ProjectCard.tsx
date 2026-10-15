// ============================================
// ProjectCard — one collapsible project record + detail table (mywork-detail-table WU-1)
// ============================================
//
// SPEC R-1..R-4 (variant A′, owner verdict 2026-10-14): every project
// renders as a kit Card — COLLAPSED by default (Jobs #225 / Skills rev.4
// parity). Collapsed: the title caption sits OUTSIDE the Card and the
// whole Card body is the strip expand button (Plus, `aria-expanded="true"`
// — intentional Skills quirk). Expanded: header (Minus collapse + h3 +
// status/featured Badges + Pencil/Trash2 actions) and, under the stable
// `contentId`, the kit Table `[Данные | Значение | Действия]` with every
// record field. The action cells stay EMPTY (SPEC R-1): there is no
// inline CRUD on projects — a row is read-only data.
//
// Honest data (SPEC R-4): optional rows (link, year, role, techIcons,
// metrics, image, description) only exist when the value is present;
// featured renders its Badge row only when true. Empty locale lines of
// description/role are skipped. Description/role labels ride the row,
// both locale lines render as `EN: …` / `RU: …` (A3 — the admin edits
// both, neither is hidden).
//
// Invariants:
// - READ-ONLY: no redux, no toast, no dispatch — persist-THEN-dispatch
//   (R-3) lives in MyWorkEditorList's confirm handler.
// - Collapse state is INTERNAL (no persistence), one card = one record.
// - ALL copy is i18n (i18n-first).
// - ARA roundtrip: aria-controls ONLY on the collapse button (the
//   content div is unmounted when collapsed — dangling idref fails axe).

import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { BadgeVariant } from '@/shared/ui/Badge';
import { Badge } from '@/shared/ui/Badge';
import { IconButton } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Link } from '@/shared/ui/Link';
import { Table } from '@/shared/ui/Table';
import { Tooltip } from '@/shared/ui/Tooltip';
import type { Column } from '@/shared/ui/Table';
import type { Project, ProjectStatus } from '@/entities/Project';
import styles from './ProjectCard.module.scss';

/** Status → Badge variant (visual parity with the vitrina badges). */
const STATUS_VARIANTS: Record<ProjectStatus, BadgeVariant> = {
  completed: 'success',
  'in-progress': 'warning',
  maintenance: 'outline',
  archived: 'default',
};

/** One scalar record field: label (i18n key) → display value. */
type FieldRow = {
  key: string;
  label: string;
  value: ReactNode;
};

export interface ProjectCardProps {
  project: Project;
  /** Opens the EXISTING full ProjectForm modal (page-owned, unchanged). */
  onEdit?: (project: Project) => void;
  /** Opens the shared confirm modal (subtitle `{{name}}`, cancel-focused). */
  onDelete?: (id: string) => void;
  className?: string;
  /** Root test id — MyWorkEditorList passes `project-card-${project.id}`. */
  testId?: string;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  className,
  testId,
}: ProjectCardProps): React.JSX.Element {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const contentId = `project-content-${project.id}`;
  const expandLabel = t('adminMyWorkExpand', { title: project.title });
  const collapseLabel = t('adminMyWorkCollapse', { title: project.title });

  // Honest data (SPEC R-4): optional rows only when present. Both
  // description locales render (A3); empty strings are skipped.
  const rows: FieldRow[] = [
    {
      key: 'title',
      label: t('projectFieldTitle'),
      value: project.title,
    },
    {
      key: 'category',
      label: t('projectFieldCategory'),
      value: project.category,
    },
    {
      key: 'status',
      label: t('projectFieldStatus'),
      value: project.status,
    },
  ];
  if (project.featured) {
    rows.push({
      key: 'featured',
      label: t('projectFieldFeatured'),
      value: (
        <Badge variant="accent" size="sm">
          {t('projectFieldFeatured')}
        </Badge>
      ),
    });
  }
  if (project.year !== undefined) {
    rows.push({
      key: 'year',
      label: t('projectFieldYear'),
      value: String(project.year),
    });
  }
  if (project.link) {
    rows.push({
      key: 'link',
      label: t('projectFieldLink'),
      value: (
        <Link href={project.link} external>
          {project.link}
        </Link>
      ),
    });
  }
  if (project.description.en !== '' || project.description.ru !== '') {
    rows.push({
      key: 'description',
      label: t('projectFieldDescription'),
      value: (
        <>
          {project.description.en !== '' && <div>EN: {project.description.en}</div>}
          {project.description.ru !== '' && <div>RU: {project.description.ru}</div>}
        </>
      ),
    });
  }
  if (project.role && (project.role.en !== '' || project.role.ru !== '')) {
    rows.push({
      key: 'role',
      label: t('projectFieldRole'),
      value: (
        <>
          {project.role.en !== '' && <div>EN: {project.role.en}</div>}
          {project.role.ru !== '' && <div>RU: {project.role.ru}</div>}
        </>
      ),
    });
  }
  if (project.techIcons.length > 0) {
    rows.push({
      key: 'techIcons',
      label: t('projectFieldTechIcons'),
      value: project.techIcons.join(', '),
    });
  }
  // One row per metric, label rides the FIRST row only (JobCard
  // description-label parity).
  project.metrics?.forEach((metric, index) => {
    rows.push({
      key: `metric-${index}`,
      label: index === 0 ? t('projectFieldMetrics') : '',
      value: metric,
    });
  });
  if (project.image !== '') {
    rows.push({
      key: 'image',
      label: t('projectFieldImage'),
      value: project.image,
    });
  }

  const columns: Column<FieldRow>[] = [
    {
      key: 'field',
      header: t('adminMyWorkTableField'),
      render: (row) => row.label,
    },
    {
      key: 'value',
      header: t('adminMyWorkTableValue'),
      render: (row) => row.value,
    },
    {
      key: 'actions',
      header: t('adminMyWorkTableActions'),
      // Read-only rows: the actions column stays (SPEC R-1 parity shell)
      // with empty cells — per-field CRUD is consciously NOT ported.
      render: () => null,
    },
  ];

  return (
    <div className={classNames(styles.root, className)} data-testid={testId}>
      {isCollapsed && (
        <div className={styles.caption} data-testid={`project-card-caption-${project.id}`}>
          <span className={styles.captionTitle}>{project.title}</span>
          {/* R-A1 (issue #242): every row carries edit/delete — the
              collapsed caption mirrors the expanded header actions. */}
          <span className={styles.actions} data-testid={`project-card-actions-${project.id}`}>
            <Tooltip content={t('projectEdit')} position="top" showDelay={0}>
              <IconButton
                type="button"
                variant="outline"
                size="sm"
                icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
                ariaLabel={t('projectEdit')}
                onClick={() => onEdit?.(project)}
              />
            </Tooltip>
            <Tooltip content={t('projectDelete')} position="top" showDelay={0}>
              <IconButton
                type="button"
                variant="danger"
                size="sm"
                icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
                ariaLabel={t('projectDelete')}
                onClick={() => onDelete?.(project.id)}
              />
            </Tooltip>
          </span>
        </div>
      )}
      <Card
        variant="default"
        size="default"
        hoverable={false}
        className={styles.block}
        data-testid={`project-card-${project.id}`}
      >
        {isCollapsed ? (
          <Tooltip content={expandLabel} position="top" showDelay={0}>
            <IconButton
              type="button"
              variant="outline"
              size="md"
              fullWidth
              className={styles.strip}
              icon={<Icon name={Plus} size={20} color="inherit" decorative />}
              ariaLabel={expandLabel}
              aria-expanded="true"
              onClick={() => setIsCollapsed(false)}
            />
          </Tooltip>
        ) : (
          <>
            <div className={styles.blockHeader}>
              <div className={styles.headerMain}>
                <Tooltip content={collapseLabel} position="top" showDelay={0}>
                  <IconButton
                    type="button"
                    variant="outline"
                    size="md"
                    icon={<Icon name={Minus} size={20} color="inherit" decorative />}
                    ariaLabel={collapseLabel}
                    aria-expanded="false"
                    aria-controls={contentId}
                    onClick={() => setIsCollapsed(true)}
                  />
                </Tooltip>
                <Heading level={3}>
                  {project.title}
                  <Badge variant={STATUS_VARIANTS[project.status]} size="sm">
                    {project.status}
                  </Badge>
                  {project.featured && (
                    <Badge variant="accent" size="sm">
                      {t('projectFieldFeatured')}
                    </Badge>
                  )}
                </Heading>
              </div>
              <div className={styles.actions} data-testid={`project-card-actions-${project.id}`}>
                <Tooltip content={t('projectEdit')} position="top" showDelay={0}>
                  <IconButton
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
                    ariaLabel={t('projectEdit')}
                    onClick={() => onEdit?.(project)}
                  />
                </Tooltip>
                <Tooltip content={t('projectDelete')} position="top" showDelay={0}>
                  <IconButton
                    type="button"
                    variant="danger"
                    size="sm"
                    icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
                    ariaLabel={t('projectDelete')}
                    onClick={() => onDelete?.(project.id)}
                  />
                </Tooltip>
              </div>
            </div>
            <div className={styles.blockContent} id={contentId}>
              <Table
                caption={t('adminMyWorkTitle')}
                columns={columns}
                rows={rows}
                getKey={(row) => row.key}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
