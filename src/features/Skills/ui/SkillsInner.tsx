import { useLanguage } from '@/shared/lib/i18n/hooks';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { SKILLS_DATA } from '../model/constants';
import type { SkillsFeatureProps } from '../model/types';
import { SkillItem } from './SkillItem/SkillItem';
import styles from './Skills.module.scss';

/**
 * Внутренний компонент Skills без memo
 * @param props - Пропсы компонента
 * @returns React компонент секции навыков
 */
export const SkillsInner: React.FC<SkillsFeatureProps> = ({
  className = '',
  'data-testid': testId = 'skills',
}) => {
  const { t } = useLanguage();

  // Empty state handling
  if (!SKILLS_DATA || SKILLS_DATA.length === 0) {
    return (
      <section
        id="skills"
        className={`${styles.skillsSection} ${className}`}
        aria-label="Навыки разработчика"
        data-testid={testId}
      >
        <AnimatedSection animation="fadeUp">
          <div className={styles.card}>
            <h3 className={styles.title}>{t('mySkills')}</h3>
            <p className={styles.emptyState}>Навыки не указаны</p>
          </div>
        </AnimatedSection>
      </section>
    );
  }

  return (
    <section
      id="skills"
      className={`${styles.skillsSection} ${className}`}
      aria-label="Навыки разработчика"
      data-testid={testId}
    >
      <AnimatedSection animation="fadeUp">
        <div className={styles.card}>
          <h3 className={styles.title}>{t('mySkills')}</h3>
          <div className={styles.categoriesList} role="list">
            {SKILLS_DATA.map((categoryData, index) => (
              <AnimatedSection key={categoryData.category} animation="fadeIn" delay={index * 30}>
                <SkillItem categoryData={categoryData} delay={index * 30} />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
};
