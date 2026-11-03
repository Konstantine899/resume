/**
 * Публичные пропсы компонента Skills (UI-контракт фичи).
 * Данные-контракт (SkillCategory, SkillTechnology, SkillCategoryData, SKILLS_DATA)
 * живёт в `entities/Skill` (plan_skills_crud §1 — feature→feature запрещено).
 */
import type { SkillCategoryData } from '@/entities/Skill';
import type { Technology } from '@/entities/Technology';

export interface SkillsFeatureProps {
  /** Дополнительный CSS класс */
  className?: string;
  /** Test ID для тестирования */
  'data-testid'?: string;
  /**
   * Данные витрины из стора (Design C — plan_skills_crud §12 WU-4).
   * Опциональный проп: без него (bare-тесты, Storybook) падает на seed
   * `SKILLS_DATA` — react-redux в `features/Skills` ЗАПРЕЩЁН (R-5 hook-free).
   */
  content?: SkillCategoryData[];
  /**
   * Каталог технологий — live source of truth для render-time resolution.
   * Опционально для bare consumers/tests.
   */
  technologyCatalog?: readonly Technology[];
}
