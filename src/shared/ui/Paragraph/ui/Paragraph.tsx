import { classNames } from '@/shared/lib/utils/classNames';
import { mapSizeToClass } from '@/shared/lib/utils/mapSizeToClass';
import { memo } from 'react';
import { type LineClamp, type ParagraphProps } from '../model/types';
import cls from './Paragraph.module.scss';

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
export const Paragraph = memo((props: ParagraphProps) => {
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
  const validLineClampValues: LineClamp[] = [2, 3, 4, 5];
  const validatedLineClamp =
    lineClamp && validLineClampValues.includes(lineClamp) ? lineClamp : undefined;

  if (lineClamp && !validatedLineClamp) {
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
    <p className={classNames(cls.paragraph, mods, additional)} data-testid={dataTestId}>
      {children}
    </p>
  );
});

Paragraph.displayName = 'Paragraph';
