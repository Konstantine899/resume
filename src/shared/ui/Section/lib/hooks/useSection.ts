// src/shared/ui/Section/lib/hooks/useSection.ts

import { useMemo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { validateSectionProps } from '../utils/validateSectionProps';
import { SECTION_DEFAULTS } from '../../model/constants';
import type { SectionHookProps, UseSectionReturn } from '../../model/types';

/**
 * Shared hook that consolidates Section logic: className computation,
 * data attribute generation, and synchronous validation.
 *
 * @remarks
 * - Called during render (no useEffect wrapper)
 * - Validation runs synchronously ONLY in development mode
 * - Returns logical class parts that the UI component maps to CSS module class names
 * - Zero production overhead: validation is completely skipped when NODE_ENV !== 'development'
 *
 * @param props - Section configuration matching SectionHookProps
 * @returns Object with sectionClassName (string) and dataAttrs (Record)
 *
 * @example
 * ```typescript
 * const { sectionClassName, dataAttrs } = useSection({ size: 'lg', as: 'section' });
 * ```
 */
export const useSection = ({
  size = SECTION_DEFAULTS.size,
  className = '',
  as = 'section',
}: SectionHookProps): UseSectionReturn => {
  // Synchronous validation (development only)
  if (process.env.NODE_ENV === 'development') {
    validateSectionProps({ size, as } as unknown as import('../../model/types').SectionProps);
  }

  // Memoize logical class parts (component will map to CSS module class names)
  const sectionClassName = useMemo(() => classNames('section', size, className), [size, className]);

  // Data attributes for styling and testing
  const dataAttrs: Record<string, string> = {
    'data-size': size,
    'data-as': as,
  };

  return {
    sectionClassName,
    dataAttrs,
  };
};
