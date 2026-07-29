import { classNames } from '@/shared/lib/utils/classNames';
import { mapSizeToClass } from '@/shared/lib/utils/mapSizeToClass';
import { memo, forwardRef, createElement } from 'react';
import { type ParagraphProps } from '../model/types';
import { isValidLineClamp } from '../model/constants';
import { Slot } from '@/shared/ui/Slot';
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
 * <Paragraph as="span" weight="semibold">Текст жирным в span</Paragraph>
 * <Paragraph truncate>Однострочное обрезание</Paragraph>
 * <Paragraph wrap="balance">Сбалансированный перенос</Paragraph>
 * ```
 */
export const Paragraph = memo(
  forwardRef<HTMLElement, ParagraphProps>((props, ref) => {
    const {
      size = 'm',
      theme = 'primary',
      align = 'left',
      weight,
      wrap,
      truncate,
      as: Component = 'p',
      asChild,
      children,
      className,
      'data-testid': dataTestId = 'Paragraph',
      id,
      lineClamp,
    } = props;

    // Валидация lineClamp (только 2-5)
    const validatedLineClamp = lineClamp && isValidLineClamp(lineClamp) ? lineClamp : undefined;

    if (process.env.NODE_ENV === 'development') {
      if (lineClamp && !validatedLineClamp) {
        // eslint-disable-next-line no-console
        console.warn(`Paragraph: lineClamp должен быть от 2 до 5, получено: ${lineClamp}`);
      }

      if (truncate && lineClamp) {
        // eslint-disable-next-line no-console
        console.warn(
          'Paragraph: truncate и lineClamp не могут быть использованы одновременно.' +
            ' Будет использован truncate.'
        );
      }
    }

    // Маппинг размера в класс SCSS модуля через утилиту
    const sizeClass = mapSizeToClass(size);

    const mods: Record<string, boolean | undefined> = {
      [cls[sizeClass]]: true,
      [cls[theme]]: true,
      [cls[align]]: true,
      ...(validatedLineClamp && !truncate && { [cls[`line-clamp-${validatedLineClamp}`]]: true }),
      ...(weight && { [cls[weight]]: true }),
      ...(wrap && { [cls[wrap]]: true }),
      ...(truncate && { [cls.truncate]: true }),
    };

    const additional = [className];

    if (
      asChild &&
      children &&
      typeof children !== 'string' &&
      typeof children !== 'number' &&
      typeof children !== 'boolean'
    ) {
      return (
        <Slot
          ref={ref}
          className={classNames(cls.paragraph, mods, additional)}
          id={id}
          data-testid={dataTestId}
        >
          {children}
        </Slot>
      );
    }

    // Если asChild=true но children не является ReactElement, рендерим как обычно
    if (asChild && process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        'Paragraph: asChild requires a single ReactElement child. Falling back to default rendering.'
      );
    }

    /* eslint-disable react-hooks/refs */
    return createElement(
      Component,
      {
        ref,
        id,
        className: classNames(cls.paragraph, mods, additional),
        'data-testid': dataTestId,
      },
      children
    );
    /* eslint-enable react-hooks/refs */
  })
);

Paragraph.displayName = 'Paragraph';
