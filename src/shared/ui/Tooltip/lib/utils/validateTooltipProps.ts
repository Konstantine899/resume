import type { TooltipPosition, TooltipTriggerType } from '../../model/types';

const VALID_POSITIONS: TooltipPosition[] = [
  'top-start',
  'top',
  'top-end',
  'bottom-start',
  'bottom',
  'bottom-end',
  'left-start',
  'left',
  'left-end',
  'right-start',
  'right',
  'right-end',
];
const VALID_TRIGGERS: TooltipTriggerType[] = ['hover', 'focus', 'click'];

export interface ValidationWarning {
  prop: string;
  message: string;
}

export const validateTooltipProps = (
  position: TooltipPosition,
  trigger: TooltipTriggerType
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
