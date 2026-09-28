import { DEVELOPER_DATA } from '@/entities/Developer';
import aboutPortrait from '@/shared/assets/Firefly_RemoveBackground.png';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Heading } from '@/shared/ui/Heading';
import { Image } from '@/shared/ui/Image';
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
        <div className={styles.stack}>
          <div className={styles.panel} data-testid="about-panel">
            <span className={styles.accent} data-testid="about-accent" aria-hidden="true" />
            <Heading level={3} className={styles.title}>
              {DEVELOPER_DATA.fullName}
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
          <Image
            data-testid="about-portrait"
            src={aboutPortrait}
            alt=""
            decorative
            variant="transparent"
            objectFit="contain"
            size="full"
            className={styles.portrait}
          />
        </div>
      </AnimatedSection>
    </Section>
  );
};
