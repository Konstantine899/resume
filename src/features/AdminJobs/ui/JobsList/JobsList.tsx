// ============================================
// JobsList — admin vitrina for the JOBS collection (admin-jobs-refactor WU-6)
// ============================================
//
// Stage-1 CRUD list (plan §9) on the kit DataTable (SPEC R-6): columns
// company / position[lang] / period / flags (current+featured badges) /
// actions (Edit/Delete via kit Button), controlled sorting + pagination
// (plan_kit_datatable rev.5 — page-size top-right, navigation below
// centered, controls visible whenever rows exist). The header carries the
// kit IconButton add (SkillsEditorList:232-238 header pattern); Delete goes
// through the kit Modal confirm (§6, never window.confirm). The page owns
// the open form — this list only fires callbacks.
//
// Invariants:
// - persist BEFORE dispatch (§3): the next array is rebuilt from the
//   INSERTION-ORDER snapshot (selectAllJobs — store === storage byte-for-byte,
//   R-2), then deleteJob is dispatched. Only the RENDER uses the
//   date-sorted selector; persisting the sorted array would silently
//   rewrite the stored order on every delete.
// - Sorting is CONTROLLED: a header click only emits `onSortChange`; a
//   sort resets the page to 1 (Skills WU-5a — a sort the user cannot SEE
//   reads as a broken button).
// - persist failure → adminJobPersistError toast, record untouched, the
//   confirm modal stays open for a retry (R-3).
// - ALL copy is i18n (i18n-first); `period` renders as stored (A5).

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Plus } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { Button, IconButton } from '@/shared/ui/Button';
import { DataTable } from '@/shared/ui/DataTable';
import type { DataTableColumn, SortState } from '@/shared/ui/DataTable';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Job } from '@/entities/Job';
import { deleteJob } from '../../model/slices/jobsSlice';
import { selectAllJobs, selectSortedJobs } from '../../model/selectors';
import { persistJobs } from '../../model/services/storage';
import styles from './JobsList.module.scss';

/**
 * Default rows per page + the kit `PageSizeGroup` options — mirror of
 * SkillsEditorList (verdict OPEN-1/OPEN-5 of the Skills plan).
 */
const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS: readonly number[] = [5, 10, 20];

export interface JobsListProps {
  className?: string;
  'data-testid'?: string;
  /** The page opens its create form. */
  onAddJob?: () => void;
  /** The page opens its edit form for this record. */
  onEditJob?: (job: Job) => void;
  /** The page clears a selection whose record was just deleted. */
  onJobDeleted?: (id: string) => void;
}

export const JobsList: React.FC<JobsListProps> = ({
  className = '',
  'data-testid': testId = 'admin-jobs-list',
  onAddJob,
  onEditJob,
  onJobDeleted,
}) => {
  // Same-feature selector + dispatch — legal inside AdminJobs (§8).
  // Render is date-sorted; the persist snapshot stays insertion-order (R-2).
  const jobs = useSelector(selectSortedJobs);
  const allJobs = useSelector(selectAllJobs);
  const dispatch = useDispatch();
  const { t, language } = useLanguage();
  const { addToast } = useToast();
  const [pending, setPending] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Destructive-confirm pattern (SkillsEditorList §6): focus lands on «Отмена».
  const cancelRef = useRef<HTMLButtonElement>(null);
  // Controlled DataTable state (kit A2): the container owns page/size/sort.
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState<SortState | null>(null);

  const closeModal = () => {
    setPending(null);
    setDeleting(false);
  };

  /** §3 order: persist → dispatch → toast → callback → close. */
  const handleConfirmDelete = () => {
    if (!pending) return;
    setDeleting(true);
    // R-2: rebuild from the INSERTION-ORDER snapshot so storage keeps the
    // store's byte-for-byte order; the sorted array above is render-only.
    const next = allJobs.filter((job) => job.id !== pending);
    if (!persistJobs(next)) {
      // R-3 / Skills OPEN-9 parity: keep the modal OPEN for a retry.
      addToast({ message: t('adminJobPersistError'), type: 'error' });
      setDeleting(false);
      return;
    }
    dispatch(deleteJob(pending));
    addToast({ message: t('adminJobDeleted'), type: 'success' });
    onJobDeleted?.(pending);
    closeModal();
  };

  const pendingJob = pending === null ? undefined : allJobs.find((job) => job.id === pending);

  const getPosition = (job: Job): string =>
    (language === 'ru' ? job.position.ru : job.position.en) || job.position.en;

  /** Columns of the vitrina (SPEC R-6): company / position / period / flags / actions. */
  const columns: DataTableColumn<Job>[] = [
    {
      key: 'company',
      header: t('adminJobsTableCompany'),
      sortable: true,
      sortValue: (job) => job.company,
      render: (job) => (
        <span className={styles.companyCell} data-testid={`job-row-${job.id}`}>
          {/* A6: no heading elements inside cells — <strong> label. */}
          <strong>{job.company}</strong>
        </span>
      ),
    },
    {
      key: 'position',
      header: t('adminJobsTablePosition'),
      sortable: true,
      sortValue: getPosition,
      render: (job) => <span className={styles.position}>{getPosition(job)}</span>,
    },
    {
      key: 'period',
      header: t('adminJobsTablePeriod'),
      sortable: true,
      // Dates compare as values, not as their display strings (kit A3).
      sortValue: (job) => job.startDate.getTime(),
      render: (job) => <span className={styles.period}>{job.period}</span>,
    },
    {
      key: 'flags',
      header: t('adminJobsTableFlags'),
      render: (job) => (
        <div className={styles.badges}>
          {job.current && (
            <Badge variant="accent" size="sm">
              {t('adminJobCurrent')}
            </Badge>
          )}
          {job.featured && (
            <Badge variant="outline" size="sm">
              {t('adminJobFeatured')}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('adminJobsTableActions'),
      render: (job) => (
        <div className={styles.actions} data-testid={`job-actions-${job.id}`}>
          <Button type="button" variant="outline" size="sm" onClick={() => onEditJob?.(job)}>
            {t('adminEditJob')}
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={() => setPending(job.id)}>
            {t('adminJobDelete')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={classNames(styles.root, className)} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.intro}>
          <Heading level={2}>{t('adminJobs')}</Heading>
        </div>
        <IconButton
          variant="primary"
          size="md"
          ariaLabel={t('adminAddJob')}
          icon={<Icon name={Plus} size={20} color="inherit" decorative />}
          onClick={() => onAddJob?.()}
        />
      </div>

      <DataTable<Job>
        caption={t('adminJobs')}
        columns={columns}
        rows={jobs}
        getKey={(job) => job.id}
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
        emptyState={<EmptyState title={t('adminJobsEmpty')} />}
      />

      <Modal
        isOpen={pending !== null}
        onClose={closeModal}
        // R-3: title ≠ button label (the button stays adminJobDelete); the
        // subtitle NAMES the company (adminJobConfirmDeleteName, OPEN-10
        // parity with skillsConfirmDelete={{name}}).
        title={t('adminJobConfirmDelete')}
        subtitle={
          pendingJob ? t('adminJobConfirmDeleteName', { company: pendingJob.company }) : undefined
        }
        size="sm"
        initialFocusRef={cancelRef}
        footer={
          <>
            <Button ref={cancelRef} type="button" variant="outline" onClick={closeModal}>
              {t('adminJobCancel')}
            </Button>
            <Button type="button" variant="danger" loading={deleting} onClick={handleConfirmDelete}>
              {t('adminJobDelete')}
            </Button>
          </>
        }
      >
        {null}
      </Modal>
    </div>
  );
};

JobsList.displayName = 'JobsList';
