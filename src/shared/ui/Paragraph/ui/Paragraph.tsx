import { memo } from 'react';
import type { ComponentRef, ElementType, ForwardedRef, ReactElement, Ref } from 'react';
import { type ParagraphComponent, type ParagraphProps } from '../model/types';
import { useParagraph } from '../lib/hooks/useParagraph';
import { Slot } from '@/shared/ui/Slot';

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
 * <Paragraph as="a" href="/about">Ссылка с типографикой абзаца</Paragraph>
 * <Paragraph truncate>Однострочное обрезание</Paragraph>
 * <Paragraph wrap="balance">Сбалансированный перенос</Paragraph>
 * ```
 */
function ParagraphImpl<C extends ElementType = 'p'>(
  props: ParagraphProps<C> & { ref?: ForwardedRef<ComponentRef<C>> },
  _ref: ForwardedRef<ComponentRef<C>>
): ReactElement {
  const {
    // React 19 передаёт ref как обычный prop (ref-as-prop);
    // второй аргумент (forwardRef-конвенция) не заполняется для обычных функций.
    ref: forwardedRef,
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
    ...restProps
  } = props;

  // Вся className-логика, data-атрибуты и dev-валидация живут в useParagraph
  const { paragraphClassName, dataAttrs } = useParagraph({
    size,
    theme,
    align,
    weight,
    wrap,
    truncate,
    lineClamp,
    as: Component,
    className,
  });

  if (
    asChild &&
    children &&
    typeof children !== 'string' &&
    typeof children !== 'number' &&
    typeof children !== 'boolean'
  ) {
    return (
      <Slot
        ref={forwardedRef as ForwardedRef<HTMLElement>}
        className={paragraphClassName}
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

  const Tag = Component as ElementType;

  return (
    <Tag
      ref={forwardedRef as Ref<ComponentRef<C>>}
      id={id}
      className={paragraphClassName}
      data-testid={dataTestId}
      {...dataAttrs}
      {...restProps}
    >
      {children}
    </Tag>
  );
}

ParagraphImpl.displayName = 'Paragraph';

/**
 * React.memo не умеет generic-функции, поэтому оборачиваем через
 * промежуточный НЕ-generic каст, а generic typing применяется после memo
 * (Heading precedent).
 */
const ParagraphMemo = memo(
  ParagraphImpl as unknown as (
    props: ParagraphProps<'p'> & { ref?: ForwardedRef<HTMLElement> }
  ) => ReactElement
);

ParagraphMemo.displayName = 'Paragraph';

/**
 * Paragraph — полиморфный компонент для body-текста.
 * Рендерится как `<p>` по умолчанию; `as` позволяет переопределить
 * корневой элемент с сохранением типобезопасности (Heading parity).
 */
export const Paragraph = ParagraphMemo as unknown as ParagraphComponent;
