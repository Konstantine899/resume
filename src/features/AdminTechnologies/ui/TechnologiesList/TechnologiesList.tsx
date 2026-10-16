// ============================================
// TechnologiesList — flat catalog vitrina (technologies-crud WU-3)
// ============================================
//
// Gold standard: SkillsEditorList + AdminJobs card parity. One kit
// DataTable over the FLAT store array (PAGE_SIZE = 12, controlled sort
// by key); row actions Pencil (outline) + Trash2 (danger) size=sm in
// Tooltip top; `.cellActions` (nowrap) ONLY on cell renders (PR #256).
//
// Invariants:
// - persist BEFORE dispatch (§3): the next array is rebuilt from the
//   `catalog` snapshot, then the action is dispatched — store === storage.
// - D6 guard: `usedKeys` (keys referenced by ANY project — the page
//   builds it from selectAllProjects) blocks deletion; the error renders
//   INSIDE the still-open confirm modal, nothing is persisted/dispatched.
// - Storage failure keeps the modal OPEN for a retry (OPEN-9 parity).
// - The confirm subtitle NAMES the deleting key (OPEN-10 parity);
//   initialFocusRef lands on «Отмена»; the body is {null} unless the
//   guard fired (kit ModalProps.children is required).
// - ALL copy is i18n (i18n-first).

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button, IconButton } from '@/shared/ui/Button';
import { DataTable } from '@/shared/ui/DataTable';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Tooltip } from '@/shared/ui/Tooltip';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  persistTechnologies,
  removeTechnology,
  selectAllTechnologies,
} from '@/entities/Technology';
import type { DataTableColumn, SortState } from '@/shared/ui/DataTable';
import styles from './TechnologiesList.module.scss';

/** Rows per page — SPEC: flat table, fixed window. */
const PAGE_SIZE = 12;

export interface TechnologiesListProps {
  className?: string;
  'data-testid'?: string;
  /** Keys referenced by ANY project — D6: those records cannot be deleted. */
  usedKeys?: ReadonlySet<string>;
  /** The page opens its create form. */
  onAddTechnology?: () => void;
  /** The page opens its edit form for this record. */
  onEditTechnology?: (key: string) => void;
  /** The page clears a stale selection when the record is deleted. */
  onTechnologyDeleted?: (key: string) => void;
}

export const TechnologiesList: React.FC<TechnologiesListProps> = ({
  className = '',
  'data-testid': testId = 'technologies-list',
  usedKeys,
  onAddTechnology,
  onEditTechnology,
  onTechnologyDeleted,
}) => {
  const catalog = useSelector(selectAllTechnologies);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // D6 guard error — rendered INSIDE the confirm modal, which stays open.
  const [guardError, setGuardError] = useState<string | null>(null);
  // Destructive-confirm pattern: focus lands on «Отмена» after open.
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState | null>(null);

  const closeModal = () => {
    setPendingKey(null);
    setDeleting(false);
    setGuardError(null);
  };

  /** §3 order: guard → persist → dispatch → toast → callback → close. */
  const handleConfirmDelete = () => {
    if (pendingKey === null) return;

    // D6: a key any project references is off-limits — error in-modal.
    if (usedKeys?.has(pendingKey)) {
      setGuardError(t('adminTechDeleteInUse'));
      return;
    }

    setDeleting(true);
    const next = catalog.filter((tech) => tech.key !== pendingKey);
    if (!persistTechnologies(next)) {
      // Failure keeps the modal OPEN for a retry (unified with the forms).
      addToast({ message: t('adminTechPersistError'), type: 'error' });
      setDeleting(false);
      return;
    }
    dispatch(removeTechnology(pendingKey));
    addToast({ message: t('adminTechDeleted'), type: 'success' });
    onTechnologyDeleted?.(pendingKey);
    closeModal();
  };

  const columns: DataTableColumn<(typeof catalog)[number]>[] = [
    {
      key: 'icon',
      header: t('adminTechTableIcon'),
      render: (row) => (
        <img
          className={classNames(styles.icon, row.invertInDark && styles.iconInvert)}
          data-testid={`tech-icon-${row.key}`}
          src={row.url}
          alt=""
        />
      ),
    },
    {
      key: 'key',
      header: t('adminTechTableKey'),
      sortable: true,
      sortValue: (row) => row.key,
      render: (row) => (
        <span className={styles.keyCell} data-testid={`tech-row-${row.key}`}>
          <strong>{row.key}</strong>
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('adminTechTableActions'),
      render: (row) => (
        <div className={styles.cellActions} data-testid={`tech-actions-${row.key}`}>
          <Tooltip content={t('adminTechnologiesEdit')} position="top" showDelay={0}>
            <IconButton
              type="button"
              variant="outline"
              size="sm"
              icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
              ariaLabel={t('adminTechnologiesEdit')}
              onClick={() => onEditTechnology?.(row.key)}
            />
          </Tooltip>
          <Tooltip content={t('adminTechnologiesDelete')} position="top" showDelay={0}>
            <IconButton
              type="button"
              variant="danger"
              size="sm"
              icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
              ariaLabel={t('adminTechnologiesDelete')}
              onClick={() => {
                setGuardError(null);
                setPendingKey(row.key);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className={classNames(styles.root, className)} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.intro}>
          <Heading level={2}>{t('adminTechnologiesTitle')}</Heading>
          <Paragraph theme="muted">{t('adminTechnologiesHint')}</Paragraph>
        </div>
        <div className={styles.headerActions}>
          <Tooltip content={t('adminTechnologiesAdd')} position="top" showDelay={0}>
            <IconButton
              type="button"
              variant="primary"
              size="md"
              icon={<Icon name={Plus} size={20} color="inherit" decorative />}
              ariaLabel={t('adminTechnologiesAdd')}
              onClick={() => onAddTechnology?.()}
            />
          </Tooltip>
        </div>
      </div>

      {catalog.length === 0 ? (
        <EmptyState title={t('adminTechnologiesEmpty')} />
      ) : (
        <DataTable<(typeof catalog)[number]>
          caption={t('adminTechnologiesTitle')}
          columns={columns}
          rows={catalog}
          getKey={(row) => row.key}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          sort={sort}
          onSortChange={(next) => {
            setSort(next);
            // A sort the user cannot SEE reads as a broken button.
            setPage(1);
          }}
        />
      )}

      <Modal
        isOpen={pendingKey !== null}
        onClose={closeModal}
        title={t('adminTechnologiesDelete')}
        // The confirm copy NAMES the entity (OPEN-10 parity).
        subtitle={
          pendingKey !== null ? t('adminTechConfirmDelete', { name: pendingKey }) : undefined
        }
        size="sm"
        initialFocusRef={cancelRef}
        footer={
          <>
            <Button ref={cancelRef} type="button" variant="outline" onClick={closeModal}>
              {t('adminTechCancel')}
            </Button>
            <Button type="button" variant="danger" loading={deleting} onClick={handleConfirmDelete}>
              {t('adminTechnologiesDelete')}
            </Button>
          </>
        }
      >
        {guardError !== null ? (
          <Paragraph asChild theme="error" size="s">
            <span role="alert">{guardError}</span>
          </Paragraph>
        ) : null}
      </Modal>
    </div>
  );
};

TechnologiesList.displayName = 'TechnologiesList';
