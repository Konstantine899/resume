import { useCard } from '../model/useCard';
import { memo, createElement } from 'react';
import type { ElementType } from 'react';
import type {
  CardOwnProps,
  ProjectCardProps,
  WorkHistoryCardProps,
  ContactCardProps,
} from '../model/types';
import { Container } from '@/shared/ui/Container';
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CardProps extends CardOwnProps, Record<string, any> {
  component?: ElementType;
}

const CardComponent = memo((props: CardProps) => {
  const { variant, size, radius, fullWidth, hoverable, className, children, component, ...rest } =
    props;

  const onClick = (rest as Record<string, unknown>).onClick as React.MouseEventHandler | undefined;
  const { cardClasses, safeVariant, safeSize, safeRadius } = useCard({
    variant,
    size,
    radius,
    fullWidth,
    hoverable,
    className,
    onClick,
  });

  if (safeVariant === 'project') {
    return <ProjectCard {...(rest as unknown as ProjectCardProps)} />;
  }

  if (safeVariant === 'workHistory') {
    return <WorkHistoryCard {...(rest as unknown as WorkHistoryCardProps)} />;
  }

  if (safeVariant === 'contact') {
    return <ContactCard {...(rest as unknown as ContactCardProps)} />;
  }

  // For 'skill' and 'about' variants, wrap content in Container for max-width and centering
  const shouldUseContainer = safeVariant === 'skill' || safeVariant === 'about';
  const containerSize = safeVariant === 'skill' ? 'xl' : 'lg';

  const Tag = component ?? 'div';
  const isNativeDiv = Tag === 'div';

  const cardElement = createElement(
    Tag,
    {
      className: cardClasses,
      role: isNativeDiv ? 'group' : undefined,
      'data-state': hoverable !== false ? 'hoverable' : 'static',
      'data-variant': safeVariant,
      'data-size': safeSize,
      'data-radius': safeRadius,
      ...rest,
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

CardComponent.displayName = 'Card';

const Card = Object.assign(memo(CardComponent), {
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
});

export { Card };
