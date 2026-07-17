import type { TooltipPosition, TooltipTrigger } from '../model/types';

const VALID_POSITIONS: TooltipPosition[] = ['top', 'bottom', 'left', 'right'];
const VALID_TRIGGERS: TooltipTrigger[] = ['hover', 'focus', 'click'];

export interface ValidationWarning {
  prop: string;
  message: string;
}

export const validateTooltipProps = (
  position: TooltipPosition,
  trigger: TooltipTrigger
): ValidationWarning[] => {
  const warnings: ValidationWarning[] = [];

  if (!VALID_POSITIONS.includes(position)) {
    warnings.push({
      prop: 'position',
      message: `Tooltip: invalid position "${position}". Valid values: ${VALID_POSITIONS.join(', ')}`,
    });
  }

  if (!VALID_TRIGGERS.includes(trigger)) {
    warnings.push({
      prop: 'trigger',
      message: `Tooltip: invalid trigger "${trigger}". Valid values: ${VALID_TRIGGERS.join(', ')}`,
    });
  }

  return warnings;
};
