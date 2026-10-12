// ============================================
// MyWorkEditorList — admin project vitrina (admin-mywork-refactor WU-5)
// ============================================
//
// Stage-1 CRUD list (plan §9) on the kit DataTable (SPEC R-5): columns
// title / category / status / featured / year / actions, controlled
// sorting + pagination (page-size 5|10|20), the range counter under the
// table, and the header (h2+hint+IconButton add, the SkillsEditorList
// pattern). Edit emits onEdit(id); Delete goes through a kit Modal
// confirm (§6, NOT window.confirm). The page owns the open form — this
// list only fires callbacks.
//
// Invariants:
// - persist BEFORE dispatch (§3): the dispatched id and the persisted
//   array come from the same `projects` snapshot.
// - Sorting is CONTROLLED: a header click only emits `onSortChange`; a
//   sort resets the page to 1 (Skills WU-5a — a sort the user cannot
//   SEE reads as a broken button).
// - `deleting` gates the confirm Button (plan §6 ButtonLoader row): the
//   stage-1 localStorage persist is synchronous so the spinner never
//   paints — the state exists for the future API swap, not for show.
// - ALL copy is i18n (i18n-first); status/featured badges show the enum
//   values, exactly like the form's native selects.

import type { Project, ProjectStatus } from '@/entities/Project';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Plus } from 'lucide-react';
import type { BadgeVariant } from '@/shared/ui/Badge';
import { Badge } from '@/shared/ui/Badge';
import { Button, IconButton } from '@/shared/ui/Button';
import { DataTable } from '@/shared/ui/DataTable';
import type { DataTableColumn, SortState } from '@/shared/ui/DataTable';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { Paragraph } from '@/shared/ui/Paragraph';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllProjects } from '../../model/selectors';
import { persistProjects } from '../../model/services/storage';
import { deleteProject } from '../../model/slices/myWorkSlice';
import styles from './MyWorkEditorList.module.scss';

/** Badge color per status enum value (raw value shown as the label). */
const STATUS_VARIANTS: Record<ProjectStatus, BadgeVariant> = {
  completed: 'success',
  'in-progress': 'warning',
  maintenance: 'accent',
  archived: 'outline',
};

/**
 * Default rows per page + the kit `PageSizeGroup` options — mirror of
 * JobsList / SkillsEditorList.
 */
const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS: readonly number[] = [5, 10, 20];

export interface MyWorkEditorListProps {
  className?: string;
  'data-testid'?: string;
  /** The page opens its CREATE form (R-4 add-affordance). */
  onAdd?: () => void;
  /** The page opens its edit form for this record. */
  onEdit: (id: string) => void;
  /** The page clears editingId when the open record is deleted. */
  onDeleted?: (id: string) => void;
}

export const MyWorkEditorList: React.FC<MyWorkEditorListProps> = ({
  className = '',
  'data-testid': testId = 'mywork-editor-list',
  onAdd,
  onEdit,
  onDeleted,
}) => {
  // Same-feature selector + dispatch — legal inside AdminMyWork (§8).
  const projects = useSelector(selectAllProjects);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Destructive-confirm pattern (SkillsEditorList §6): focus lands on «Отмена».
  const cancelRef = useRef<HTMLButtonElement>(null);
  // Controlled DataTable state (kit A2): the container owns page/size/sort.
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState<SortState | null>(null);

  const closeModal = () => {
    setPendingDeleteId(null);
    setDeleting(false);
  };

  /** §3 order: persist → dispatch → toast → callback → close. */
  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;
    setDeleting(true);
    const next = projects.filter((project) => project.id !== pendingDeleteId);
    if (!persistProjects(next)) {
      // R-2 / Skills OPEN-9 parity: keep the modal OPEN for a retry.
      addToast({ message: t('projectSaveError'), type: 'error' });
      setDeleting(false);
      return;
    }
    dispatch(deleteProject(pendingDeleteId));
    addToast({ message: t('projectDeleted'), type: 'success' });
    onDeleted?.(pendingDeleteId);
    closeModal();
  };

  const pendingProject =
    pendingDeleteId === null
      ? undefined
      : projects.find((project) => project.id === pendingDeleteId);

  /** Columns of the vitrina (SPEC R-5): title / category / status / featured / year / actions. */
  const columns: DataTableColumn<Project>[] = [
    {
      key: 'title',
      header: t('adminMyWorkTableTitle'),
      sortable: true,
      sortValue: (project) => project.title,
      render: (project) => (
        <span className={styles.titleCell} data-testid={`mywork-row-${project.id}`}>
          {/* A6: no heading elements inside cells — <strong> label. */}
          <strong>{project.title}</strong>
        </span>
      ),
    },
    {
      key: 'category',
      header: t('adminMyWorkTableCategory'),
      sortable: true,
      sortValue: (project) => project.category,
      render: (project) => <span className={styles.category}>{project.category}</span>,
    },
    {
      key: 'status',
      header: t('adminMyWorkTableStatus'),
      sortable: true,
      sortValue: (project) => project.status,
      render: (project) => (
        <Badge variant={STATUS_VARIANTS[project.status]} size="sm">
          {project.status}
        </Badge>
      ),
    },
    {
      key: 'featured',
      header: t('adminMyWorkTableFeatured'),
      render: (project) =>
        project.featured ? (
          <Badge variant="accent" size="sm">
            {t('projectFieldFeatured')}
          </Badge>
        ) : null,
    },
    {
      key: 'year',
      header: t('adminMyWorkTableYear'),
      sortable: true,
      // Numbers compare as values, not as their display strings (kit A3).
      // `?? 0`: `year` is optional on the entity — undefined sorts first.
      sortValue: (project) => project.year ?? 0,
      render: (project) => <span className={styles.year}>{project.year}</span>,
    },
    {
      key: 'actions',
      header: t('adminMyWorkTableActions'),
      render: (project) => (
        <div className={styles.actions} data-testid={`mywork-actions-${project.id}`}>
          <Button type="button" variant="outline" size="sm" onClick={() => onEdit(project.id)}>
            {t('projectEdit')}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setPendingDeleteId(project.id)}
          >
            {t('projectDelete')}
          </Button>
        </div>
      ),
    },
  ];

  // Mirror of the kit's safePage so the range counter always agrees with
  // the window DataTable actually renders (A10).
  const totalPages = Math.max(1, Math.ceil(projects.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  const rangeFrom = projects.length > 0 ? start + 1 : 0;
  const rangeTo = Math.min(start + pageSize, projects.length);

  return (
    <div className={classNames(styles.root, className)} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.intro}>
          <Heading level={2}>{t('adminMyWorkTitle')}</Heading>
          <Paragraph theme="muted">{t('adminMyWorkHint')}</Paragraph>
        </div>
        <IconButton
          variant="primary"
          size="md"
          ariaLabel={t('adminMyWorkAdd')}
          icon={<Icon name={Plus} size={20} color="inherit" decorative />}
          onClick={() => onAdd?.()}
        />
      </div>

      <DataTable<Project>
        caption={t('adminMyWorkTitle')}
        columns={columns}
        rows={projects}
        getKey={(project) => project.id}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageSizeChange={(next) => {
          setPageSize(next);
          // A new size re-windows everything — top of page 1 (SPEC A10).
          setPage(1);
        }}
        onPageChange={setPage}
        sort={sort}
        onSortChange={(next) => {
          setSort(next);
          // A sort the user cannot SEE reads as a broken button:
          // reset to the top of the new order (Skills WU-5a).
          setPage(1);
        }}
        emptyState={<EmptyState title={t('noProjectsYet')} />}
      />

      {projects.length > 0 && (
        <div className={styles.footer}>
          <span className={styles.range} aria-live="polite">
            {t('paginationRange', { from: rangeFrom, to: rangeTo, total: projects.length })}
          </span>
        </div>
      )}

      <Modal
        isOpen={pendingDeleteId !== null}
        onClose={closeModal}
        // R-2: title ≠ button label (the button stays projectDelete); the
        // subtitle NAMES the project (projectConfirmDeleteName, OPEN-10
        // parity with skillsConfirmDelete={{name}} / adminJobConfirmDeleteName).
        title={t('projectDeleteConfirm')}
        subtitle={
          pendingProject ? t('projectConfirmDeleteName', { name: pendingProject.title }) : undefined
        }
        size="sm"
        initialFocusRef={cancelRef}
        footer={
          <>
            <Button ref={cancelRef} type="button" variant="outline" onClick={closeModal}>
              {t('projectCancel')}
            </Button>
            <Button type="button" variant="danger" loading={deleting} onClick={handleConfirmDelete}>
              {t('projectDelete')}
            </Button>
          </>
        }
      >
        {null}
      </Modal>
    </div>
  );
};

MyWorkEditorList.displayName = 'MyWorkEditorList';
