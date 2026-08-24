import { Heading } from '@/shared/ui/Heading';
import type { CardTitleProps } from '../../model/types';

/**
 * Заголовок карточки. Делегирует рендеринг компоненту Heading
 * для консистентной типографики.
 *
 * @example
 * ```tsx
 * <Card>
 *   <Card.Title>Default h3 title</Card.Title>
 *   <Card.Title as="h2">Custom level</Card.Title>
 *   <Card.Title size="l" theme="gradient">Styled title</Card.Title>
 * </Card>
 * ```
 */
export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  as = 'h3',
  size = 'm',
  theme = 'primary',
  align,
  ...props
}) => {
  return (
    <Heading as={as} size={size} theme={theme} align={align} className={className} {...props}>
      {children}
    </Heading>
  );
};

CardTitle.displayName = 'CardTitle';
