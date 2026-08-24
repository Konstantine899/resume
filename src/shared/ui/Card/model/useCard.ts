import { useMemo, useEffect } from 'react';
import { CARD_CONSTANTS } from './constants';
import { classNames } from '@/shared/lib/utils/classNames';
import { validateCardProps } from '../lib/utils/validateCardProps';
import type { CardOwnProps } from './types';
import styles from '../ui/Card.module.scss';

export interface UseCardConfig extends CardOwnProps {
  onClick?: React.MouseEventHandler;
}

export interface UseCardReturn {
  cardClasses: string;
  safeVariant: CardOwnProps['variant'];
  safeSize: CardOwnProps['size'];
  safeRadius: CardOwnProps['radius'];
}

export function useCard({
  variant = CARD_CONSTANTS.DEFAULT_VARIANT,
  size = CARD_CONSTANTS.DEFAULT_SIZE,
  radius = CARD_CONSTANTS.DEFAULT_RADIUS,
  fullWidth = false,
  hoverable = true,
  className = '',
  onClick,
}: UseCardConfig): UseCardReturn {
  const safeVariant = variant ?? CARD_CONSTANTS.DEFAULT_VARIANT;
  const safeSize = size ?? CARD_CONSTANTS.DEFAULT_SIZE;
  const safeRadius = radius ?? CARD_CONSTANTS.DEFAULT_RADIUS;

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const warnings = validateCardProps(safeVariant, safeSize, safeRadius, hoverable, onClick);
      warnings.forEach((w: { message: string }) => {
        // eslint-disable-next-line no-console
        console.warn(w.message);
      });
    }
  }, [safeVariant, safeSize, safeRadius, hoverable, onClick]);

  const cardClasses = useMemo(
    () =>
      classNames(
        styles.card,
        styles[safeVariant ?? CARD_CONSTANTS.DEFAULT_VARIANT],
        styles[safeSize ?? CARD_CONSTANTS.DEFAULT_SIZE],
        styles[safeRadius ?? CARD_CONSTANTS.DEFAULT_RADIUS],
        fullWidth && styles.fullWidth,
        !hoverable && styles.noHover,
        className
      ),
    [safeVariant, safeSize, safeRadius, fullWidth, hoverable, className]
  );

  return { cardClasses, safeVariant, safeSize, safeRadius };
}
