import { PORTAL_CONSTANTS } from '../model/constants';

export interface PortalValidationWarning {
  prop: string;
  message: string;
}

export const validatePortalProps = (element?: HTMLElement | null): PortalValidationWarning[] => {
  const warnings: PortalValidationWarning[] = [];

  if (element !== undefined && element !== null && !(element instanceof HTMLElement)) {
    warnings.push({
      prop: 'element',
      message: `${PORTAL_CONSTANTS.DEV_WARNING_PREFIX} The provided element is not an HTMLElement.`,
    });
  }

  if (element !== undefined && element !== null && !element.isConnected) {
    warnings.push({
      prop: 'element',
      message:
        `${PORTAL_CONSTANTS.DEV_WARNING_PREFIX} The provided element is not connected to the DOM. ` +
        'Portal children will not render in the expected container.',
    });
  }

  return warnings;
};
