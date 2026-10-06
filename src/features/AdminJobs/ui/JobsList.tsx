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
//   sorted snapshot, then deleteJob is dispatched — store === storage.
// - persist failure → adminJobPersistError toast, record untouched.
// - ALL copy is i18n (i18n-first); `period` renders as stored (A5).

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
import type { Job } from '@/entities/Job';
import { deleteJob } from '../model/slices/jobsSlice';
import { selectSortedJobs } from '../model/selectors';
import { persistJobs } from '../model/services/storage';
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
  const jobs = useSelector(selectSortedJobs);
  const dispatch = useDispatch();
  const { t, language } = useLanguage();
  const { addToast } = useToast();
  const [pending, setPending] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const closeModal = () => {
    setPending(null);
    setDeleting(false);
  };

  /** §3 order: persist → dispatch → toast → callback → close. */
  const handleConfirmDelete = () => {
    if (!pending) return;
    setDeleting(true);
    const next = jobs.filter((job) => job.id !== pending);
    if (!persistJobs(next)) {
      addToast({ message: t('adminJobPersistError'), type: 'error' });
      closeModal();
      return;
    }
    dispatch(deleteJob(pending));
    addToast({ message: t('adminJobDeleted'), type: 'success' });
    onJobDeleted?.(pending);
    closeModal();
  };

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
        <Paragraph theme="muted">{t('adminJobsEmpty')}</Paragraph>
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
        title={t('adminJobDelete')}
        size="sm"
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeModal}>
              {t('adminJobCancel')}
            </Button>
            <Button type="button" variant="danger" loading={deleting} onClick={handleConfirmDelete}>
              {t('adminJobDelete')}
            </Button>
          </>
        }
      >
        <Paragraph>{t('adminJobConfirmDelete')}</Paragraph>
      </Modal>
    </div>
  );
};

JobsList.displayName = 'JobsList';
