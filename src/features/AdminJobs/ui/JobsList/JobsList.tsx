// ============================================
// JobsList — admin vitrina for the JOBS collection (jobs-detail-table WU-2)
// ============================================
//
// SPEC R-4/R-5 (variant A′ «record detail table»): the DataTable vitrina is
// replaced by one collapsible JobCard per record (default collapsed —
// owner directive 2026-10-13). The header carries the page-level kit
// Select sort (recent = selectSortedJobs date-desc, company, position
// [lang]) plus the kit IconButton add (SkillsEditorList:253-274 header
// pattern). Delete goes through the kit Modal confirm opened from the
// card's header Trash2 (R-5): subtitle names the company, focus lands on
// «Отмена». Pagination/PageSizeGroup leave WITH the DataTable — ≤15
// records render all (R-4, deliberate).
//
// Invariants:
// - persist BEFORE dispatch (§3): the next array is rebuilt from the
//   INSERTION-ORDER snapshot (selectAllJobs — store === storage
//   byte-for-byte, R-2), then deleteJob is dispatched. Only the RENDER
//   uses the sorted list; persisting the sorted array would silently
//   rewrite the stored order on every delete.
// - Sorting is local view state; sort never mutates the store array
//   (useMemo sorts a copy).
// - persist failure → adminJobPersistError toast, record untouched, the
//   confirm modal stays open for a retry (R-3).
// - ALL copy is i18n (i18n-first); `period` renders as stored (A5).

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { useConfirmAction } from '@/shared/lib/hooks/useConfirmAction';
import { classNames } from '@/shared/lib/utils/classNames';
import { Plus } from 'lucide-react';
import { Button, IconButton } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Modal } from '@/shared/ui/Modal';
import { Select } from '@/shared/ui/Select';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { SelectOption } from '@/shared/ui/Select';
import type { Job } from '@/entities/Job';
import { deleteJob } from '../../model/slices/jobsSlice';
import { selectAllJobs, selectSortedJobs } from '../../model/selectors';
import { persistJobs } from '../../model/services/storage';
import type { EditField } from '../JobForm/lib/fieldSchemas';
import { JobCard } from '../JobCard/JobCard';
import styles from './JobsList.module.scss';

/** Header Select modes (R-4): recent = selectSortedJobs, the others alpha. */
type SortMode = 'recent' | 'company' | 'position';

/** Language-aware position label with EN fallback (JobCard parity). */
const getPosition = (job: Job, language: string): string =>
  (language === 'ru' ? job.position.ru : job.position.en) || job.position.en;

export interface JobsListProps {
  className?: string;
  'data-testid'?: string;
  /** The page opens its create form. */
  onAddJob?: () => void;
  /** The page opens its edit form for this record. */
  onEditJob?: (job: Job) => void;
  /** The page opens the field-scoped modal for a scalar row (job-field-edit). */
  onEditField?: (job: Job, field: EditField) => void;
  /** The page clears a selection whose record was just deleted. */
  onJobDeleted?: (id: string) => void;
}

export const JobsList: React.FC<JobsListProps> = ({
  className = '',
  'data-testid': testId = 'admin-jobs-list',
  onAddJob,
  onEditJob,
  onEditField,
  onJobDeleted,
}) => {
  // Same-feature selector + dispatch — legal inside AdminJobs (§8).
  // Render is sorted per mode; the persist snapshot stays insertion-order (R-2).
  const jobs = useSelector(selectSortedJobs);
  const allJobs = useSelector(selectAllJobs);
  const dispatch = useDispatch();
  const { t, language } = useLanguage();
  const { addToast } = useToast();
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  // Destructive-confirm state machine extracted to the shared hook
  // (issue #302) — pending/confirming/cancelRef + persist-fail parity:
  // a failed write keeps the modal OPEN for a retry (R-3).
  const {
    pending,
    confirming: deleting,
    cancelRef,
    request: setPending,
    cancel: closeModal,
    confirm: handleConfirmDelete,
  } = useConfirmAction<string>({
    onConfirm: (id) => {
      // §3 order: persist → dispatch → toast → callback → close.
      // R-2: rebuild from the INSERTION-ORDER snapshot so storage keeps the
      // store's byte-for-byte order; the sorted array above is render-only.
      const next = allJobs.filter((job) => job.id !== id);
      if (!persistJobs(next)) {
        // R-3 / Skills OPEN-9 parity: keep the modal OPEN for a retry.
        addToast({ message: t('adminJobPersistError'), type: 'error' });
        return false;
      }
      dispatch(deleteJob(id));
      addToast({ message: t('adminJobDeleted'), type: 'success' });
      onJobDeleted?.(id);
      return true;
    },
  });

  // R-4: recent keeps the selector order as-is; company/position alpha-sort
  // a COPY so the store array is never mutated.
  const sortedJobs = useMemo(() => {
    if (sortMode === 'company') {
      return [...jobs].sort((a, b) => a.company.localeCompare(b.company));
    }
    if (sortMode === 'position') {
      return [...jobs].sort((a, b) =>
        getPosition(a, language).localeCompare(getPosition(b, language))
      );
    }
    return jobs;
  }, [jobs, sortMode, language]);

  const sortOptions: SelectOption[] = [
    { value: 'recent', label: t('adminJobsSortRecent') },
    { value: 'company', label: t('adminJobsSortCompany') },
    { value: 'position', label: t('adminJobsSortPosition') },
  ];

  const pendingJob = pending === null ? undefined : allJobs.find((job) => job.id === pending);

  return (
    <div className={classNames(styles.root, className)} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.intro}>
          <Heading level={2}>{t('adminJobs')}</Heading>
        </div>
        <div className={styles.headerActions}>
          <Select
            id="admin-jobs-sort"
            data-testid="admin-jobs-sort"
            label={t('adminJobsSort')}
            size="sm"
            options={sortOptions}
            value={sortMode}
            onChange={(value) => {
              if (value === 'recent' || value === 'company' || value === 'position') {
                setSortMode(value);
              }
            }}
          />
          <IconButton
            variant="primary"
            size="md"
            ariaLabel={t('adminAddJob')}
            icon={<Icon name={Plus} size={20} color="inherit" decorative />}
            onClick={() => onAddJob?.()}
          />
        </div>
      </div>

      {sortedJobs.length === 0 && <EmptyState title={t('adminJobsEmpty')} />}
      {sortedJobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onEditJob={onEditJob}
          onEditField={onEditField}
          onDeleteJob={(id) => setPending(id)}
        />
      ))}

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
