import { memo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Card } from '@/shared/ui/Card';
import { Heading } from '@/shared/ui/Heading';
import { CardGrid } from '@/shared/ui/Card';
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
    <Card
      hoverable={false}
      className={classNames(styles.skillItem)}
      data-category={category}
      role="listitem"
      aria-label={`${categoryName}: ${technologies.length} технологий`}
      data-testid={testId}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Heading level={4} className={styles.categoryName}>
        {categoryName}
      </Heading>

      <CardGrid columns={4} gap="sm" role="list" className={styles.skillsGrid}>
        {technologies.map((tech) => (
          <div key={tech.name} className={styles.techItem} role="listitem" aria-label={tech.name}>
            <img
              src={tech.iconSvg}
              alt={tech.name}
              className={classNames(styles.techIcon, tech.invertInDark && styles.invertInDark)}
              loading="lazy"
              style={{ filter: tech.iconFilter }}
            />
            <span className={styles.techName}>{tech.name}</span>
          </div>
        ))}
      </CardGrid>
    </Card>
  );
};

export const SkillItem = memo(SkillItemInner);
