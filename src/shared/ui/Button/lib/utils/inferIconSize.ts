// ============================================
// inferIconSize — Icon size inference utility
// ============================================

import { cloneElement, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { ICON_SIZE_MAP } from '../../model/constants';
import type { ButtonSize } from '../../model/types';

/**
 * Infers icon size from button size when icon has no explicit size prop.
 *
 * @param icon - The icon React element to size
 * @param size - The button size to infer from
 * @returns The icon with inferred or preserved size
 *
 * @example
 * ```ts
 * inferIconSize(<Mail />, 'lg')   // → <Mail size={24} />
 * inferIconSize(<Mail size={32} />, 'sm')  // → <Mail size={32} /> (manual override)
 * ```
 */
export function inferIconSize(icon: ReactNode, size: ButtonSize): ReactNode {
  if (!isValidElement(icon)) return icon;

  const iconProps = icon.props as Record<string, unknown>;
  if (iconProps.size !== undefined) return icon;

  return cloneElement(icon, { size: ICON_SIZE_MAP[size] } as Record<string, unknown>);
}
