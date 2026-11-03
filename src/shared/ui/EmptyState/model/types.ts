// src/shared/ui/EmptyState/model/types.ts

import type { ReactNode } from 'react';

/**
 * Horizontal alignment of the whole block (title, description, action).
 */
export type EmptyStateAlign = 'center' | 'left';

/**
 * Props of the kit empty-state primitive (plan_kit_empty_state rev.3).
 *
 * @remarks
 * Slots, not logic (plan A4): the component knows nothing about lists,
 * routes or data length. Every string arrives from the consumer through
 * `title`/`description`/`action` (plan A2 — no i18n inside kit).
 */
export interface EmptyStateProps {
  /** Visible heading text or node — required, owned by the consumer. */
  title: ReactNode;
  /** Optional muted explanation under the title. */
  description?: ReactNode;
  /** Optional CTA slot — the consumer draws its own kit `Button` with `t()`. */
  action?: ReactNode;
  /** Block alignment; defaults to `center`. */
  align?: EmptyStateAlign;
  /** Tighter padding for dashboard cards. */
  compact?: boolean;
  /** Merged onto the root element. */
  className?: string;
}
