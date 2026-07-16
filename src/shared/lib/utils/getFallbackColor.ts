// ============================================
// getFallbackColor Utility
// ============================================

import { FALLBACK_COLORS } from '@/shared/ui/Avatar/model/constants';

/**
 * Generate a consistent fallback color based on name hash
 *
 * @param name - Name to generate color for
 * @returns Hex color code
 *
 * @example
 * ```ts
 * getFallbackColor("John Doe") // "#FF6B6B"
 * getFallbackColor("Jane Smith") // "#4ECDC4"
 * ```
 */
export const getFallbackColor = (name: string): string => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
};
