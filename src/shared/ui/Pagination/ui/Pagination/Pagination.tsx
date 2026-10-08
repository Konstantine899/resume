// src/shared/ui/Pagination/ui/Pagination/Pagination.tsx

import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { buildPageItems } from '../../lib/utils/buildPageItems';
import { PAGINATION_CONSTANTS } from '../../model/constants';
import type { PaginationProps } from '../../model/types';
import styles from './Pagination.module.scss';

/**
 * Pagination — presentational page-navigation control for lists.
 *
 * @remarks
 * - Purely presentational (plan A2): no internal state, no clamp of its own —
 *   `page`/`totalPages` come from the consuming container.
 * - `totalPages <= 1` renders nothing (plan A3).
 * - Edges keep prev/next visible but `disabled` (plan A3-bis).
 * - Every user-facing string, including aria-labels, goes through i18n (A4).
 *
 * @example
 * ```tsx
 * <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
 * ```
 */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  siblings = PAGINATION_CONSTANTS.DEFAULT_SIBLINGS,
  className = '',
}) => {
  const { t } = useLanguage();

  if (totalPages <= 1) {
    return null;
  }

  // Render-time derivation only (plan A2): the authoritative clamp lives in
  // the container — this keeps a miswired consumer from breaking the row.
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const items = buildPageItems(safePage, totalPages, siblings);

  return (
    <nav aria-label={t('paginationNav')} className={classNames(styles.nav, className)}>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        className={styles.edgeButton}
        aria-label={t('paginationPrevious')}
        disabled={safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </Button>

      <div className={styles.pages}>
        {items.map((item) => {
          if (item.type === 'ellipsis') {
            return (
              <span key={item.key} className={styles.ellipsis} aria-hidden="true">
                …
              </span>
            );
          }

          if (item.page === safePage) {
            return (
              <span key={`page-${item.page}`} className={styles.current} aria-current="page">
                {item.page}
              </span>
            );
          }

          return (
            <Button
              key={`page-${item.page}`}
              type="button"
              variant="ghost"
              size="xs"
              className={styles.pageButton}
              aria-label={t('paginationPage', { number: item.page })}
              onClick={() => onPageChange(item.page)}
            >
              {item.page}
            </Button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="xs"
        className={styles.edgeButton}
        aria-label={t('paginationNext')}
        disabled={safePage >= totalPages}
        onClick={() => onPageChange(safePage + 1)}
      >
        <ChevronRight size={16} aria-hidden="true" />
      </Button>
    </nav>
  );
};

Pagination.displayName = 'Pagination';
