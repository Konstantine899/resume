import { PLACEMENTS } from '@/shared/lib/utils/calculatePosition';
import type { Placement } from '@/shared/lib/utils/calculatePosition';
import type { TooltipTriggerType } from '../../model/types';

// Единый источник 12 позиций — импортируется из calculatePosition,
// чтобы не дублировать union/массив (5-й источник был тут).
const VALID_POSITIONS: readonly Placement[] = PLACEMENTS;
const VALID_TRIGGERS: readonly TooltipTriggerType[] = ['hover', 'focus', 'click'];

const MIN_DELAY = 0;
const MIN_OFFSET = 0;
const MIN_MAX_WIDTH = 0;

// Запрещённые паттерны для color/arrowShadowColor: закрывают CSS-injection
// (url(), expression, javascript:) и инъекцию новых деклараций (;).
const DANGEROUS_COLOR_PATTERNS = [
  /url\s*\(/i,
  /expression/i,
  /javascript:/i,
  /@import/i,
  /[;{}]/,
  /`/,
];

export interface ValidationWarning {
  prop: string;
  message: string;
}

export interface ValidateTooltipOptions {
  position?: Placement;
  trigger?: TooltipTriggerType;
  showDelay?: number;
  hideDelay?: number;
  offset?: number;
  maxWidth?: number;
  color?: string;
  arrowShadowColor?: string;
  /** Контент тултипа — dev-warn на пустую строку */
  content?: string | null;
}

const isSafeColor = (value: string): boolean =>
  !DANGEROUS_COLOR_PATTERNS.some((pattern) => pattern.test(value));

export const validateTooltipProps = ({
  position,
  trigger,
  showDelay,
  hideDelay,
  offset,
  maxWidth,
  color,
  arrowShadowColor,
  content,
}: ValidateTooltipOptions = {}): ValidationWarning[] => {
  const warnings: ValidationWarning[] = [];

  if (position !== undefined && !VALID_POSITIONS.includes(position)) {
    warnings.push({
      prop: 'position',
      message: `Tooltip: invalid position "${position}". Valid values: ${VALID_POSITIONS.join(', ')}`,
    });
  }

  if (trigger !== undefined && !VALID_TRIGGERS.includes(trigger)) {
    warnings.push({
      prop: 'trigger',
      message: `Tooltip: invalid trigger "${trigger}". Valid values: ${VALID_TRIGGERS.join(', ')}`,
    });
  }

  if (showDelay !== undefined && showDelay < MIN_DELAY) {
    warnings.push({
      prop: 'showDelay',
      message: `Tooltip: showDelay "${showDelay}" должно быть >= ${MIN_DELAY}ms`,
    });
  }

  if (hideDelay !== undefined && hideDelay < MIN_DELAY) {
    warnings.push({
      prop: 'hideDelay',
      message: `Tooltip: hideDelay "${hideDelay}" должно быть >= ${MIN_DELAY}ms`,
    });
  }

  if (offset !== undefined && offset < MIN_OFFSET) {
    warnings.push({
      prop: 'offset',
      message: `Tooltip: offset "${offset}" должно быть >= ${MIN_OFFSET}`,
    });
  }

  if (maxWidth !== undefined && maxWidth <= MIN_MAX_WIDTH) {
    warnings.push({
      prop: 'maxWidth',
      message: `Tooltip: maxWidth "${maxWidth}" должно быть > ${MIN_MAX_WIDTH}`,
    });
  }

  if (color !== undefined && !isSafeColor(color)) {
    warnings.push({
      prop: 'color',
      message: 'Tooltip: color содержит запрещённые паттерны (url(), javascript:, etc.)',
    });
  }

  if (arrowShadowColor !== undefined && !isSafeColor(arrowShadowColor)) {
    warnings.push({
      prop: 'arrowShadowColor',
      message: 'Tooltip: arrowShadowColor содержит запрещённые паттерны (url(), javascript:, etc.)',
    });
  }

  if (content !== undefined && typeof content === 'string' && content.trim() === '') {
    warnings.push({
      prop: 'content',
      message: 'Tooltip: content — пустая строка',
    });
  }

  return warnings;
};
