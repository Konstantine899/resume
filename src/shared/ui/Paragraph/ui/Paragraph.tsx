import { classNames } from '@/shared/lib/utils/classNames';
import { mapSizeToClass } from '@/shared/lib/utils/mapSizeToClass';
import { memo, forwardRef } from 'react';
import { type LineClamp, type ParagraphProps } from '../model/types';
import cls from './Paragraph.module.scss';

const VALID_LINE_CLAMP_VALUES: readonly LineClamp[] = [2, 3, 4, 5];

/**
 * Paragraph component for body text
 *
 * @example
 * ```tsx
 * <Paragraph size="l">Основной текст абзаца</Paragraph>
 * <Paragraph theme="muted" size="s">Второстепенный текст</Paragraph>
 * <Paragraph theme="error">Сообщение об ошибке</Paragraph>
 * <Paragraph lineClamp={3}>Длинный текст, который обрежется после 3 строк</Paragraph>
 * ```
 */
export const Paragraph = memo(
  forwardRef<HTMLParagraphElement, ParagraphProps>((props, ref) => {
    const {
      size = 'm',
      theme = 'primary',
      align = 'left',
      children,
      className,
      'data-testid': dataTestId = 'Paragraph',
      lineClamp,
    } = props;

    // Валидация lineClamp (только 2-5)
    const validatedLineClamp =
      lineClamp && VALID_LINE_CLAMP_VALUES.includes(lineClamp) ? lineClamp : undefined;

    if (process.env.NODE_ENV === 'development' && lineClamp && !validatedLineClamp) {
      // eslint-disable-next-line no-console
      console.warn(`Paragraph: lineClamp должен быть от 2 до 5, получено: ${lineClamp}`);
    }

    // Маппинг размера в класс SCSS модуля через утилиту
    const sizeClass = mapSizeToClass(size);

    const mods = {
      [cls[sizeClass]]: true,
      [cls[theme]]: true,
      [cls[align]]: true,
      ...(validatedLineClamp && { [cls[`line-clamp-${validatedLineClamp}`]]: true }),
    };

    const additional = [className];

    return (
      <p ref={ref} className={classNames(cls.paragraph, mods, additional)} data-testid={dataTestId}>
        {children}
      </p>
    );
  })
);

Paragraph.displayName = 'Paragraph';
