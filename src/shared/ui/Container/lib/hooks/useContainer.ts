// ============================================
// useContainer Hook — FSD compliant (model layer)
// ============================================

import { useMemo } from 'react';
import { validateContainerProps } from '../utils/validateContainerProps';
import { CONTAINER_CONSTANTS } from '../../model/constants';
import type { ContainerHookProps, UseContainerReturn } from '../../model/types';

/**
 * Shared hook that consolidates Container logic: className computation,
 * data attribute generation, synchronous validation, and CSS custom
 * property style computation.
 *
 * @remarks
 * Called during render (no useEffect wrapper). Validation runs synchronously
 * in development mode only. Returns logical class parts that the UI component
 * maps to CSS module class names.
 *
 * @param props - Container configuration matching ContainerOwnProps
 * @returns Logical class parts, data attributes, and CSS custom properties
 */
export const useContainer = ({
  size = CONTAINER_CONSTANTS.DEFAULT_SIZE,
  centered = CONTAINER_CONSTANTS.DEFAULT_CENTERED,
  className = '',
  fullWidth = false,
  padding = CONTAINER_CONSTANTS.DEFAULT_PADDING,
}: ContainerHookProps): UseContainerReturn => {
  // Synchronous validation (development only, no useEffect needed)
  if (process.env.NODE_ENV === 'development') {
    validateContainerProps(size, padding);
  }

  // Memoize logical class parts (component will map to CSS module classes)
  const containerClassName = useMemo(() => {
    // Return space-separated logical class names
    // Component will map these to CSS module scoped classes
    const classes = [
      size,
      `padding-${padding}`,
      centered && 'centered',
      fullWidth && 'fullWidth',
      className,
    ].filter(Boolean);

    return classes.join(' ');
  }, [size, centered, fullWidth, padding, className]);

  // Data attributes for styling and testing
  const dataAttrs: Record<string, string> = {
    'data-size': size,
    'data-padding': padding,
  };

  // CSS custom properties for SCSS deduplication
  const style: React.CSSProperties & Record<string, string> = {
    '--container-max-width': CONTAINER_CONSTANTS.MAX_WIDTH[size] as string,
    '--container-padding': CONTAINER_CONSTANTS.PADDING[padding] as string,
  };

  return {
    containerClassName,
    dataAttrs,
    style,
  };
};
