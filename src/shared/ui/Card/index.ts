// ============================================
// Card Component - Public API
// ============================================

// Base types
export type { BaseCardProps, CardVariant, CardSize, CardRadius, TechIcon } from './model/types';

// Specialized card types
export type {
  ProjectCardProps,
  WorkHistoryCardProps,
  ContactCardProps,
  SkillCardProps,
  AboutCardProps,
} from './model/types';

// Composition API types
export type {
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
  CardImageProps,
} from './model/types';

// Event types
export type { CardClickEvent, CardClickHandler, CardHoverHandler } from './model/types';

// Constants for configuration and validation
export { CARD_CONSTANTS } from './model/constants';

// Components
export { Card } from './ui/Card';
export { ProjectCard } from './ui/ProjectCard';
export { WorkHistoryCard } from './ui/WorkHistoryCard';
export { ContactCard } from './ui/ContactCard';

// Composition components
export { CardHeader } from './ui/CardHeader';
export { CardBody } from './ui/CardBody';
export { CardFooter } from './ui/CardFooter';
export { CardImage } from './ui/CardImage';
