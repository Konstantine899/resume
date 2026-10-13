// ============================================
// JobCard — one collapsible job record + detail table (jobs-detail-table WU-1)
// ============================================
//
// SPEC R-1..R-3 (variant A′ «record detail table»): every job renders as a
// kit Card — COLLAPSED by default (owner directive 2026-10-13, Skills rev.4
// parity). Collapsed: the company caption sits OUTSIDE the Card and the
// whole Card body is the strip expand button (Plus, `aria-expanded="true"`
// — intentional Skills quirk). Expanded: header (Minus collapse + h3 +
// current/featured Badges + Pencil/Trash2 actions) and, under the stable
// `contentId`, the kit Table `[Данные | Значение | Действия]` with every
// record field: position, period, location, company URL (kit Link, row
// only when present — honest data), technologies and one row per
// description[language] paragraph.
//
// Invariants:
// - Inline bullet CRUD (↑ ↓ Trash2) persists BEFORE dispatch (R-3): the
//   next array is rebuilt from the INSERTION-ORDER `selectAllJobs` snapshot
//   via `applyJobUpdate`, `persistJobs` runs first, and only a successful
//   persist dispatches `updateJob` — store === storage.
// - persist failure → `adminJobPersistError` toast, store untouched.
// - Bullet disabled parity with JobForm ×: ↑ first, ↓ last, Trash2 when
//   `description[lang].length <= 1`; no confirm on remove (inline parity).
// - ALL copy is i18n (i18n-first); `period` renders as stored (A5).
// - Collapse state is INTERNAL (no persistence) and keyed per job.id.

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { ArrowDown, ArrowUp, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { IconButton } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Link } from '@/shared/ui/Link';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Table } from '@/shared/ui/Table';
import { Tooltip } from '@/shared/ui/Tooltip';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { ReactNode } from 'react';
import type { Column } from '@/shared/ui/Table';
import type { Job } from '@/entities/Job';
import { applyJobUpdate, updateJob } from '../../model/slices/jobsSlice';
import { selectAllJobs } from '../../model/selectors/selectors';
import { persistJobs } from '../../model/services/storage';
import styles from './JobCard.module.scss';

/** One scalar record field: label (i18n key) → display value. */
type FieldRow = {
  kind: 'field';
  key: string;
  label: string;
  value: ReactNode;
};

/** One achievement paragraph from `description[language]`. */
type BulletRow = {
  kind: 'bullet';
  key: string;
  index: number;
  text: string;
};

type Row = FieldRow | BulletRow;

export interface JobCardProps {
  job: Job;
  className?: string;
  'data-testid'?: string;
  /** The page opens its edit form for this record. */
  onEditJob?: (job: Job) => void;
  /** The list closes its confirm flow / clears selection for this record. */
  onDeleteJob?: (id: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  className = '',
  'data-testid': testId,
  onEditJob,
  onDeleteJob,
}) => {
  // Same-feature selector + dispatch — legal inside AdminJobs (§8). The
  // snapshot stays INSERTION-ORDER so the persisted array keeps it (R-2).
  const snapshot = useSelector(selectAllJobs);
  const dispatch = useDispatch();
  const { t, language } = useLanguage();
  const { addToast } = useToast();
  // Internal collapse state, absent = COLLAPSED (owner directive 2026-10-13).
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isCollapsed = collapsed[job.id] ?? true;
  // Stable per-job id: aria-controls resolves before AND after the
  // unmount/remount roundtrip (rev.4 ARA test).
  const contentId = `job-card-content-${job.id}`;
  const expandLabel = t('adminJobExpand', { company: job.company });
  const collapseLabel = t('adminJobCollapse', { company: job.company });
  const bullets = job.description[language];

  const expandCard = () => setCollapsed((prev) => ({ ...prev, [job.id]: false }));
  const collapseCard = () => setCollapsed((prev) => ({ ...prev, [job.id]: true }));

  /** description patch for a given list, language-safe (en|ru union key). */
  const descriptionWith = (base: Job['description'], list: string[]): Job['description'] => ({
    ...base,
    ...(language === 'ru' ? { ru: list } : { en: list }),
  });

  /** R-3 order: snapshot → applyJobUpdate → persist → dispatch. */
  const updateBullets = (nextList: string[]) => {
    const nextSnapshot = snapshot.map((entry) =>
      entry.id === job.id
        ? applyJobUpdate(entry, {
            id: entry.id,
            description: descriptionWith(entry.description, nextList),
          })
        : entry
    );
    if (!persistJobs(nextSnapshot)) {
      addToast({ message: t('adminJobPersistError'), type: 'error' });
      return;
    }
    dispatch(updateJob({ id: job.id, description: descriptionWith(job.description, nextList) }));
  };

  /** JobForm move parity: splice out, splice in at index + delta (guarded). */
  const moveBullet = (index: number, delta: -1 | 1) => {
    const list = [...bullets];
    const target = index + delta;
    const [moved] = list.splice(index, 1);
    if (moved !== undefined && target >= 0 && target < list.length + 1) {
      list.splice(target, 0, moved);
      updateBullets(list);
    }
  };

  /** JobForm remove parity: filter by index, no confirm (inline ×). */
  const removeBullet = (index: number) => {
    updateBullets(bullets.filter((_, i) => i !== index));
  };

  // Discriminated rows rebuilt per render (SPEC R-2). Honest data: the
  // location row is skipped when empty, the URL row only exists with a
  // companyUrl, technologies only when the array is non-empty.
  const rows: Row[] = [
    {
      kind: 'field',
      key: 'position',
      label: t('adminJobsTablePosition'),
      // JobsList getPosition parity: RU falls back to EN when empty.
      value: (language === 'ru' ? job.position.ru : job.position.en) || job.position.en,
    },
    { kind: 'field', key: 'period', label: t('adminJobsTablePeriod'), value: job.period },
  ];
  if (job.location !== '') {
    rows.push({
      kind: 'field',
      key: 'location',
      label: t('adminJobLocation'),
      value: job.location,
    });
  }
  if (job.companyUrl) {
    rows.push({
      kind: 'field',
      key: 'companyUrl',
      label: t('adminJobCompanyUrl'),
      value: (
        <Link href={job.companyUrl} external>
          {job.companyUrl}
        </Link>
      ),
    });
  }
  if (job.technologies.length > 0) {
    rows.push({
      kind: 'field',
      key: 'technologies',
      label: t('adminJobTechnologies'),
      value: job.technologies.join(', '),
    });
  }
  bullets.forEach((text, index) => {
    rows.push({ kind: 'bullet', key: `bullet-${index}`, index, text });
  });

  const renderBulletActions = (row: BulletRow) => (
    <div className={styles.actions} data-testid={`job-bullet-actions-${job.id}-${row.index}`}>
      <Tooltip content={t('adminJobBulletUp')} position="top" showDelay={0}>
        <IconButton
          type="button"
          variant="outline"
          size="sm"
          disabled={row.index === 0}
          icon={<Icon name={ArrowUp} size={20} color="inherit" decorative />}
          ariaLabel={t('adminJobBulletUp')}
          onClick={() => moveBullet(row.index, -1)}
        />
      </Tooltip>
      <Tooltip content={t('adminJobBulletDown')} position="top" showDelay={0}>
        <IconButton
          type="button"
          variant="outline"
          size="sm"
          disabled={row.index === bullets.length - 1}
          icon={<Icon name={ArrowDown} size={20} color="inherit" decorative />}
          ariaLabel={t('adminJobBulletDown')}
          onClick={() => moveBullet(row.index, 1)}
        />
      </Tooltip>
      <Tooltip content={t('adminJobRemoveBullet')} position="top" showDelay={0}>
        <IconButton
          type="button"
          variant="danger"
          size="sm"
          disabled={bullets.length <= 1}
          icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
          ariaLabel={t('adminJobRemoveBullet')}
          onClick={() => removeBullet(row.index)}
        />
      </Tooltip>
    </div>
  );

  const columns: Column<Row>[] = [
    {
      key: 'field',
      header: t('adminJobsTableField'),
      render: (row) =>
        row.kind === 'field'
          ? row.label
          : // The description label rides the FIRST bullet row only —
            // repeating it on every achievement adds noise, not information.
            row.index === 0
            ? t('adminJobDescription')
            : '',
    },
    {
      key: 'value',
      header: t('adminJobsTableValue'),
      render: (row) =>
        row.kind === 'field' ? (
          row.value
        ) : (
          <Paragraph asChild size="xs" theme="primary" align="left">
            <span>{row.text}</span>
          </Paragraph>
        ),
    },
    {
      key: 'actions',
      header: t('adminJobsTableActions'),
      render: (row) =>
        row.kind === 'field' ? (
          <div className={styles.actions}>
            <Tooltip content={t('adminEditJob')} position="top" showDelay={0}>
              <IconButton
                type="button"
                variant="outline"
                size="sm"
                icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
                ariaLabel={t('adminEditJob')}
                onClick={() => onEditJob?.(job)}
              />
            </Tooltip>
          </div>
        ) : (
          renderBulletActions(row)
        ),
    },
  ];

  return (
    <div className={classNames(styles.root, className)} data-testid={testId}>
      {isCollapsed && (
        // OPEN-2=B1 parity: caption OUTSIDE the Card, above the strip.
        <div className={styles.caption} data-testid={`job-card-caption-${job.id}`}>
          {job.company}
        </div>
      )}
      <Card
        variant="default"
        size="default"
        hoverable={false}
        className={styles.block}
        data-testid={`job-card-${job.id}`}
      >
        {isCollapsed ? (
          // Whole Card body = expand button (Plus left, .strip.strip).
          <Tooltip content={expandLabel} position="top" showDelay={0}>
            <IconButton
              type="button"
              variant="outline"
              size="md"
              fullWidth
              className={styles.strip}
              icon={<Icon name={Plus} size={20} color="inherit" decorative />}
              ariaLabel={expandLabel}
              aria-expanded="true"
              onClick={expandCard}
            />
          </Tooltip>
        ) : (
          <>
            <div className={styles.blockHeader}>
              <div className={styles.headerMain}>
                <Tooltip content={collapseLabel} position="top" showDelay={0}>
                  <IconButton
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<Icon name={Minus} size={20} color="inherit" decorative />}
                    ariaLabel={collapseLabel}
                    aria-expanded="false"
                    aria-controls={contentId}
                    onClick={collapseCard}
                  />
                </Tooltip>
                <Heading level={3}>
                  {job.company}
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
                </Heading>
              </div>
              <div className={styles.actions} data-testid={`job-card-actions-${job.id}`}>
                <Tooltip content={t('adminEditJob')} position="top" showDelay={0}>
                  <IconButton
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<Icon name={Pencil} size={20} color="inherit" decorative />}
                    ariaLabel={t('adminEditJob')}
                    onClick={() => onEditJob?.(job)}
                  />
                </Tooltip>
                <Tooltip content={t('adminJobDelete')} position="top" showDelay={0}>
                  <IconButton
                    type="button"
                    variant="danger"
                    size="sm"
                    icon={<Icon name={Trash2} size={20} color="inherit" decorative />}
                    ariaLabel={t('adminJobDelete')}
                    onClick={() => onDeleteJob?.(job.id)}
                  />
                </Tooltip>
              </div>
            </div>

            <div className={styles.blockContent} id={contentId}>
              <Table<Row>
                caption={t('adminJobs')}
                columns={columns}
                rows={rows}
                getKey={(row) => row.key}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

JobCard.displayName = 'JobCard';
