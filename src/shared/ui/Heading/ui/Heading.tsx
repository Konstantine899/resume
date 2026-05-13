import { classNames } from '@/shared/lib/utils/classNames';
import { mapSizeToClass } from '@/shared/lib/utils/mapSizeToClass';
import { createElement, JSX, memo } from 'react';
import { type HeadingProps } from '../model/types';
import cls from './Heading.module.scss';

/**
 * Heading component for semantic headings (h1-h6)
 *
 * @example
 * ```tsx
 * <Heading level={1} size="5xl" theme="gradient">Главная страница</Heading>
 * <Heading level={2} size="3xl">Секция проектов</Heading>
 * <Heading level={3} size="xl" theme="muted">Подзаголовок</Heading>
 * ```
 */
export const Heading = memo((props: HeadingProps) => {
  const {
    level = 2,
    size = 'm',
    theme = 'primary',
    align = 'left',
    children,
    className,
    'data-testid': dataTestId = 'Heading',
  } = props;

  // Маппинг размера в класс SCSS модуля через утилиту
  const sizeClass = mapSizeToClass(size);

  const mods = {
    [cls[sizeClass]]: true,
    [cls[theme]]: true,
    [cls[align]]: true,
  };

  const additional = [className];

  // Динамически создаём тег заголовка (h1, h2, h3, etc.)
  const tag = `h${level}` as keyof JSX.IntrinsicElements;

  return createElement(
    tag,
    {
      className: classNames(cls.heading, mods, additional),
      'data-testid': dataTestId,
    },
    children
  );
});

Heading.displayName = 'Heading';
