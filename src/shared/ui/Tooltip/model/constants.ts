import type { TooltipPosition } from './types';

export const TOOLTIP_CONSTANTS = {
  DEFAULT_OFFSET: 8,
  DEFAULT_MAX_WIDTH: 250,
  DEFAULT_SHOW_DELAY: 200,
  DEFAULT_HIDE_DELAY: 100,
  EDGE_OFFSET: 8,
} as const;

export const POSITION_ORDER: Record<TooltipPosition, TooltipPosition[]> = {
  top: ['top', 'bottom', 'right', 'left'],
  bottom: ['bottom', 'top', 'right', 'left'],
  left: ['left', 'right', 'top', 'bottom'],
  right: ['right', 'left', 'top', 'bottom'],
};
