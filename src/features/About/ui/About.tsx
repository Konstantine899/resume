import { DEVELOPER_DATA } from '@/entities/Developer';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { AvatarAbout } from '@/shared/ui/Avatar';
import { Paragraph } from '@/shared/ui/Paragraph';
import type { AboutFeatureProps } from '../model/types';
import styles from './About.module.scss';

export const About: React.FC<AboutFeatureProps> = ({
  className = '',
  'data-testid': testId = 'about',
}) => {
  const { t } = useLanguage();

  return (
    <section id="about" className={`${styles.container} ${className}`} data-testid={testId}>
      <AnimatedSection animation="fadeUp">
        <h2 className={styles.sectionTitle}>{t('aboutTitle')}</h2>
      </AnimatedSection>

      <AnimatedSection delay={200}>
        <div className={styles.content}>
          <div className={styles.avatarContainer}>
            <AvatarAbout alt={DEVELOPER_DATA.fullName} size="sm" />
          </div>

          <h3 className={styles.title}>{t('about')}</h3>
          <Paragraph className={styles.description}>{t('aboutDescription')}</Paragraph>

          <a href="#contact" className={styles.ctaButton}>
            {t('getInTouch')}
          </a>
        </div>
      </AnimatedSection>
    </section>
  );
};
