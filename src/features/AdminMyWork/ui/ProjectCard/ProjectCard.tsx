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
// `contentId`, the kit Table `[Данные | Значение | Действия]`.
//
// Rev.3 (mywork-field-actions, SPEC R-B1..R-B4): the actions column is
// NOT empty anymore — every row carries a Pencil (field-scoped modal via
// `onEditField`; the image row carries NO actions at all) and the
// contract-clearable rows (year/link/role/featured) a clear Trash2;
// metric rows mirror JobCard bullets: Pencil + ↑↓ + Trash2. Metric/clear
// actions dispatch IN here (JobCard parity: persist-THEN-dispatch §3).
//
// Honest data (SPEC R-4): optional rows (link, year, role, techIcons,
// metrics, image, description) only exist when the value is present;
// featured renders its Badge row only when true. Empty locale lines of
// description/role are skipped. Description/role labels ride the row,
// both locale lines render as `EN: …` / `RU: …` (A3 — the admin edits
// both, neither is hidden).
//
// Invariants:
// - Collapse state is INTERNAL (no persistence), one card = one record.
// - ALL copy is i18n (i18n-first).
// - ARA roundtrip: aria-controls ONLY on the collapse button (the
//   content div is unmounted when collapsed — dangling idref fails axe).

import type { Project, ProjectStatus } from '@/entities/Project';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import type { BadgeVariant } from '@/shared/ui/Badge';
import { Badge } from '@/shared/ui/Badge';
import { IconButton } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Link } from '@/shared/ui/Link';
import type { Column } from '@/shared/ui/Table';
import { Table } from '@/shared/ui/Table';
import { Tooltip } from '@/shared/ui/Tooltip';
import { ArrowDown, ArrowUp, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllProjects } from '../../model/selectors/selectors';
import { resolveTechIcons } from '@/entities/Technology';
import { mediaUrl } from '@/shared/lib/media';
import { persistProjects } from '../../model/services/storage';
import { updateProject } from '../../model/slices/myWorkSlice';
import type { ProjectUpdatePatch } from '../../model/types/types';
import type { EditProjectField } from '../ProjectForm/lib/fieldSchemas';
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
  /** Rev.3: editable row key — absent on the image row (no actions). */
  fieldKey?: EditProjectField;
  /** Rev.3: metric rows carry their index for ↑↓/Trash2. */
  metricIndex?: number;
};

/** Rev.4: every scalar row is clearable — ''/undefined/[]/false/null. */
const CLEARABLE_FIELDS = new Set<EditProjectField>([
  'title',
  'category',
  'status',
  'featured',
  'year',
  'link',
  'description',
  'role',
  'techIcons',
  'image',
]);

const CLEAR_VALUES: Record<string, unknown> = {
  title: '',
  category: undefined,
  status: undefined,
  featured: false,
  year: undefined,
  link: null,
  description: { en: '', ru: '' },
  role: undefined,
  techIcons: [],
  image: '',
};

export interface ProjectCardProps {
  project: Project;
  /** Opens the EXISTING full ProjectForm modal (page-owned, unchanged). */
  onEdit?: (project: Project) => void;
  /** Opens the shared confirm modal (subtitle `{{name}}`, cancel-focused). */
  onDelete?: (id: string) => void;
  /** Rev.3: opens the FIELD-scoped modal for this row key (page-owned). */
  onEditField?: (project: Project, field: EditProjectField) => void;
  className?: string;
  /** Root test id (JobCard convention) — MyWorkEditorList passes `project-card-${project.id}`. */
  'data-testid'?: string;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onEditField,
  className,
  'data-testid': testId,
}: ProjectCardProps): React.JSX.Element {
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const projects = useSelector(selectAllProjects);
  const dispatch = useDispatch();
  const { addToast } = useToast();

  /** §3 order: persist the FULL next array first, dispatch on success. */
  const applyPatch = (patch: Omit<ProjectUpdatePatch, 'updatedAt'>): void => {
    const stamped = { ...patch, updatedAt: new Date().toISOString() };
    const next = projects.map((entry) =>
      entry.id === project.id ? { ...entry, ...stamped } : entry
    );
    if (!persistProjects(next)) {
      addToast({ message: t('projectSaveError'), type: 'error' });
      return;
    }
    dispatch(updateProject({ id: project.id, patch: stamped }));
  };

  const clearField = (field: EditProjectField): void => {
    applyPatch({ [field]: CLEAR_VALUES[field] } as Omit<ProjectUpdatePatch, 'updatedAt'>);
  };

  const moveMetric = (index: number, delta: -1 | 1): void => {
    const current = project.metrics ?? [];
    const target = index + delta;
    if (target < 0 || target >= current.length) return;
    const next = [...current];
    const swap = next[index];
    const other = next[target];
    if (swap === undefined || other === undefined) return;
    next[index] = other;
    next[target] = swap;
    applyPatch({ metrics: next });
  };

  const removeMetric = (index: number): void => {
    const current = project.metrics ?? [];
    const next = current.filter((_, position) => position !== index);
    applyPatch({ metrics: next.length > 0 ? next : undefined });
  };

  const contentId = `project-content-${project.id}`;
  const expandLabel = t('adminMyWorkExpand', { title: project.title });
  const collapseLabel = t('adminMyWorkCollapse', { title: project.title });

  // Honest data (SPEC R-4): optional rows only when present. Both
  // description locales render (A3); empty strings are skipped.
  // Rev.3: every row carries its editable fieldKey (rev.4: image too).
  // Rev.4: title/category/status joined the conditional set — a cleared
  // row disappears from the table (honest data, same as year/link).
  const rows: FieldRow[] = [];
  if (project.title !== '') {
    rows.push({
      key: 'title',
      label: t('projectFieldTitle'),
      value: project.title,
      fieldKey: 'title',
    });
  }
  if (project.category !== undefined) {
    rows.push({
      key: 'category',
      label: t('projectFieldCategory'),
      value: project.category,
      fieldKey: 'category',
    });
  }
  if (project.status !== undefined) {
    rows.push({
      key: 'status',
      label: t('projectFieldStatus'),
      value: project.status,
      fieldKey: 'status',
    });
  }
  if (project.featured) {
    rows.push({
      key: 'featured',
      label: t('projectFieldFeatured'),
      value: (
        <Badge variant="accent" size="sm">
          {t('projectFieldFeatured')}
        </Badge>
      ),
      fieldKey: 'featured',
    });
  }
  if (project.year !== undefined) {
    rows.push({
      key: 'year',
      label: t('projectFieldYear'),
      value: String(project.year),
      fieldKey: 'year',
    });
  }
  if (project.link) {
    rows.push({
      key: 'link',
      label: t('projectFieldLink'),
      value: (
        <Link href={project.link} variant="ghost" external>
          {project.link}
        </Link>
      ),
      fieldKey: 'link',
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
      fieldKey: 'description',
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
      fieldKey: 'role',
    });
  }
  const projectTechIcons = resolveTechIcons(project.techIcons);
  if (projectTechIcons.length > 0) {
    rows.push({
      key: 'techIcons',
      label: t('projectFieldTechIcons'),
      value: (
        <span className={styles.techValue}>
          {projectTechIcons.map((tech) => (
            <span className={styles.techChip} key={tech.url}>
              <img
                src={mediaUrl(tech.url)}
                alt={tech.name ?? t('projectFieldTechIcons')}
                className={styles.techChipIcon}
              />
              <span>{tech.name ?? t('projectFieldTechIcons')}</span>
            </span>
          ))}
        </span>
      ),
      fieldKey: 'techIcons',
    });
  }
  // One row per metric, label rides the FIRST row only (JobCard
  // description-label parity). Metric rows keep the INDEX for ↑↓/Trash2.
  project.metrics?.forEach((metric, index) => {
    rows.push({
      key: `metric-${index}`,
      label: index === 0 ? t('projectFieldMetrics') : '',
      value: metric,
      fieldKey: `metric-${index}`,
      metricIndex: index,
    });
  });
  // Image row: rev.4 — '' is now in the schema union (R-B1 reversed),
  // so the row carries Pencil (path input) + clear like every scalar.
  if (project.image !== '') {
    rows.push({
      key: 'image',
      label: t('projectFieldImage'),
      value: project.image,
      fieldKey: 'image',
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
      // Rev.3 (R-B2/B4): Pencil per editable row + clear/metric CRUD.
      render: (row) => {
        const fieldKey = row.fieldKey;
        if (fieldKey === undefined) return null;
        const isMetric = row.metricIndex !== undefined;
        const metricIndex = row.metricIndex ?? 0;
        const metricCount = project.metrics?.length ?? 0;
        return (
          <span
            className={styles.cellActions}
            data-testid={
              isMetric
                ? `project-metric-actions-${project.id}-${metricIndex}`
                : `project-field-actions-${project.id}-${fieldKey}`
            }
          >
            <Tooltip
              content={t('adminMyWorkEditFieldTitle', {
                field: isMetric ? t('projectFieldMetrics') : row.label,
              })}
              position="top"
              showDelay={0}
            >
              <IconButton
                type="button"
                ariaLabel={t('adminMyWorkEditFieldTitle', {
                  field: isMetric ? t('projectFieldMetrics') : row.label,
                })}
                variant="outline"
                size="sm"
                icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
                onClick={() => onEditField?.(project, fieldKey)}
              />
            </Tooltip>
            {isMetric ? (
              <>
                <Tooltip content={t('adminMyWorkMetricUp')} position="top" showDelay={0}>
                  <IconButton
                    type="button"
                    ariaLabel={t('adminMyWorkMetricUp')}
                    variant="outline"
                    size="sm"
                    disabled={metricIndex === 0}
                    icon={<Icon name={ArrowUp} size={20} color="inherit" decorative />}
                    onClick={() => moveMetric(metricIndex, -1)}
                  />
                </Tooltip>
                <Tooltip content={t('adminMyWorkMetricDown')} position="top" showDelay={0}>
                  <IconButton
                    type="button"
                    ariaLabel={t('adminMyWorkMetricDown')}
                    variant="outline"
                    size="sm"
                    disabled={metricIndex === metricCount - 1}
                    icon={<Icon name={ArrowDown} size={20} color="inherit" decorative />}
                    onClick={() => moveMetric(metricIndex, 1)}
                  />
                </Tooltip>
                <Tooltip content={t('adminMyWorkRemoveMetric')} position="top" showDelay={0}>
                  <IconButton
                    type="button"
                    ariaLabel={t('adminMyWorkRemoveMetric')}
                    variant="danger"
                    size="sm"
                    icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
                    onClick={() => removeMetric(metricIndex)}
                  />
                </Tooltip>
              </>
            ) : (
              CLEARABLE_FIELDS.has(fieldKey) && (
                <Tooltip content={t('adminMyWorkClearField')} position="top" showDelay={0}>
                  <IconButton
                    type="button"
                    ariaLabel={t('adminMyWorkClearField')}
                    variant="danger"
                    size="sm"
                    icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
                    onClick={() => clearField(fieldKey)}
                  />
                </Tooltip>
              )
            )}
          </span>
        );
      },
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
                  {project.status && (
                    <Badge variant={STATUS_VARIANTS[project.status]} size="sm">
                      {project.status}
                    </Badge>
                  )}
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
