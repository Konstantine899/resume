// src/shared/ui/PageSizeGroup/model/types.ts

/**
 * Props of the kit page-size control (plan_kit_datatable rev.5, A5-bis).
 *
 * @remarks
 * Stateless by design (plan A2 principle): the container owns the active
 * size and reacts to clicks — no internal `useState`, no effects.
 */
export interface PageSizeGroupProps {
  /** Sizes to render, e.g. `[5, 10, 20]`. Order is preserved. */
  sizes: readonly number[];
  /** Currently active size. A value outside `sizes` simply presses nothing. */
  value: number;
  /** Called with the clicked size. */
  onChange: (size: number) => void;
  /** Extra class for the group wrapper. */
  className?: string;
}
