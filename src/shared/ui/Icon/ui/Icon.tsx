import { forwardRef, memo } from 'react';
import type {
  ComponentRef,
  ElementType,
  ForwardedRef,
  ForwardRefRenderFunction,
  ReactElement,
  Ref,
} from 'react';
import { useKeyboardAction } from '@/shared/lib/hooks/useKeyboardAction';
import { ICON_CONSTANTS } from '../model/constants';
import type { IconProps } from '../model/types';
import { useIcon } from '../lib/hooks/useIcon';

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
  const { iconClassName, iconStyle, dataAttrs, ariaProps, isInteractive } = useIcon({
    name: IconComponentChild,
    component,
    size,
    color,
    strokeWidth,
    className,
    ariaLabel,
    decorative,
    disabled,
    onClick,
  });

  // useKeyboardAction: Enter/Space → preventDefault + нативный click() на span
  // ровно один раз. Единый источник действия — onClick span (мышь/клавиатура);
  // enabled гейтит активность интерактивной иконки.
  const handleKeyDown = useKeyboardAction({ disabled, enabled: isInteractive });

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
        role={isInteractive ? 'button' : decorative ? undefined : 'img'}
        aria-pressed={isInteractive && isPressed !== undefined ? isPressed : undefined}
        data-testid={decorative ? undefined : 'icon-wrapper'}
        {...dataAttrs}
        {...ariaProps}
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
      {...dataAttrs}
      {...ariaProps}
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
