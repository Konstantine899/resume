// ============================================
// InputClearIcon Component
// ============================================

import { INPUT_CONSTANTS } from '../../model/constants';

/**
 * ClearIcon — SVG иконка крестика для кнопки очистки Input.
 * Размер управляется через INPUT_CONSTANTS.CLEAR_ICON_SIZE.
 *
 * @example
 * ```tsx
 * <ClearIcon />
 * ```
 */
export const ClearIcon = () => (
  <svg
    width={INPUT_CONSTANTS.CLEAR_ICON_SIZE}
    height={INPUT_CONSTANTS.CLEAR_ICON_SIZE}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
