import { useCard } from '../model/useCard';
import { memo, createElement } from 'react';
import type { ElementType } from 'react';
import type {
  CardOwnProps,
  ProjectCardProps,
  WorkHistoryCardProps,
  ContactCardProps,
} from '../model/types';
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

  const Tag = component ?? 'div';
  const isNativeDiv = Tag === 'div';

  return createElement(
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
