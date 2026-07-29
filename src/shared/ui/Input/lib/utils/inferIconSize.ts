import React from 'react';
import type { InputSize } from '../../model/types';

export const INPUT_SIZE_TO_ICON = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

export function inferIconSize(icon: React.ReactNode, size: InputSize): React.ReactNode {
  if (!React.isValidElement(icon)) return icon;
  const iconProps = icon.props as Record<string, unknown>;
  if (iconProps.size !== undefined) return icon;
  return React.cloneElement(icon, { size: INPUT_SIZE_TO_ICON[size] } as Record<string, unknown>);
}
