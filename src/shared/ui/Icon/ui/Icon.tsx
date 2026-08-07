import { classNames } from '@/shared/lib/utils/classNames';
import React, { forwardRef, memo, useCallback } from 'react';
import type {
  ComponentRef,
  ElementType,
  ForwardedRef,
  ForwardRefRenderFunction,
  ReactElement,
  Ref,
} from 'react';
import { getColorValue, getSizeInPixels, ICON_CONSTANTS } from '../model/constants';
import type { IconProps } from '../model/types';
import styles from './Icon.module.scss';

/**
 * Icon — полиморфная иконка с `component` prop.
 *
 * По умолчанию рендерится как `<span>`. Используйте `component="a"`,
 * другой HTML-элемент или React-компонент для переопределения корневого узла.
 *
 * a11y/keyboard fork:
 * — `component="span"` (default) сохраняет существующий интерактивный путь
 *   (`role="button"`, `tabIndex`, Enter/Space lift через handleKeyDown) байт-идентично;
 * — для не-span элементов интерактивные атрибуты прокидываются через `restProps`
 *   без авт-`role`/`tabIndex` и без handleKeyDown — реальный элемент управляет
 *   своей семантикой и фокусируемостью (например, нативный `<button>`).
 */
type IconComponent = (<C extends ElementType = 'span'>(
  props: IconProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement) & { displayName?: string };

function IconImpl<C extends ElementType = 'span'>(
  {
    name: IconComponentChild,
    component,
    size = ICON_CONSTANTS.DEFAULT_SIZE,
    color = ICON_CONSTANTS.DEFAULT_COLOR,
    strokeWidth = ICON_CONSTANTS.DEFAULT_STROKE_WIDTH,
    className = '',
    ariaLabel,
    decorative = false,
    disabled = false,
    onClick,
    isPressed,
    id,
    ...restProps
  }: IconProps<C>,
  ref: ForwardedRef<ComponentRef<C>>
): ReactElement {
  const isInteractive = onClick !== undefined && !disabled;

  const iconStyle: React.CSSProperties = {
    width: getSizeInPixels(size),
    height: getSizeInPixels(size),
    color: getColorValue(color),
  };

  const iconClassName = classNames(
    styles.icon,
    disabled && styles.disabled,
    isInteractive && styles.clickable,
    className
  );

  const commonAriaProps = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ 'aria-label': ariaLabel } as const);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        e.currentTarget.click();
      }
    },
    [disabled, onClick]
  );

  const Component = (component || 'span') as ElementType;
  const isDefaultSpan = Component === 'span';

  const iconChild = (
    <IconComponentChild
      style={iconStyle}
      strokeWidth={strokeWidth}
      aria-hidden={decorative ? 'true' : undefined}
    />
  );

  if (isDefaultSpan) {
    // Интерактивный span-path — байт-идентично текущей реализации.
    return (
      <span
        ref={ref as Ref<HTMLSpanElement>}
        id={id}
        className={iconClassName}
        onClick={disabled ? undefined : onClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? undefined : isInteractive ? 0 : undefined}
        role={isInteractive ? 'button' : commonAriaProps['aria-hidden'] ? undefined : 'img'}
        aria-pressed={isInteractive && isPressed !== undefined ? isPressed : undefined}
        data-testid={decorative ? undefined : 'icon-wrapper'}
        data-size={size}
        data-color={color}
        data-interactive={isInteractive}
        {...commonAriaProps}
      >
        {iconChild}
      </span>
    );
  }

  // Не-span path — нативный элемент сам управляет своей семантикой.
  // Без auto `role="button"`/`tabIndex`/handleKeyDown, без data-testid.
  return (
    <Component
      ref={ref as Ref<ComponentRef<C>>}
      className={iconClassName}
      id={id}
      onClick={onClick}
      data-size={size}
      data-color={color}
      data-interactive={isInteractive}
      {...commonAriaProps}
      {...restProps}
    >
      {iconChild}
    </Component>
  );
}

/**
 * forwardRef не умеет generic-функции — прокидываем IconImpl через
 * НЕ-generic каст; generic typing применяется после memo (Link precedent).
 */
const iconRef = forwardRef(
  IconImpl as unknown as ForwardRefRenderFunction<unknown, IconProps<'span'>>
);

/**
 * React.memo тоже не умеет generic-функции — финальный каст на IconComponent
 * восстанавливает generic `component` prop и типизацию ref.
 */
const IconMemo = memo(
  iconRef as unknown as (
    props: IconProps<'span'> & { ref?: ForwardedRef<HTMLSpanElement> }
  ) => ReactElement
);

IconMemo.displayName = 'Icon';

export const Icon = IconMemo as unknown as IconComponent;
