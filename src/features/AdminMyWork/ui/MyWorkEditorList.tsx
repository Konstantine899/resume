// ============================================
// MyWorkEditorList — admin project rows with Edit/Delete (WU-4)
// ============================================
//
// Stage-1 CRUD (plan_projects_crud §10): one row per stored project —
// title, featured/status Badges, Edit (page owns the open record) and
// Delete through a kit Modal confirm (§6, NOT window.confirm).
//
// Invariants:
// - persist BEFORE dispatch (§3): the dispatched id and the persisted
//   array come from the same `all` snapshot.
// - `deleting` gates the confirm Button (plan §6 ButtonLoader row): the
//   stage-1 localStorage persist is synchronous so the spinner never
//   paints — the state exists for the future API swap, not for show.
// - ALL copy is i18n (i18n-first); status/featured badges show the enum
//   values, exactly like the form's native selects.

import { Badge } from '@/shared/ui/Badge';
import type { BadgeVariant } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/Heading';
import { Modal } from '@/shared/ui/Modal';
import { Paragraph } from '@/shared/ui/Paragraph';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProject } from '../model/myWorkSlice';
import { selectAllProjects } from '../model/selectors';
import { persistProjects } from '../model/storage';
import type { ProjectStatus } from '@/entities/Project';
import styles from './MyWorkEditorList.module.scss';

/** Badge color per status enum value (raw value shown as the label). */
const STATUS_VARIANTS: Record<ProjectStatus, BadgeVariant> = {
  completed: 'success',
  'in-progress': 'warning',
  maintenance: 'accent',
  archived: 'outline',
};

export interface MyWorkEditorListProps {
  className?: string;
  'data-testid'?: string;
  /** The page opens its edit form for this record. */
  onEdit: (id: string) => void;
  /** The page clears editingId when the open record is deleted. */
  onDeleted?: (id: string) => void;
}

export const MyWorkEditorList: React.FC<MyWorkEditorListProps> = ({
  className = '',
  'data-testid': testId = 'mywork-editor-list',
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

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;
    const targetId = pendingDeleteId;
    setDeleting(true);
    const next = projects.filter((project) => project.id !== targetId);
    if (!persistProjects(next)) {
      addToast({ message: t('projectSaveError'), type: 'error' });
      setDeleting(false);
      setPendingDeleteId(null);
      return;
    }
    dispatch(deleteProject(targetId));
    addToast({ message: t('projectDeleted'), type: 'success' });
    onDeleted?.(targetId);
    setDeleting(false);
    setPendingDeleteId(null);
  };

  if (projects.length === 0) {
    return (
      <div className={classNames(styles.root, className)} data-testid={testId}>
        <Paragraph theme="muted">{t('noProjectsYet')}</Paragraph>
      </div>
    );
  }

  return (
    <div className={classNames(styles.root, className)} data-testid={testId}>
      <ul className={styles.list} aria-label={t('myWork')}>
        {projects.map((project) => (
          <li key={project.id} className={styles.row}>
            <div className={styles.info}>
              <Heading level={3}>{project.title}</Heading>
              {project.featured && (
                <Badge variant="accent" size="sm">
                  {t('projectFieldFeatured')}
                </Badge>
              )}
              <Badge variant={STATUS_VARIANTS[project.status]} size="sm">
                {project.status}
              </Badge>
            </div>
            <div className={styles.actions}>
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
          </li>
        ))}
      </ul>

      <Modal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        title={t('projectDelete')}
        size="sm"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setPendingDeleteId(null)}>
              {t('projectCancel')}
            </Button>
            <Button type="button" variant="danger" loading={deleting} onClick={handleConfirmDelete}>
              {t('projectDelete')}
            </Button>
          </>
        }
      >
        <Paragraph>{t('projectDeleteConfirm')}</Paragraph>
      </Modal>
    </div>
  );
};

MyWorkEditorList.displayName = 'MyWorkEditorList';
