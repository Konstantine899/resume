// ============================================
// AdminTechnologies feature — Public API
// ============================================
//
// Consumed by the lazy /admin/technologies page only (WU-4). The barrel
// exports ONLY the editor UI: the page composes it with entity
// selectors imported directly from @/entities/Technology (pages →
// entities is legal). RHF rides the lazy chunk because the showcase
// bundle never imports this barrel (resume-lazy-rhf-chunk).

export { TechnologiesList } from './ui/TechnologiesList/TechnologiesList';
export type { TechnologiesListProps } from './ui/TechnologiesList/TechnologiesList';
export { TechnologyForm } from './ui/TechnologyForm/TechnologyForm';
export type { TechnologyFormProps } from './ui/TechnologyForm/TechnologyForm';
