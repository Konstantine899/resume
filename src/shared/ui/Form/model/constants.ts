// src/shared/ui/Form/model/constants.ts

import type { FormGap } from './types';

export const FORM_CONSTANTS: {
  VALID_GAPS: readonly FormGap[];
} = {
  VALID_GAPS: ['sm', 'md', 'lg'],
} as const;

export interface FormDefaults {
  noValidate: boolean;
}

export const FORM_DEFAULTS: FormDefaults = {
  noValidate: true,
};
