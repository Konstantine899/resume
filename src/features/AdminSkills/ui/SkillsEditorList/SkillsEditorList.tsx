// ============================================
// SkillsEditorList — category + technology rows (WU-5, plan §9)
// ============================================
//
// Stage-1 CRUD: one <li> per category (name, tech count, Edit/Delete) and
// technology rows as plain divs inside the category (so getAllByRole
// ('listitem') stays category-scoped). Collection-level Reset lives in the
// header; per-record Delete opens a kit Modal confirm (§6, never
// window.confirm).
//
// Invariants:
// - persist BEFORE dispatch (§3): the next array is rebuilt from the
//   `all` snapshot, then the action is dispatched — store === storage.
// - Reset removes the storage key instead of persisting (§5), then
//   dispatches resetToDefaults.
// - Delete callbacks let the page close a form whose record vanished.
// - ALL copy is i18n (i18n-first); counts render as plain numbers.

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/Heading';
import { Modal } from '@/shared/ui/Modal';
import { Paragraph } from '@/shared/ui/Paragraph';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllSkillsData } from '../../model/selectors/selectors';
import { persistSkills, removeSkills } from '../../model/services/storage';
import {
  deleteSkillCategory,
  deleteTechnology,
  resetToDefaults,
} from '../../model/slices/skillsSlice';
import styles from './SkillsEditorList.module.scss';

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
  onEditCategory?: (category: import('@/entities/Skill').SkillCategoryData) => void;
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
        <Paragraph theme="muted">{t('skillsListEmpty')}</Paragraph>
      ) : (
        <ul className={styles.list} aria-label={t('adminSkillsTitle')}>
          {all.map((entry) => (
            <li
              key={entry.category}
              className={styles.row}
              data-testid={`skill-category-row-${entry.category}`}
            >
              <div className={styles.rowHeader}>
                <div className={styles.info}>
                  <Heading level={3}>{entry.categoryName}</Heading>
                  <Badge variant="outline" size="sm">
                    {entry.technologies.length}
                  </Badge>
                </div>
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
                    variant="danger"
                    size="sm"
                    onClick={() => setPending({ kind: 'category', categoryId: entry.category })}
                  >
                    {t('skillsDelete')}
                  </Button>
                </div>
              </div>

              <div className={styles.techList}>
                {entry.technologies.map((tech) => (
                  <div
                    key={tech.name}
                    className={styles.techRow}
                    data-testid={`skill-tech-row-${tech.name}`}
                  >
                    <span className={styles.techName}>{tech.name}</span>
                    <div className={styles.actions}>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEditTechnology?.(entry.category, tech.name)}
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
                            categoryId: entry.category,
                            techName: tech.name,
                          })
                        }
                      >
                        {t('skillsDelete')}
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAddTechnology?.(entry.category)}
                >
                  {t('skillsAddTechnology')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
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
