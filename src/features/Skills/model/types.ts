/**
 * Публичные пропсы компонента Skills (UI-контракт фичи).
 * Данные-контракт (SkillCategory, Technology, SkillCategoryData, SKILLS_DATA)
 * живёт в `entities/Skill` (plan_skills_crud §1 — feature→feature запрещено).
 */
import type { SkillCategoryData } from '@/entities/Skill';

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
}
