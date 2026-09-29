import { useToast } from '@/shared/lib/contexts/ToastContext';
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
import { SkillsCodeWrapper } from './SkillsCodeWrapper';
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
  const { addToast } = useToast();

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
            <Heading level={2} className={styles.title}>
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
          <Heading level={2} className={styles.title}>
            {t('mySkills')}
          </Heading>
          <SkillsCodeWrapper
            role={t('skillsCodeRole')}
            focus={t('skillsCodeFocus')}
            onCopyResult={handleCodeCopy}
          />
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
