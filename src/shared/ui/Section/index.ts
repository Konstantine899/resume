// src/shared/ui/Section/index.ts

export type {
  SectionProps,
  SectionSize,
  SectionAsElement,
  SectionOwnProps,
  SectionHookProps,
  UseSectionReturn,
} from './model/types';
export { SECTION_CONSTANTS, SECTION_DEFAULTS, SECTION_SIZES } from './model/constants';
export { validateSectionProps } from './lib/utils/validateSectionProps';
export { useSection } from './lib/hooks/useSection';
export { Section } from './ui/Section';
