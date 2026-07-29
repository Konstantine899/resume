import { classNames } from '@/shared/lib/utils/classNames';
import { mapSizeToClass } from '@/shared/lib/utils/mapSizeToClass';
import { createElement, forwardRef, memo, useEffect, useMemo, type JSX } from 'react';
import { type HeadingProps } from '../model/types';
import { HEADING_CONSTANTS } from '@/shared/ui/Heading/model/const';
import { validateHeadingProps } from '@/shared/ui/Heading/lib/validateHeadingProps';
import cls from './Heading.module.scss';

const HeadingComponent = forwardRef<HTMLHeadingElement, HeadingProps>((props, ref) => {
  const {
    level = HEADING_CONSTANTS.DEFAULT_LEVEL,
    size = HEADING_CONSTANTS.DEFAULT_SIZE,
    theme = HEADING_CONSTANTS.DEFAULT_THEME,
    align = HEADING_CONSTANTS.DEFAULT_ALIGN,
    children,
    className,
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'data-testid': dataTestId = 'Heading',
  } = props;

  useEffect(() => {
    validateHeadingProps(level, size, theme, align, children);
  }, [level, size, theme, align, children]);

  const sizeClass = useMemo(() => {
    const baseClass = mapSizeToClass(size);
    return cls[`heading--${baseClass}`] ?? '';
  }, [size]);

  const themeClass = useMemo(() => cls[`heading--theme-${theme}`] ?? '', [theme]);
  const alignClass = useMemo(() => cls[`heading--align-${align}`] ?? '', [align]);

  const headingClassName = useMemo(
    () => classNames(cls.heading, sizeClass, themeClass, alignClass, className),
    [sizeClass, themeClass, alignClass, className]
  );

  const tag = useMemo(() => `h${level}` as keyof JSX.IntrinsicElements, [level]);

  /* eslint-disable react-hooks/refs */
  return createElement(
    tag,
    {
      ref,
      id,
      className: headingClassName,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'data-testid': dataTestId,
      'data-level': level,
      'data-size': size,
      'data-theme': theme,
      'data-align': align,
    },
    children
  );
  /* eslint-enable react-hooks/refs */
});

HeadingComponent.displayName = 'Heading';
export const Heading = memo(HeadingComponent);
