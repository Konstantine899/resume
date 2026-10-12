// ============================================
// JobsList — admin rows for the JOBS collection (WorkHistory CRUD WU-5)
// ============================================
//
// Stage-1 CRUD (plan §9): sorted rows (company, position[lang], period,
// current/featured badges, Edit/Delete), the empty state, and Delete via
// the kit Modal confirm (§6, never window.confirm). The page owns the
// open form — this list only fires callbacks (SkillsEditorList pattern).
//
// Invariants:
// - persist BEFORE dispatch (§3): the next array is rebuilt from the
//   INSERTION-ORDER snapshot (selectAllJobs — store === storage byte-for-byte,
//   R-2), then deleteJob is dispatched. Only the RENDER uses the
//   date-sorted selector; persisting the sorted array would silently
//   rewrite the stored order on every delete.
// - persist failure → adminJobPersistError toast, record untouched.
// - ALL copy is i18n (i18n-first); `period` renders as stored (A5).

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Heading } from '@/shared/ui/Heading';
import { Modal } from '@/shared/ui/Modal';
import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Job } from '@/entities/Job';
import { deleteJob } from '../../model/slices/jobsSlice';
import { selectAllJobs, selectSortedJobs } from '../../model/selectors';
import { persistJobs } from '../../model/services/storage';
import styles from './JobsList.module.scss';

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

  return (
    <div className={classNames(styles.root, className)} data-testid={testId}>
      <div className={styles.header}>
        <div className={styles.intro}>
          <Heading level={2}>{t('adminJobs')}</Heading>
        </div>
        <Button type="button" variant="primary" size="sm" onClick={() => onAddJob?.()}>
          {t('adminAddJob')}
        </Button>
      </div>

      {jobs.length === 0 ? (
        <EmptyState title={t('adminJobsEmpty')} />
      ) : (
        <ul className={styles.list} aria-label={t('adminJobs')}>
          {jobs.map((job) => (
            <li key={job.id} className={styles.row} data-testid={`job-row-${job.id}`}>
              <div className={styles.rowMain}>
                <div className={styles.info}>
                  <Heading level={3}>{job.company}</Heading>
                  <span className={styles.position}>{getPosition(job)}</span>
                  <span className={styles.period}>{job.period}</span>
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
                <div className={styles.actions} data-testid={`job-actions-${job.id}`}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEditJob?.(job)}
                  >
                    {t('adminEditJob')}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setPending(job.id)}
                  >
                    {t('adminJobDelete')}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

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
