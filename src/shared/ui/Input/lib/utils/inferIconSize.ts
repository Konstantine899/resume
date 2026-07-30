import React from 'react';
import type { InputSize } from '../../model/types';

export const INPUT_SIZE_TO_ICON = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
} as const;

/**
 * Automatically infers and sets icon size based on Input size.
 *
 * @description
 * - Returns primitives (string, number) and functional components as-is
 * - Returns ReactElements with explicit size as-is
 * - Clones ReactElements without size prop with inferred size
 * - Gracefully handles clone errors by returning original icon
 *
 * @example
 * ```tsx
 * inferIconSize(<Search />, 'md') // → <Search size={20} />
 * inferIconSize(<Search size={32} />, 'md') // → <Search size={32} /> (preserved)
 * inferIconSize('🔍', 'md') // → '🔍' (primitive returned as-is)
 * ```
 */
export function inferIconSize(icon: React.ReactNode, size: InputSize): React.ReactNode {
  // Primitives and functional components: return as-is
  if (!React.isValidElement(icon)) return icon;

  const iconProps = icon.props as Record<string, unknown>;

  // Explicit size: preserve user's choice
  if (iconProps.size !== undefined) return icon;

  // Auto-infer size with graceful fallback
  try {
    return React.cloneElement(icon, { size: INPUT_SIZE_TO_ICON[size] } as Record<string, unknown>);
  } catch {
    // Clone failed (e.g., functional component with incompatible props)
    return icon;
  }
}
