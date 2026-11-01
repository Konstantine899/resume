/**
 * Категория навыка для группировки технологий
 */
export type SkillCategory =
  'frontend' | 'backend' | 'testing' | 'devops' | 'methodologies' | 'architecture' | 'ai';

/**
 * Отдельная технология внутри категории
 *
 * Renamed from `Technology` (review finding #2, 2026-10-17): a structurally
 * different record also called `Technology` lives in `entities/Technology`
 * (the /admin/technologies catalog) — the Skill-side type now carries the
 * entity prefix so the two can never be mixed silently.
 */
export interface SkillTechnology {
  /** Название технологии (например, "React", "Node.js") */
  name: string;
  /** SVG иконка (имя файла-ключи из shared/assets/icons/skills/; legacy URL допустим — WU-2 resolver) */
  iconSvg: string;
  /** Инвертировать ли иконку в тёмной теме (для светлых логотипов) */
  invertInDark?: boolean;
  /**
   * Link back to the technology catalog entry that supplied this record.
   * Tokens that: added 2026-11-01 — new adminSkills records must use the catalog
   * as single source of truth; legacy records keep `undefined`.
   */
  techKey?: string;
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
  technologies: SkillTechnology[];
}
