import { DEVELOPER_DATA } from '@/entities/Developer';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { AvatarAbout } from '@/shared/ui/Avatar';
import { Heading } from '@/shared/ui/Heading';
import { Link } from '@/shared/ui/Link';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Section } from '@/shared/ui/Section';
import type { AboutFeatureProps } from '../model/types';
import styles from './About.module.scss';

export const About: React.FC<AboutFeatureProps> = ({
  className = '',
  'data-testid': testId = 'about',
}) => {
  const { t } = useLanguage();

  return (
    <Section
      size="xl"
      id="about"
      className={classNames(styles.aboutSection, className)}
      data-testid={testId}
    >
      <AnimatedSection delay={200}>
        <div className={styles.content}>
          <div className={styles.avatarContainer}>
            <AvatarAbout alt={DEVELOPER_DATA.fullName} size="sm" />
          </div>

          <Heading level={3} className={styles.title} align="center">
            {t('about')}
          </Heading>
          <Paragraph className={styles.description}>{t('aboutDescription')}</Paragraph>

          <Link
            href="#contact"
            unstyled
            variant="primary"
            underline="never"
            className={styles.ctaButton}
          >
            {t('getInTouch')}
          </Link>
        </div>
      </AnimatedSection>
    </Section>
  );
};
