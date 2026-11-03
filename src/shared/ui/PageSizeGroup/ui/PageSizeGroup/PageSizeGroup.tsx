// src/shared/ui/PageSizeGroup/ui/PageSizeGroup/PageSizeGroup.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { Button } from '@/shared/ui/Button';
import { useId } from 'react';
import type { PageSizeGroupProps } from '../../model/types';
import styles from './PageSizeGroup.module.scss';

/**
 * Kit page-size control (plan_kit_datatable rev.5, decision A5-bis).
 *
 * @remarks
 * - Stateless (plan A2 principle): `value`/`onChange` are container-owned —
 *   no internal state, no effects, no clamp.
 * - The visible caption and the group's accessible name share ONE i18n
 *   string via `aria-labelledby` (owner directive 2026-10-09: sighted users
 *   must not see a bare «5 10 20»; pattern proven in MyWork).
 * - Empty `sizes` renders nothing (contract guard).
 *
 * @example
 * ```tsx
 * <PageSizeGroup sizes={[5, 10, 20]} value={pageSize} onChange={setPageSize} />
 * ```
 */
export function PageSizeGroup({ sizes, value, onChange, className }: PageSizeGroupProps) {
  const { t } = useLanguage();
  const labelId = useId();

  if (sizes.length === 0) {
    return null;
  }

  return (
    <div role="group" aria-labelledby={labelId} className={classNames(styles.sizeGroup, className)}>
      <span id={labelId} className={styles.sizeLabel}>
        {t('perPageLabel')}
      </span>
      {sizes.map((size) => (
        <Button
          key={size}
          variant="ghost"
          size="sm"
          className={styles.sizeButton}
          aria-pressed={value === size}
          onClick={() => onChange(size)}
        >
          {size}
        </Button>
      ))}
    </div>
  );
}
