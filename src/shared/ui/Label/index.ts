// src/shared/ui/Label/index.ts

// ============================================
// Label Component - Public API
// ============================================

export type { LabelProps, LabelSize, LabelVariant } from './model/types';
export { LABEL_CONSTANTS, LABEL_DEFAULTS } from './model/constants';
export { validateLabelProps } from './lib/utils/validateLabelProps';
export { Label } from './ui/Label';
