// ============================================
// SkillsEditorList — per-category blocks (plan_admin_panel_edit rev.3, WU-1)
// ============================================
//
// One DataTable per category (OPEN-6: block order = storage order): the
// block header carries the h3 (category name + plural count Badge —
// verdict OPEN-8, existing key `skillsCategoryCount`) and the block-level
// actions (Edit category / Add technology — verdict OPEN-3 / Delete
// category); the table below lists that category's technologies with row
// actions. An empty category renders EmptyState `skillsCategoryEmpty`
// (verdict OPEN-7) instead of a placeholder row; an empty STORE renders
// the section-level `skillsListEmpty`.
//
// Invariants:
// - persist BEFORE dispatch (§3): the next array is rebuilt from the
//   `all` snapshot, then the action is dispatched — store === storage.
// - Reset removes the storage key instead of persisting (§5), then
//   dispatches resetToDefaults.
// - Delete callbacks let the page close a form whose record vanished.
// - ALL copy is i18n (i18n-first); counts render via the plural key.
// - Sorting is CONTROLLED and PER TABLE (A9): clicks only emit
//   `onSortChange` to that block's table; page and sort state are keyed
//   by category (A4), and a sort resets only its own table to page 1.
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

/** Rows per page until WU-2 lands the 5/10/20 size group (OPEN-1). */
const PAGE_SIZE = 12;

/** One row of a single-category table. */
type TechRow = {
  id: string;
  techName: string;
  entry: SkillCategoryData;
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
  // A4: page and sort are PER TABLE, keyed by category.
  const [pages, setPages] = useState<Record<string, number>>({});
  const [sorts, setSorts] = useState<Record<string, SortState | null>>({});

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

  /** Columns of ONE category table: the shared tech pair (no category column). */
  const makeColumns = (): DataTableColumn<TechRow>[] => [
    {
      key: 'tech',
      header: t('technologies'),
      sortable: true,
      sortValue: (row) => row.techName,
      render: (row) => (
        <span className={styles.nameCell} data-testid={`skill-tech-row-${row.techName}`}>
          <strong>{row.techName}</strong>
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('skillsTableActions'),
      render: (row) => (
        <div className={styles.actions} data-testid={`skill-tech-actions-${row.techName}`}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEditTechnology?.(row.entry.category, row.techName)}
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
                categoryId: row.entry.category,
                techName: row.techName,
              })
            }
          >
            {t('skillsDelete')}
          </Button>
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

      {all.length === 0 ? (
        // Section-level empty: no categories at all (skillsListEmpty).
        <EmptyState title={t('skillsListEmpty')} />
      ) : (
        // Storage order (OPEN-6) — selectAllSkillsData keeps it.
        all.map((entry) => {
          // A9: the kit owns sorting (sortValue on the column) and the
          // pagination window (A10 clamp) — this block only supplies the
          // CONTROLLED sort/page state, keyed by category (A4).
          const techRows: TechRow[] = entry.technologies.map((tech) => ({
            id: `${entry.category}::${tech.name}`,
            techName: tech.name,
            entry,
          }));

          const totalPages = Math.max(1, Math.ceil(techRows.length / PAGE_SIZE));
          // Mirror of the kit's safePage so the range counter always agrees
          // with the window DataTable actually renders (A10).
          const safePage = Math.min(Math.max(pages[entry.category] ?? 1, 1), totalPages);
          const start = (safePage - 1) * PAGE_SIZE;

          const rangeFrom = techRows.length > 0 ? start + 1 : 0;
          const rangeTo = Math.min(start + PAGE_SIZE, techRows.length);

          return (
            <section
              key={entry.category}
              className={styles.block}
              data-testid={`skills-category-block-${entry.category}`}
            >
              <div className={styles.blockHeader}>
                <Heading level={3}>
                  {entry.categoryName}{' '}
                  <Badge variant="outline" size="sm">
                    {t('skillsCategoryCount', { count: entry.technologies.length })}
                  </Badge>
                </Heading>
                <div
                  className={styles.actions}
                  data-testid={`skill-category-actions-${entry.category}`}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEditCategory?.(entry)}
                  >
                    {t('skillsEditCategory')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onAddTechnology?.(entry.category)}
                  >
                    {t('skillsAddTechnology')}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setPending({ kind: 'category', categoryId: entry.category })}
                  >
                    {t('skillsDelete')}
                  </Button>
                </div>
              </div>

              <DataTable<TechRow>
                caption={entry.categoryName}
                columns={makeColumns()}
                rows={techRows}
                getKey={(row) => row.id}
                page={pages[entry.category] ?? 1}
                pageSize={PAGE_SIZE}
                onPageChange={(next) => setPages((prev) => ({ ...prev, [entry.category]: next }))}
                sort={sorts[entry.category] ?? null}
                onSortChange={(next) => {
                  setSorts((prev) => ({ ...prev, [entry.category]: next }));
                  // A sort the user cannot SEE reads as a broken button:
                  // reset only THIS table to the top of the new order (A9).
                  setPages((prev) => ({ ...prev, [entry.category]: 1 }));
                }}
                emptyState={<EmptyState title={t('skillsCategoryEmpty')} compact />}
              />

              {techRows.length > 0 && (
                <div
                  className={styles.footer}
                  data-testid={`skills-pagination-footer-${entry.category}`}
                >
                  <span className={styles.range} aria-live="polite">
                    {t('paginationRange', { from: rangeFrom, to: rangeTo, total: techRows.length })}
                  </span>
                </div>
              )}
            </section>
          );
        })
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
