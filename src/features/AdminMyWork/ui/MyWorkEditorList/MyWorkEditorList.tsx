// ============================================
// MyWorkEditorList — admin project vitrina (mywork-detail-table WU-2)
// ============================================
//
// SPEC R-1/R-3/R-5 (variant A′, owner verdict 2026-10-14): the DataTable
// vitrina is replaced by one collapsible ProjectCard per record (default
// collapsed — Jobs #225 / Skills rev.4 parity). The header carries the
// page-level kit Select sort (storage = insertion order, title,
// category, year desc) plus the unchanged reset + add IconButtons
// (SkillsEditorList header pattern). Delete opens through the card's
// header Trash2 (R-3): subtitle names the project, focus lands on
// «Отмена». Pagination/PageSizeGroup/range counter leave WITH the
// DataTable — ≤15 records render all (R-1, deliberate).
//
// Invariants:
// - persist BEFORE dispatch (§3): the next array is rebuilt from the
//   INSERTION-ORDER snapshot (selectAllProjects — store === storage
//   byte-for-byte), then deleteProject is dispatched. Only the RENDER
//   uses the sorted list; persisting the sorted array would silently
//   rewrite the stored order on every delete.
// - Sorting is local view state; sort never mutates the store array
//   (useMemo sorts a copy).
// - persist failure → projectSaveError toast, record untouched, the
//   confirm modal stays open for a retry (R-2).
// - ALL copy is i18n (i18n-first).
// - `year` is optional — the desc comparator uses `?? 0` so absent years
//   sort last.

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Plus, RotateCcw } from 'lucide-react';
import { Button, IconButton } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Select } from '@/shared/ui/Select';
import { Tooltip } from '@/shared/ui/Tooltip';
import React, { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { SelectOption } from '@/shared/ui/Select';
import type { Project } from '@/entities/Project';
import { selectAllProjects } from '../../model/selectors';
import { persistProjects, removeProjects } from '../../model/services/storage';
import { deleteProject, resetToDefaults } from '../../model/slices/myWorkSlice';
import type { EditProjectField } from '../ProjectForm/lib/fieldSchemas';
import { ProjectCard } from '../ProjectCard/ProjectCard';
import styles from './MyWorkEditorList.module.scss';

/** Header Select modes (R-1 D3): storage = insertion order, the others alpha/desc. */
type SortMode = 'storage' | 'title' | 'category' | 'year';

export interface MyWorkEditorListProps {
  className?: string;
  'data-testid'?: string;
  /** The page opens its CREATE form (add-affordance). */
  onAdd?: () => void;
  /** The page opens its edit form for this record id. */
  onEdit: (id: string) => void;
  /** Rev.3: the page opens the FIELD-scoped modal for this record+row. */
  onEditField?: (project: Project, field: EditProjectField) => void;
  /** The page clears editingId when the open record is deleted. */
  onDeleted?: (id: string) => void;
}

export const MyWorkEditorList: React.FC<MyWorkEditorListProps> = ({
  className = '',
  'data-testid': testId = 'mywork-editor-list',
  onAdd,
  onEdit,
  onEditField,
  onDeleted,
}) => {
  // Same-feature selector + dispatch — legal inside AdminMyWork (§8).
  // Render is sorted per mode; the persist snapshot stays insertion-order.
  const allProjects = useSelector(selectAllProjects);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [pending, setPending] = useState<{ kind: 'delete'; id: string } | { kind: 'reset' } | null>(
    null
  );
  const [confirming, setConfirming] = useState(false);
  // Destructive-confirm pattern (SkillsEditorList §6): focus lands on «Отмена».
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [sortMode, setSortMode] = useState<SortMode>('storage');

  // R-1: storage keeps the selector order as-is; the other modes sort a
  // COPY so the store array is never mutated. `?? 0`: `year` is optional
  // — absent years sort last on desc.
  const sortedProjects = useMemo(() => {
    if (sortMode === 'title') {
      return [...allProjects].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortMode === 'category') {
      // `?? ''`: category is optional (rev.4) — cleared records sort as empty.
      return [...allProjects].sort((a, b) => (a.category ?? '').localeCompare(b.category ?? ''));
    }
    if (sortMode === 'year') {
      return [...allProjects].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    }
    return allProjects;
  }, [allProjects, sortMode]);

  const sortOptions: SelectOption[] = [
    { value: 'storage', label: t('adminMyWorkSortStorage') },
    { value: 'title', label: t('adminMyWorkSortTitle') },
    { value: 'category', label: t('adminMyWorkSortCategory') },
    { value: 'year', label: t('adminMyWorkSortYear') },
  ];

  const closeModal = () => {
    setPending(null);
    setConfirming(false);
  };

  /** §3 order: persist → dispatch → toast → callback → close. */
  const handleConfirmDelete = (id: string) => {
    setConfirming(true);
    // R-3: rebuild from the INSERTION-ORDER snapshot so storage keeps the
    // store's byte-for-byte order; the sorted array above is render-only.
    const next = allProjects.filter((project) => project.id !== id);
    if (!persistProjects(next)) {
      // R-2 / Skills OPEN-9 parity: keep the modal OPEN for a retry.
      addToast({ message: t('projectSaveError'), type: 'error' });
      setConfirming(false);
      return;
    }
    dispatch(deleteProject(id));
    addToast({ message: t('projectDeleted'), type: 'success' });
    onDeleted?.(id);
    closeModal();
  };

  /** Reset relocated from the form — remove → dispatch. */
  const handleConfirmReset = () => {
    setConfirming(true);
    removeProjects();
    dispatch(resetToDefaults());
    closeModal();
  };

  const handleConfirm = () => {
    if (pending === null) return;
    if (pending.kind === 'delete') handleConfirmDelete(pending.id);
    else handleConfirmReset();
  };

  const pendingProject =
    pending?.kind === 'delete'
      ? allProjects.find((project) => project.id === pending.id)
      : undefined;

  return (
    <div className={classNames(styles.root, className)} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.intro}>
          <Heading level={2}>{t('adminMyWorkTitle')}</Heading>
          {/* Kept from the DataTable vitrina — migration changes the LIST
              mechanics, never the user-facing copy (i18n-first). */}
          <Paragraph theme="muted">{t('adminMyWorkHint')}</Paragraph>
        </div>
        <div className={styles.headerActions}>
          <Select
            id="admin-mywork-sort"
            data-testid="admin-mywork-sort"
            label={t('adminMyWorkSort')}
            size="sm"
            options={sortOptions}
            value={sortMode}
            onChange={(value) => {
              if (
                value === 'storage' ||
                value === 'title' ||
                value === 'category' ||
                value === 'year'
              ) {
                setSortMode(value);
              }
            }}
          />
          {/* Destructive reset relocated from the form — header button
              behind the SAME confirm Modal as delete. R-A2 (issue #242):
              hover tooltip (A14 — kit Tooltip is hover-only). */}
          <Tooltip content={t('projectReset')} position="top" showDelay={0}>
            <IconButton
              variant="outline"
              size="md"
              ariaLabel={t('projectReset')}
              icon={<Icon name={RotateCcw} size={20} color="inherit" decorative />}
              onClick={() => setPending({ kind: 'reset' })}
            />
          </Tooltip>
          <Tooltip content={t('adminMyWorkAdd')} position="top" showDelay={0}>
            <IconButton
              variant="primary"
              size="md"
              ariaLabel={t('adminMyWorkAdd')}
              icon={<Icon name={Plus} size={20} color="inherit" decorative />}
              onClick={() => onAdd?.()}
            />
          </Tooltip>
        </div>
      </div>

      {sortedProjects.length === 0 && <EmptyState title={t('noProjectsYet')} />}
      {sortedProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={(record) => onEdit(record.id)}
          onEditField={onEditField}
          onDelete={(id) => setPending({ kind: 'delete', id })}
        />
      ))}

      <Modal
        isOpen={pending !== null}
        onClose={closeModal}
        // R-2: title ≠ button label for delete (the button stays
        // projectDelete); the subtitle NAMES the project
        // (projectConfirmDeleteName, OPEN-10 parity).
        // Reset: projectReset title + projectResetConfirm subtitle.
        title={pending?.kind === 'reset' ? t('projectReset') : t('projectDeleteConfirm')}
        subtitle={
          pendingProject
            ? t('projectConfirmDeleteName', { name: pendingProject.title })
            : pending?.kind === 'reset'
              ? t('projectResetConfirm')
              : undefined
        }
        size="sm"
        initialFocusRef={cancelRef}
        footer={
          <>
            <Button ref={cancelRef} type="button" variant="outline" onClick={closeModal}>
              {t('projectCancel')}
            </Button>
            <Button
              type="button"
              variant={pending?.kind === 'reset' ? 'primary' : 'danger'}
              loading={confirming}
              onClick={handleConfirm}
            >
              {pending?.kind === 'reset' ? t('projectReset') : t('projectDelete')}
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
