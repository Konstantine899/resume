import { useCard } from '../model/useCard';
import { memo, createElement, forwardRef } from 'react';
import type {
  ElementType,
  ComponentRef,
  ForwardedRef,
  ReactElement,
  MouseEventHandler,
} from 'react';
import type {
  CardProps,
  ProjectCardProps,
  WorkHistoryCardProps,
  ContactCardProps,
} from '../model/types';
import { Container } from '@/shared/ui/Container';
import { Link } from '@/shared/ui/Link';
import { ProjectCard } from './ProjectCard';
import { WorkHistoryCard } from './WorkHistoryCard';
import { ContactCard } from './ContactCard';
import { CardHeader } from './CardHeader';
import { CardBody } from './CardBody';
import { CardFooter } from './CardFooter';
import { CardImage } from './CardImage';
import { CardTitle } from './CardTitle';
import { CardDescription } from './CardDescription';
import { CardActions } from './CardActions';
import { CardGrid } from './CardGrid';
import { CardMeta } from './CardMeta';

/**
 * Card — универсальный компонент-контейнер для контента.
 *
 * @remarks
 * **Container Integration:**
 * - Variants `skill` и `about` автоматически оборачиваются в `Container` для центрирования и ограничения ширины
 * - `skill` variant: Container size="xl" (1280px max-width)
 * - `about` variant: Container size="lg" (1024px max-width)
 * - Остальные variants (`default`, `project`, `workHistory`, `contact`, `codeBlock`) не используют Container
 *
 * **Polymorphic:**
 * - Default element: `<div>`
 * - Use `component` prop для рендеринга как `<section>`, `<article>`, `<a>`, `<form>`, etc.
 *
 * **Variants:**
 * - `default` — базовый стиль
 * - `skill` — для навыков (авто-Container xl)
 * - `about` — для секций "о себе" (авто-Container lg)
 * - `project` — для проектов (специализированный)
 * - `workHistory` — для опыта работы (специализированный)
 * - `contact` — для контактов (специализированный)
 * - `codeBlock` — для блоков кода
 *
 * @example
 * // Basic usage
 * ```tsx
 * <Card>Content</Card>
 * ```
 *
 * @example
 * // Skill variant (auto-wrapped in Container size="xl")
 * ```tsx
 * <Card variant="skill">Skill content</Card>
 * ```
 *
 * @example
 * // About variant (auto-wrapped in Container size="lg")
 * ```tsx
 * <Card variant="about">About content</Card>
 * ```
 *
 * @example
 * // Polymorphic as section
 * ```tsx
 * <Card component="section">Section card</Card>
 * ```
 *
 * @example
 * // Compound components
 * ```tsx
 * <Card>
 *   <Card.Header>Title</Card.Header>
 *   <Card.Body>Content</Card.Body>
 *   <Card.Footer>Footer</Card.Footer>
 * </Card>
 * ```
 */

/** CARD-P0-2: blocklist stripped from `...rest` before spread (D2: `style` preserved). */
const DANGEROUS_PROPS = ['dangerouslySetInnerHTML', 'suppressHydrationWarning', 'onError'] as const;
type DangerousProp = (typeof DANGEROUS_PROPS)[number];

function sanitizeRest<R extends Record<string, unknown>>(rest: R): R {
  const entries = Object.entries(rest).filter(
    ([key]) => !(DANGEROUS_PROPS as readonly DangerousProp[]).includes(key as DangerousProp)
  );
  return Object.fromEntries(entries) as R;
}

type CardComponent = (<C extends ElementType = 'div'>(
  props: CardProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement) & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
  Image: typeof CardImage;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Actions: typeof CardActions;
  Grid: typeof CardGrid;
  Meta: typeof CardMeta;
  Project: typeof ProjectCard;
  WorkHistory: typeof WorkHistoryCard;
  Contact: typeof ContactCard;
};

const CardImpl = forwardRef(function Card<C extends ElementType = 'div'>(
  {
    variant,
    size,
    radius,
    fullWidth,
    hoverable,
    className,
    component,
    style,
    children,
    ...rest
  }: CardProps<C>,
  ref: ForwardedRef<HTMLElement>
): ReactElement {
  const onClick = rest.onClick as MouseEventHandler | undefined;
  const href = (rest as Record<string, unknown>).href as string | undefined;
  const isLink = component === Link;

  const { cardClasses, safeVariant, safeSize, safeRadius, interactivity } = useCard({
    variant,
    size,
    radius,
    fullWidth,
    hoverable,
    className,
    onClick,
    component,
    href,
    isLink,
  });

  // CARD-P1-1: forward className/fullWidth/style into specialized variants, merged
  // with each variant's own base class inside the specialized component.
  if (safeVariant === 'project') {
    return createElement(ProjectCard, {
      ...(sanitizeRest(rest) as unknown as ProjectCardProps),
      className,
      fullWidth,
      style,
    });
  }

  if (safeVariant === 'workHistory') {
    return createElement(WorkHistoryCard, {
      ...(sanitizeRest(rest) as unknown as WorkHistoryCardProps),
      className,
      fullWidth,
      style,
    });
  }

  if (safeVariant === 'contact') {
    return createElement(ContactCard, {
      ...(sanitizeRest(rest) as unknown as ContactCardProps),
      className,
      fullWidth,
      style,
      children,
    });
  }

  // For 'skill' and 'about' variants, wrap content in Container for max-width and centering
  const shouldUseContainer = safeVariant === 'skill' || safeVariant === 'about';
  const containerSize = safeVariant === 'skill' ? 'xl' : 'lg';

  const Tag = (component ?? 'div') as ElementType;

  const cardElement = createElement(
    Tag,
    {
      ref,
      className: cardClasses,
      'data-state': hoverable !== false ? 'hoverable' : 'static',
      'data-variant': safeVariant,
      'data-size': safeSize,
      'data-radius': safeRadius,
      ...sanitizeRest(rest),
      style,
      role: interactivity.role,
      tabIndex: interactivity.tabIndex,
      onKeyDown: interactivity.onKeyDown,
    },
    children
  );

  // Wrap in Container for skill/about variants
  if (shouldUseContainer) {
    return (
      <Container size={containerSize} centered>
        {cardElement}
      </Container>
    );
  }

  return cardElement;
});

const CardMemo = memo(
  CardImpl as unknown as (
    props: CardProps<'div'> & { ref?: ForwardedRef<ComponentRef<'div'>> }
  ) => ReactElement
);
CardMemo.displayName = 'Card';

const Card = Object.assign(CardMemo, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Image: CardImage,
  Title: CardTitle,
  Description: CardDescription,
  Actions: CardActions,
  Grid: CardGrid,
  Meta: CardMeta,
  Project: ProjectCard,
  WorkHistory: WorkHistoryCard,
  Contact: ContactCard,
}) as unknown as CardComponent;

export { Card };
