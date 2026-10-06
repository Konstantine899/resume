import { memo } from 'react';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Heading } from '@/shared/ui/Heading';
import { CardGrid } from '@/shared/ui/Card';
import { resolveIconSvg, type SkillCategoryData } from '@/entities/Skill';
import styles from './SkillItem.module.scss';

/** Empty 24×24 SVG: the tech NAME beside the icon already identifies it. */
const ICON_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'/%3E";

/** Rot-to-placeholder guard (§7): never let a broken URL loop through onError. */
const handleIconError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const img = event.currentTarget;
  if (img.getAttribute('src') === ICON_FALLBACK) return;
  // eslint-disable-next-line no-console
  console.warn(`[Skills] Icon failed to load — placeholder rendered`);
  img.setAttribute('src', ICON_FALLBACK);
};

/**
 * Пропсы для компонента SkillItem
 */
export interface SkillItemProps {
  /** Данные категории с технологиями */
  categoryData: SkillCategoryData;
  /** Задержка анимации в миллисекундах */
  delay?: number;
  /** Test ID для тестирования */
  'data-testid'?: string;
}

/**
 * Внутренний компонент SkillItem без memo
 * @param props - Пропсы компонента
 * @returns React компонент карточки навыка
 */
const SkillItemInner: React.FC<SkillItemProps> = ({
  categoryData,
  delay = 0,
  'data-testid': testId = 'skill-item',
}) => {
  const { t } = useLanguage();
  const { category, categoryName, technologies } = categoryData;

  return (
    <div
      className={classNames(styles.skillItem)}
      data-category={category}
      role="listitem"
      aria-label={`${categoryName}: ${t('skillsCategoryCount', { count: technologies.length })}`}
      data-testid={testId}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Category = h3: child of the section h2, sibling order stays
          unskipped now that About owns the page h1 (heading-order).
          size="3xl" pins the pre-fix h4 visual scale. */}
      <Heading level={3} size="3xl" className={styles.categoryName}>
        {categoryName}
      </Heading>

      <CardGrid columns={4} gap="sm" role="list" className={styles.skillsGrid}>
        {technologies.map((tech) => (
          <div key={tech.name} className={styles.techItem} role="listitem" aria-label={tech.name}>
            <img
              src={resolveIconSvg(tech.iconSvg) ?? ICON_FALLBACK}
              alt={tech.name}
              className={classNames(styles.techIcon, tech.invertInDark && styles.invertInDark)}
              loading="lazy"
              style={{ filter: tech.iconFilter }}
              onError={handleIconError}
            />
            <span className={styles.techName}>{tech.name}</span>
          </div>
        ))}
      </CardGrid>
    </div>
  );
};

export const SkillItem = memo(SkillItemInner);
