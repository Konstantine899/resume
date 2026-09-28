// src/shared/ui/Button/lib/utils/mergeAsChildProps.ts

import { sanitizeHref } from '@/shared/lib/utils';
import { classNames } from '@/shared/lib/utils/classNames';
import type {
  KeyboardEvent as ReactKeyboardEvent,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
} from 'react';

/**
 * Intrinsic elements that already carry interactive semantics
 * (focusable + keyboard-activatable on their own).
 */
const INTERACTIVE_ELEMENTS = ['a', 'button', 'input', 'select', 'textarea'] as const;

/**
 * Returns true when `type` is an intrinsic element that must not receive an
 * explicit `role="button"`, `tabIndex` or an Enter/Space activation handler.
 *
 * @remarks
 * Custom components (functions/classes) are not recognised as interactive: we
 * cannot know what they render, so the composed element gets button semantics —
 * the safe default for a Button.
 *
 * @param type - `element.type` of a React element (string tag or component)
 */
export const isInteractiveElement = (type: unknown): boolean =>
  typeof type === 'string' && (INTERACTIVE_ELEMENTS as readonly string[]).includes(type);

/**
 * Options for {@link mergeAsChildProps}.
 */
export interface MergeAsChildPropsOptions {
  /** Single, already validated child of the Button component */
  child: ReactElement;
  /** Computed button className returned by `useButton` */
  buttonClassName: string;
  /** Optional disabled modifier class from the component's CSS module */
  disabledClassName?: string;
  /** `data-testid` of the composed element */
  dataTestId: string;
  /** Guarded click handler returned by `useButton` */
  handleClick: MouseEventHandler;
  /** Guarded Enter/Space activation handler returned by `useButton` */
  handleKeyDown: KeyboardEventHandler<HTMLElement>;
  /** `disabled || loading` — drives `aria-disabled` and the disabled modifier */
  isDisabled: boolean;
  /** `loading` — drives `aria-busy` and `data-state` */
  loading: boolean;
  /** `href` passed to the Button component itself (wins over the child's href) */
  href?: string;
  /** Component-owned attributes merged before `restProps` (e.g. `aria-label`) */
  extraProps?: Record<string, unknown>;
  /** Remaining props passed to the Button component */
  restProps?: Record<string, unknown>;
}

/**
 * Builds the props that `asChild` merges into the Button's single child.
 *
 * @remarks
 * Centralizes the three things every `asChild` implementation must get right so
 * they cannot drift between Button, IconButton and ButtonWithIcon:
 *
 * 1. **Security** — any `href` (child's or the Button's own) goes through
 *    `sanitizeHref`, so `javascript:`/`data:` values are dropped instead of
 *    rendered.
 * 2. **Semantics** — only non-interactive children get `role="button"`,
 *    `tabIndex={0}` and an Enter/Space activation handler; a real `<a>`/`<button>`
 *    keeps its native semantics and native activation.
 * 3. **State** — `aria-disabled`, `aria-busy`, `data-state`, `data-testid`,
 *    className merge and the guarded `onClick`.
 *
 * The returned object does NOT contain `ref`: React 19 delivers `ref` inside the
 * Button's props (the legacy second-arg `ref` is `undefined` for non-forwardRef
 * components), and `restProps` below already spreads it — re-adding `ref` after the
 * spread would mask the real value with `undefined`.
 *
 * @returns Props to pass to `cloneElement`
 */
export const mergeAsChildProps = ({
  child,
  buttonClassName,
  disabledClassName,
  dataTestId,
  handleClick,
  handleKeyDown,
  isDisabled,
  loading,
  href,
  extraProps,
  restProps,
}: MergeAsChildPropsOptions): Record<string, unknown> => {
  const childProps = child.props as Record<string, unknown>;
  const interactive = isInteractiveElement(child.type);
  const childHref = typeof childProps.href === 'string' ? childProps.href : undefined;
  const childKeyDown = childProps.onKeyDown as KeyboardEventHandler<HTMLElement> | undefined;

  // The Button's own href wins over the child's (consistent with restProps order).
  const mergedHref = href ?? childHref;

  const composedKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    childKeyDown?.(event);
    handleKeyDown(event);
  };

  return {
    className: classNames(
      buttonClassName,
      typeof childProps.className === 'string' ? childProps.className : undefined,
      isDisabled && disabledClassName
    ),
    onClick: handleClick,
    'aria-disabled': isDisabled || undefined,
    'aria-busy': loading || undefined,
    'data-state': loading ? 'loading' : 'idle',
    'data-testid': dataTestId,
    ...(interactive ? {} : { role: childProps.role ?? 'button' }),
    ...(interactive ? {} : { tabIndex: childProps.tabIndex ?? 0 }),
    ...extraProps,
    ...restProps,
    ...(interactive ? {} : { onKeyDown: composedKeyDown }),
    ...(mergedHref !== undefined ? { href: sanitizeHref(mergedHref) } : {}),
  };
};
