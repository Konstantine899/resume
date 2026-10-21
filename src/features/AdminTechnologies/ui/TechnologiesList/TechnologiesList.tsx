// ============================================
// TechnologiesList — flat catalog vitrina (technologies-crud WU-3)
// ============================================
//
// Gold standard: SkillsEditorList + AdminJobs card parity. Flat rows
// from the store; row actions Pencil (outline) + Trash2 (danger)
// size=sm in Tooltip top; `.cellActions` (nowrap) ONLY on cell renders
// (PR #256).
//
// Pagination container (technologies-pagination, owner directive
// 2026-10-16, REVISED 2026-10-17): the LIST owns {page, pageSize}
// (sizes 5/10/20, DEFAULT 5), windows the rows as a render-time
// derivation (MyWork pilot rule — no setState-in-effect) and renders
// the kit PageSizeGroup ABOVE the table and the kit Pagination BELOW
// it, both under the «Add» header (owner directive 2026-10-17
// revises the 2026-10-16 «both controls above» directive: new DOM
// order = size group → table → pagination). The kit DataTable still
// cannot serve here: it owns neither split placement nor the default
// size. Table = kit Table; the sort toggle (asc → desc → none cycle,
// aria-sort, sort BEFORE windowing, sort resets the page) is
// preserved verbatim from the DataTable WU-5 decoration.
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
import { EmptyState } from '@/shared/ui/EmptyState';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { Pagination } from '@/shared/ui/Pagination';
import { PageSizeGroup } from '@/shared/ui/PageSizeGroup';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Table } from '@/shared/ui/Table';
import { Tooltip } from '@/shared/ui/Tooltip';
import React, { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { SortState } from '@/shared/ui/DataTable';
import type { Column } from '@/shared/ui/Table';
import {
  persistTechnologies,
  removeTechnology,
  selectAllTechnologies,
} from '@/entities/Technology';
import styles from './TechnologiesList.module.scss';

/** Sizes 5/10/20, default 5 — owner directive 2026-10-17. */
const PAGE_SIZES = [5, 10, 20] as const;
const DEFAULT_PAGE_SIZE = 5;

/**
 * Next step of the sort cycle for the SAME key: `null → asc → desc → null`
 * (DataTable WU-5 rule — the toggle semantics stay identical, only the
 * decoration moved into this container).
 */
function nextSort(current: SortState | null, key: string): SortState | null {
  if (!current || current.key !== key) return { key, direction: 'asc' };
  if (current.direction === 'asc') return { key, direction: 'desc' };
  return null;
}

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
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState<SortState | null>(null);

  // Sorting BEFORE windowing (DataTable WU-5 rule): page 2 must show rows
  // of the SORTED order. A COPY — the store array is never mutated.
  const sortedCatalog = useMemo(() => {
    if (!sort) return catalog;
    // Single sortable column (key) — string localeCompare, direction flip.
    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...catalog].sort((a, b) => direction * a.key.localeCompare(b.key));
  }, [catalog, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedCatalog.length / pageSize));
  // Container-owned clamp (Pagination pilot rule): a shrinking list derives
  // back into range during render — no setState-in-effect (react-hooks v7).
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const windowRows = sortedCatalog.slice((safePage - 1) * pageSize, safePage * pageSize);

  /** The kit PageSizeGroup is stateless — the container resets the window. */
  const handlePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  /** A sort the user cannot SEE reads as a broken button — reset the window. */
  const handleSortToggle = () => {
    setSort((current) => nextSort(current, 'key'));
    setPage(1);
  };

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

  // Sort decoration moved from the kit DataTable (kit Table is markup-only):
  // same bare-button header + `aria-sort` on the `<th>` (APG).
  const keyAriaSort =
    sort?.key === 'key' ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined;

  const columns: Column<(typeof catalog)[number]>[] = [
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
      header: (
        <button type="button" className={styles.sortButton} onClick={handleSortToggle}>
          {t('adminTechTableKey')}
        </button>
      ),
      ariaSort: keyAriaSort,
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
        <>
          {/* Owner directive 2026-10-17 (revises 2026-10-16 «both above»):
              the size group sits ABOVE the table, the pagination block
              BELOW it — DOM order size → table → pagination. Controls
              never disappear on interaction (2026-10-09 directive); an
              empty catalog renders the EmptyState above instead. */}
          <div className={styles.controls}>
            <PageSizeGroup sizes={PAGE_SIZES} value={pageSize} onChange={handlePageSize} />
          </div>
          <Table<(typeof catalog)[number]>
            caption={t('adminTechnologiesTitle')}
            columns={columns}
            rows={windowRows}
            getKey={(row) => row.key}
          />
          {/* Whole nav block below the table (numbers + arrows together —
              owner chose NOT to split them). */}
          <div className={styles.paginationRow}>
            <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
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
