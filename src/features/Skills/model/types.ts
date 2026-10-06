/**
 * Публичные пропсы компонента Skills (UI-контракт фичи).
 * Данные-контракт (SkillCategory, Technology, SkillCategoryData, SKILLS_DATA)
 * живёт в `entities/Skill` (plan_skills_crud §1 — feature→feature запрещено).
 */
export interface SkillsFeatureProps {
  /** Дополнительный CSS класс */
  className?: string;
  /** Test ID для тестирования */
  'data-testid'?: string;
}
