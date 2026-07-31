import { memo, forwardRef } from 'react';
import type { ElementType, ComponentPropsWithRef, ForwardedRef, ComponentRef } from 'react';
import { useHeading } from '../lib/hooks/useHeading';
import type { HeadingOwnProps, HeadingAsElement } from '../model/types';

/**
 * Heading — компонент для семантических заголовков с гибкой типографикой.
 *
 * @remarks
 * **Important notes:**
 * - `level` определяет семантику (h1-h6) — используйте h1 только один раз на странице
 * - `size` управляет визуальным размером независимо от семантического уровня
 * - `theme="gradient"` применяет градиентный текст
 * - `as` prop позволяет переопределить корневой элемент (например, `as="span"`)
 * - По умолчанию рендерится как `h{level}` (например, `level={1}` → `<h1>`)
 */

type HeadingProps<C extends HeadingAsElement = 'h2'> = { as?: C } & HeadingOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof HeadingOwnProps | 'as'>;

type HeadingComponent = <C extends HeadingAsElement = 'h2'>(
  props: HeadingProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => React.ReactElement;

const headingRef = forwardRef(function HeadingImpl<C extends HeadingAsElement = 'h2'>(
  {
    as,
    level = 2,
    size = 'm',
    theme = 'primary',
    align = 'left',
    className = '',
    children,
    ...restProps
  }: HeadingProps<C>,
  ref: ForwardedRef<HTMLElement>
): React.ReactElement {
  const { headingClassName, dataAttrs } = useHeading({
    level,
    size,
    theme,
    align,
    className,
    isGradient: theme === 'gradient',
  });

  const Component = (as || `h${level}`) as ElementType;

  return (
    <Component ref={ref} className={headingClassName} {...dataAttrs} {...restProps}>
      {children}
    </Component>
  );
});

/**
 * React.memo не умеет generic-функции, поэтому оборачиваем через
 * промежуточный НЕ-generic каст, а generic typing применяется после memo.
 */
const HeadingMemo = memo(
  headingRef as unknown as (
    props: HeadingProps<'h2'> & { ref?: ForwardedRef<HTMLElement> }
  ) => React.ReactElement
);

HeadingMemo.displayName = 'Heading';

/**
 * Heading — семантический заголовок с поддержкой разных уровней (h1–h6),
 * визуальных размеров, тем и выравнивания.
 */
export const Heading = HeadingMemo as unknown as HeadingComponent;
