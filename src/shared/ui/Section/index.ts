// src/shared/ui/Section/index.ts

export type {
  SectionProps,
  SectionVariant,
  SectionPadding,
  SectionSize,
  SectionMargin,
  SectionMarginValue,
  ResponsiveValue,
  ContainerConfig,
} from './model/types';
export {
  SECTION_CONSTANTS,
  SECTION_DEFAULTS,
  SECTION_VARIANTS,
  SECTION_SIZES,
  SECTION_PADDINGS,
} from './model/constants';
export { validateSectionProps } from './lib/utils/validateSectionProps';
export { Section } from './ui/Section';
