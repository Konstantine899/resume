// src/shared/ui/EmptyState/ui/EmptyState/EmptyState.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { Paragraph } from '@/shared/ui/Paragraph';
import type { EmptyStateProps } from '../../model/types';
import styles from './EmptyState.module.scss';

/**
 * Kit empty-state primitive (plan_kit_empty_state rev.3).
 *
 * @remarks
 * Slots, not logic (plan A4): the component renders title + optional
 * description + optional action and knows nothing about lists, routes
 * or data length. All strings come from the consumer through `t()`
 * (plan A2 — no i18n inside kit). The title slot takes any `ReactNode`,
 * so a consumer needing heading semantics passes kit `Heading` itself;
 * the kit does not guess a heading level on the consumer's behalf.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   title={t('adminDashboardEmpty')}
 *   action={<Button onClick={reload}>{t('retry')}</Button>}
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  action,
  align = 'center',
  compact,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={classNames(
        styles.emptyState,
        align === 'left' ? styles.alignLeft : styles.alignCenter,
        compact && styles.compact,
        className
      )}
    >
      <div className={styles.title}>{title}</div>
      {description != null && (
        <Paragraph theme="muted" className={styles.description}>
          {description}
        </Paragraph>
      )}
      {action != null && <div className={styles.action}>{action}</div>}
    </div>
  );
}
