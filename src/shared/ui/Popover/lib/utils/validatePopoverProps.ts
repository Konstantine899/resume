import { PopoverProps } from '../../model/types';
import { POPOVER_POSITIONS, POPOVER_SIZES_ARRAY } from '../../model/constants';

/**
 * Dev-валидация props для Popover
 * @description Проверяет position и size в development режиме
 *
 * @note ESLint no-console отключён — намеренное использование console.warn
 *       для dev-only валидации.
 */

/* eslint-disable no-console */

export const validatePopoverProps = (props: PopoverProps): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const { position, size } = props;

  if (position && !POPOVER_POSITIONS.includes(position)) {
    console.warn(
      `Popover: невалидная позиция "${position}". Доступные: ${POPOVER_POSITIONS.join(', ')}`
    );
  }

  if (size && !POPOVER_SIZES_ARRAY.includes(size)) {
    console.warn(
      `Popover: невалидный размер "${size}". Доступные: ${POPOVER_SIZES_ARRAY.join(', ')}`
    );
  }
};
