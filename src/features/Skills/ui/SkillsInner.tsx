import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Paragraph } from '@/shared/ui/Paragraph';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Section } from '@/shared/ui/Section';
import { Container } from '@/shared/ui/Container';
import { Heading } from '@/shared/ui/Heading';
import { CardGrid } from '@/shared/ui/Card';
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
      <Section
        size="xl"
        id="skills"
        className={classNames(styles.skillsSection, className)}
        aria-label="Навыки разработчика"
        data-testid={testId}
      >
        <AnimatedSection animation="fadeUp">
          <Container size="lg" padding="lg">
            <Heading level={3} className={styles.title}>
              {t('mySkills')}
            </Heading>
            <Paragraph theme="muted" align="center" className={styles.emptyState}>
              {t('skillsEmpty')}
            </Paragraph>
          </Container>
        </AnimatedSection>
      </Section>
    );
  }

  return (
    <Section
      size="xl"
      id="skills"
      className={classNames(styles.skillsSection, className)}
      aria-label="Навыки разработчика"
      data-testid={testId}
    >
      <AnimatedSection animation="fadeUp">
        <Container size="lg" padding="lg">
          <Heading level={3} className={styles.title}>
            {t('mySkills')}
          </Heading>
          <CardGrid columns={2} gap="md" role="list" className={styles.categoriesList}>
            {SKILLS_DATA.map((categoryData, index) => (
              <AnimatedSection key={categoryData.category} animation="fadeIn" delay={index * 30}>
                <SkillItem categoryData={categoryData} delay={index * 30} />
              </AnimatedSection>
            ))}
          </CardGrid>
        </Container>
      </AnimatedSection>
    </Section>
  );
};
