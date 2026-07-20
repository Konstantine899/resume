import { memo } from 'react';
import type { SkillCategoryData } from '../../model/types';
import styles from './SkillItem.module.scss';

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
  const { category, categoryName, technologies } = categoryData;

  return (
    <div
      className={styles.skillItem}
      data-category={category}
      role="listitem"
      aria-label={`${categoryName}: ${technologies.length} технологий`}
      data-testid={testId}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className={styles.categoryName}>{categoryName}</h3>

      <div className={styles.skillsGrid} role="list">
        {technologies.map((tech) => (
          <div key={tech.name} className={styles.techItem} role="listitem" aria-label={tech.name}>
            <img
              src={tech.iconSvg}
              alt={tech.name}
              className={`${styles.techIcon}${tech.invertInDark ? ` ${styles.invertInDark}` : ''}`}
              loading="lazy"
              style={{ filter: tech.iconFilter }}
            />
            <span className={styles.techName}>{tech.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkillItem = memo(SkillItemInner);
