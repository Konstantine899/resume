// ============================================
// SkillsEditorList — flat DataTable pilot (WU-5c, plan_kit_datatable)
// ============================================
//
// Stage-1 CRUD over a FLAT tech list (OPEN-5): one table row per technology
// plus a placeholder row keeping an EMPTY category reachable. Category
// actions (Edit/Delete Category + Add Technology) live on the FIRST visible
// row of their category in the current window (owner verdict 2026-10-10) —
// when sorting scatters a category, exactly one of its rows still carries
// them, so every visible category stays actionable on every page.
//
// Invariants:
// - persist BEFORE dispatch (§3): the next array is rebuilt from the
//   `all` snapshot, then the action is dispatched — store === storage.
// - Reset removes the storage key instead of persisting (§5), then
//   dispatches resetToDefaults.
// - Delete callbacks let the page close a form whose record vanished.
// - ALL copy is i18n (i18n-first); counts render as plain numbers.
// - Sorting is CONTROLLED (OPEN-1): clicks only emit `onSortChange`; this
//   component owns the state today (sort⇄URL is a later step). The local
//   sort+window mirror of DataTable is required to know WHICH row is first
//   in the visible window — the kit windows internally, and the marker must
//   match what is actually on screen.
// - A6: no heading elements inside cells — first cell is <strong>.

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable } from '@/shared/ui/DataTable';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Heading } from '@/shared/ui/Heading';
import { Modal } from '@/shared/ui/Modal';
import { Paragraph } from '@/shared/ui/Paragraph';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { SkillCategoryData } from '@/entities/Skill';
import type { DataTableColumn, SortState } from '@/shared/ui/DataTable';
import { selectAllSkillsData } from '../../model/selectors/selectors';
import { persistSkills, removeSkills } from '../../model/services/storage';
import {
  deleteSkillCategory,
  deleteTechnology,
  resetToDefaults,
} from '../../model/slices/skillsSlice';
import styles from './SkillsEditorList.module.scss';

/** Rows per page (plan §7 pilot: 10–12 → 3–4 pages). No size group. */
const PAGE_SIZE = 12;

/** One flat row: a technology, or a placeholder keeping its category reachable. */
type SkillRow = {
  id: string;
  techName?: string;
  category: string;
  categoryName: string;
  techCount: number;
  entry: SkillCategoryData;
  /** First occurrence of the category inside the CURRENT window. */
  isFirstInWindow: boolean;
};

/** One pending destructive action behind the shared Modal confirm. */
type PendingDelete =
  | { kind: 'category'; categoryId: string }
  | { kind: 'technology'; categoryId: string; techName: string }
  | { kind: 'reset' }
  | null;

export interface SkillsEditorListProps {
  className?: string;
  'data-testid'?: string;
  /** The page opens its create form. */
  onAddCategory?: () => void;
  /** The page opens its edit form for this category record. */
  onEditCategory?: (category: SkillCategoryData) => void;
  /** The page opens its create form inside this category. */
  onAddTechnology?: (categoryId: string) => void;
  /** The page opens its edit form for this technology. */
  onEditTechnology?: (categoryId: string, techName: string) => void;
  /** The page clears a category selection when the record is deleted. */
  onCategoryDeleted?: (categoryId: string) => void;
  /** The page clears a technology selection when the record is deleted. */
  onTechnologyDeleted?: (categoryId: string, techName: string) => void;
}

export const SkillsEditorList: React.FC<SkillsEditorListProps> = ({
  className = '',
  'data-testid': testId = 'skills-editor-list',
  onAddCategory,
  onEditCategory,
  onAddTechnology,
  onEditTechnology,
  onCategoryDeleted,
  onTechnologyDeleted,
}) => {
  // Same-feature selector + dispatch — legal inside AdminSkills (§8).
  const all = useSelector(selectAllSkillsData);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [pending, setPending] = useState<PendingDelete>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState | null>(null);

  // ---- Flatten (OPEN-5): every tech + one placeholder per empty category ----
  const rows: SkillRow[] = all.flatMap((entry) =>
    entry.technologies.length > 0
      ? entry.technologies.map((tech) => ({
          id: `${entry.category}::${tech.name}`,
          techName: tech.name,
          category: entry.category,
          categoryName: entry.categoryName,
          techCount: entry.technologies.length,
          entry,
          isFirstInWindow: false,
        }))
      : [
          {
            id: `${entry.category}::`,
            category: entry.category,
            categoryName: entry.categoryName,
            techCount: entry.technologies.length,
            entry,
            isFirstInWindow: false,
          },
        ]
  );

  // ---- Mirror of DataTable's controlled sort (A2/A3): same comparator ----
  // (string localeCompare — both sortable columns use sortValue), then the
  // same window math, so the "first row in window" marker always lands on
  // the rows actually rendered by the kit.
  const sortedRows = (() => {
    if (!sort) return rows;
    const value = (row: SkillRow) =>
      sort.key === 'tech' ? (row.techName ?? '') : row.categoryName;
    const sorted = [...rows].sort((a, b) => value(a).localeCompare(value(b)));
    return sort.direction === 'asc' ? sorted : sorted.reverse();
  })();

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  // The authoritative clamp lives in DataTable (plan A2); this mirror keeps
  // the range counter and the marker consistent with what it renders.
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;

  const flaggedRows = (() => {
    const windowIds = new Set(sortedRows.slice(start, start + PAGE_SIZE).map((row) => row.id));
    const seen = new Set<string>();
    return sortedRows.map((row) => {
      if (!windowIds.has(row.id)) return row;
      const first = !seen.has(row.category);
      seen.add(row.category);
      return first ? { ...row, isFirstInWindow: true } : row;
    });
  })();

  const rangeFrom = sortedRows.length > 0 ? start + 1 : 0;
  const rangeTo = Math.min(start + PAGE_SIZE, sortedRows.length);

  const closeModal = () => {
    setPending(null);
    setDeleting(false);
  };

  /** §3 order: persist → dispatch → toast → callback → close. */
  const handleConfirmDelete = () => {
    if (!pending) return;
    setDeleting(true);

    if (pending.kind === 'category') {
      const { categoryId } = pending;
      const next = all.filter((entry) => entry.category !== categoryId);
      if (!persistSkills(next)) {
        addToast({ message: t('skillsPersistError'), type: 'error' });
        closeModal();
        return;
      }
      dispatch(deleteSkillCategory(categoryId));
      addToast({ message: t('skillsDeleted'), type: 'success' });
      onCategoryDeleted?.(categoryId);
      closeModal();
      return;
    }

    if (pending.kind === 'technology') {
      const { categoryId, techName } = pending;
      const next = all.map((entry) =>
        entry.category === categoryId
          ? { ...entry, technologies: entry.technologies.filter((tech) => tech.name !== techName) }
          : entry
      );
      if (!persistSkills(next)) {
        addToast({ message: t('skillsPersistError'), type: 'error' });
        closeModal();
        return;
      }
      dispatch(deleteTechnology({ categoryId, techName }));
      addToast({ message: t('skillsDeleted'), type: 'success' });
      onTechnologyDeleted?.(categoryId, techName);
      closeModal();
      return;
    }

    // reset: remove the key (§5), never persist the seed back.
    removeSkills();
    dispatch(resetToDefaults());
    closeModal();
  };

  const confirmLabel = pending?.kind === 'reset' ? t('skillsReset') : t('skillsDelete');
  const confirmBody =
    pending?.kind === 'reset' ? t('skillsResetConfirm') : t('skillsConfirmDelete');

  const columns: DataTableColumn<SkillRow>[] = [
    {
      key: 'tech',
      header: t('technologies'),
      sortable: true,
      sortValue: (row) => row.techName ?? '',
      render: (row) => (
        <span
          className={styles.nameCell}
          data-testid={row.techName ? `skill-tech-row-${row.techName}` : undefined}
        >
          <strong>{row.techName ?? t('skillsEmpty')}</strong>
        </span>
      ),
    },
    {
      key: 'category',
      header: t('projectFieldCategory'),
      sortable: true,
      sortValue: (row) => row.categoryName,
      render: (row) =>
        row.isFirstInWindow ? (
          <span className={styles.categoryCell} data-testid={`skill-category-row-${row.category}`}>
            <span>{row.categoryName}</span>
            <Badge variant="outline" size="sm">
              {row.techCount}
            </Badge>
          </span>
        ) : (
          <span>{row.categoryName}</span>
        ),
    },
    {
      key: 'actions',
      header: t('skillsTableActions'),
      render: (row) => (
        <div className={styles.actionsCell}>
          {row.isFirstInWindow && (
            <div className={styles.actions} data-testid={`skill-category-actions-${row.category}`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEditCategory?.(row.entry)}
              >
                {t('skillsEditCategory')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAddTechnology?.(row.category)}
              >
                {t('skillsAddTechnology')}
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setPending({ kind: 'category', categoryId: row.category })}
              >
                {t('skillsDelete')}
              </Button>
            </div>
          )}
          {row.techName !== undefined && (
            <div className={styles.actions} data-testid={`skill-tech-actions-${row.techName}`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEditTechnology?.(row.category, row.techName ?? '')}
              >
                {t('skillsEditTechnology')}
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() =>
                  setPending({
                    kind: 'technology',
                    categoryId: row.category,
                    techName: row.techName ?? '',
                  })
                }
              >
                {t('skillsDelete')}
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={classNames(styles.root, className)} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.intro}>
          <Heading level={2}>{t('adminSkillsTitle')}</Heading>
          <Paragraph theme="muted">{t('adminSkillsHint')}</Paragraph>
        </div>
        <div className={styles.headerActions}>
          <Button type="button" variant="primary" size="sm" onClick={() => onAddCategory?.()}>
            {t('skillsAddCategory')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPending({ kind: 'reset' })}
          >
            {t('skillsReset')}
          </Button>
        </div>
      </div>

      <DataTable<SkillRow>
        caption={t('adminSkillsTitle')}
        columns={columns}
        rows={flaggedRows}
        getKey={(row) => row.id}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sort={sort}
        onSortChange={(next) => {
          setSort(next);
          // A sort the user cannot SEE reads as a broken button: leaving a
          // stale mid-list page would show rows 13–24 of the new order, not
          // its top — so the pilot always jumps back to page 1.
          setPage(1);
        }}
        emptyState={<EmptyState title={t('skillsListEmpty')} />}
      />

      {sortedRows.length > 0 && (
        <div className={styles.footer} data-testid="skills-pagination-footer">
          <span className={styles.range} aria-live="polite">
            {t('paginationRange', { from: rangeFrom, to: rangeTo, total: sortedRows.length })}
          </span>
        </div>
      )}

      <Modal
        isOpen={pending !== null}
        onClose={closeModal}
        title={confirmLabel}
        size="sm"
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeModal}>
              {t('skillsCancel')}
            </Button>
            <Button type="button" variant="danger" loading={deleting} onClick={handleConfirmDelete}>
              {confirmLabel}
            </Button>
          </>
        }
      >
        <Paragraph>{confirmBody}</Paragraph>
      </Modal>
    </div>
  );
};

SkillsEditorList.displayName = 'SkillsEditorList';
