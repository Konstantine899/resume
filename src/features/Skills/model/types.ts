/**
 * Категория навыка для группировки технологий
 */
export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'testing'
  | 'devops'
  | 'methodologies'
  | 'architecture'
  | 'ai';

/**
 * Отдельная технология внутри категории
 */
export interface Technology {
  /** Название технологии (например, "React", "Node.js") */
  name: string;
  /** SVG иконка (локальный файл из shared/assets/icons/skills/) */
  iconSvg: string;
  /** Инвертировать ли иконку в тёмной теме (для светлых логотипов) */
  invertInDark?: boolean;
  /** CSS filter для раскраски монохромных иконок */
  iconFilter?: string;
}

/**
 * Данные категории навыков
 */
export interface SkillCategoryData {
  /** Идентификатор категории */
  category: SkillCategory;
  /** Отображаемое название категории */
  categoryName: string;
  /** Список технологий в категории */
  technologies: Technology[];
}

/**
 * Пропсы для компонента Skills
 */
export interface SkillsFeatureProps {
  /** Дополнительный CSS класс */
  className?: string;
  /** Test ID для тестирования */
  'data-testid'?: string;
}
