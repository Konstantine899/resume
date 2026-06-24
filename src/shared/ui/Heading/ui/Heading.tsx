import { classNames } from '@/shared/lib/utils/classNames';
import { mapSizeToClass } from '@/shared/lib/utils/mapSizeToClass';
import { createElement, type JSX, memo, useCallback, useEffect, useMemo } from 'react';
import {
  HEADING_ALIGNS,
  HEADING_LEVELS,
  HEADING_SIZES,
  HEADING_THEMES,
  isValidHeadingAlign,
  isValidHeadingLevel,
  isValidHeadingSize,
  isValidHeadingTheme,
} from '../model/const';
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
 * <Heading level={2} id="section-title" aria-label="Projects Section">Projects</Heading>
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
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'data-testid': dataTestId = 'Heading',
  } = props;

  // Runtime validation в development режиме
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (!isValidHeadingLevel(level)) {
        console.warn(
          `Heading: invalid level "${level}". Valid values: ${HEADING_LEVELS.join(', ')}`
        );
      }
      if (!isValidHeadingSize(size)) {
        console.warn(`Heading: invalid size "${size}". Valid values: ${HEADING_SIZES.join(', ')}`);
      }
      if (!isValidHeadingTheme(theme)) {
        console.warn(
          `Heading: invalid theme "${theme}". Valid values: ${HEADING_THEMES.join(', ')}`
        );
      }
      if (!isValidHeadingAlign(align)) {
        console.warn(
          `Heading: invalid align "${align}". Valid values: ${HEADING_ALIGNS.join(', ')}`
        );
      }
      if (!children) {
        console.warn('Heading: children prop is required but was not provided');
      }
    }
  }, [level, size, theme, align, children]);

  // Маппинг размера в BEM класс через CSS Module
  const sizeClass = useMemo(() => {
    const baseClass = mapSizeToClass(size);
    return cls[`heading--${baseClass}`] ?? '';
  }, [size]);

  // BEM модификаторы через CSS Module
  const themeClass = useMemo(() => {
    return cls[`heading--theme-${theme}`] ?? '';
  }, [theme]);

  const alignClass = useMemo(() => {
    return cls[`heading--align-${align}`] ?? '';
  }, [align]);

  // Мемоизация дополнительных классов
  const additional = useMemo(() => [className].filter(Boolean), [className]);

  // Динамически создаём тег заголовка (h1, h2, h3, etc.)
  const tag = useMemo(() => `h${level}` as keyof JSX.IntrinsicElements, [level]);

  // Callback для получения полного класса
  const getClassName = useCallback(() => {
    return classNames(cls.heading, sizeClass, themeClass, alignClass, additional);
  }, [sizeClass, themeClass, alignClass, additional]);

  return createElement(
    tag,
    {
      id,
      className: getClassName(),
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'data-testid': dataTestId,
    },
    children
  );
});

Heading.displayName = 'Heading';
