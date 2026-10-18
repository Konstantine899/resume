// ============================================
// AdminTechnologies feature — Public API
// ============================================
//
// Consumed by the lazy /admin/technologies page only (WU-4). The barrel
// exports ONLY the editor UI: the page composes it with entity
// selectors imported directly from @/entities/Technology (pages →
// entities is legal). RHF rides the lazy chunk because the showcase
// bundle never imports this barrel (resume-lazy-rhf-chunk).
//
// Barrel hygiene (issue #301, gold standard admin-jobs-refactor WU-8):
// the two `*Props` type re-exports were dead — the page never names
// them and the components use their own interfaces internally — so
// they are gone. `index.test.ts` pins the contract.

export { TechnologiesList } from './ui/TechnologiesList/TechnologiesList';
export { TechnologyForm } from './ui/TechnologyForm/TechnologyForm';
