import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Paragraph } from '@/shared/ui/Paragraph';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Section } from '@/shared/ui/Section';
import { Container } from '@/shared/ui/Container';
import { Heading } from '@/shared/ui/Heading';
import { CardGrid } from '@/shared/ui/Card';
import { SKILLS_DATA } from '@/entities/Skill';
import type { SkillsFeatureProps } from '../model/types/types';
import { SkillItem } from './SkillItem/SkillItem';
import { SkillsCodeWrapper } from './SkillsCodeWrapper';
import styles from './Skills/Skills.module.scss';

/**
 * Внутренний компонент Skills без memo
 * @param props - Пропсы компонента
 * @returns React компонент секции навыков
 */
export const SkillsInner: React.FC<SkillsFeatureProps> = ({
  className = '',
  'data-testid': testId = 'skills',
  content,
}) => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  // Design C: store data wins when provided (HomePage wires selectSkillsData);
  // bare consumers fall back to the entity seed — no react-redux in this slice.
  const data = content ?? SKILLS_DATA;

  // The `developer.ts` snippet moved here from Hero (P9). `SkillsCode` and
  // `SkillsCodeWrapper` are hook-free by contract — `Code` executes function
  // children inside a `useMemo` — so every localized value and the toast
  // callback are resolved up here and passed down as props.
  const handleCodeCopy = (success: boolean) => {
    addToast({
      message: success ? t('codeCopied') : t('codeCopyFailed'),
      type: success ? 'success' : 'error',
      duration: success ? 2000 : 3000,
    });
  };

  // Empty state handling
  if (!data || data.length === 0) {
    return (
      <Section
        size="xl"
        id="skills"
        className={classNames(styles.skillsSection, className)}
        aria-label={t('skillsAriaLabel')}
        data-testid={testId}
      >
        <AnimatedSection animation="fadeUp">
          <Container size="lg" padding="lg">
            {/* Section title = h2: About carries the page h1 (review fix),
                categories below are h3 — no skipped levels (heading-order).
                size="4xl" pins the pre-fix visual scale. */}
            <Heading level={2} size="4xl" className={styles.title}>
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
      aria-label={t('skillsAriaLabel')}
      data-testid={testId}
    >
      <AnimatedSection animation="fadeUp">
        <Container size="lg" padding="lg">
          {/* See above: section h2 under the About h1 (heading-order);
              size pins the old h3 scale. */}
          <Heading level={2} size="4xl" className={styles.title}>
            {t('mySkills')}
          </Heading>
          <SkillsCodeWrapper
            role={t('skillsCodeRole')}
            focus={t('skillsCodeFocus')}
            onCopyResult={handleCodeCopy}
          />
          <CardGrid columns={2} gap="md" role="list" className={styles.categoriesList}>
            {data.map((categoryData, index) => (
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
