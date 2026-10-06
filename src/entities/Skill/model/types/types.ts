/**
 * Категория навыка для группировки технологий
 */
export type SkillCategory =
  'frontend' | 'backend' | 'testing' | 'devops' | 'methodologies' | 'architecture' | 'ai';

/**
 * Отдельная технология внутри категории
 */
export interface Technology {
  /** Название технологии (например, "React", "Node.js") */
  name: string;
  /** SVG иконка (имя файла-ключи из shared/assets/icons/skills/; legacy URL допустим — WU-2 resolver) */
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
  /** Отображаемое название категории (EN-строка, не i18n — A4) */
  categoryName: string;
  /** Список технологий в категории */
  technologies: Technology[];
}
