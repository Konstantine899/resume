import { DEVELOPER_DATA } from '@/entities/Developer';
import { useTheme } from '@/shared/lib/contexts';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { getInitials } from '@/shared/lib/utils';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import type { AboutFeatureProps } from '../model/types';
import styles from './About.module.scss';

export const About: React.FC<AboutFeatureProps> = ({
  className = '',
  'data-testid': testId = 'about',
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <section id="about" className={`${styles.container} ${className}`} data-testid={testId}>
      <AnimatedSection animation="fadeUp">
        <h2 className={styles.sectionTitle}>{t('aboutTitle')}</h2>
      </AnimatedSection>

      <AnimatedSection delay={200}>
        <div className={styles.content}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatarWrapper}>
              <div
                className={`${styles.avatarInner} ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                {getInitials(DEVELOPER_DATA.fullName, { maxInitials: 2 })}
              </div>
            </div>
          </div>

          <h3 className={styles.title}>{t('about')}</h3>
          <p className={styles.description}>{t('aboutDescription')}</p>

          <a href="#contact" className={styles.ctaButton}>
            {t('getInTouch')}
          </a>
        </div>
      </AnimatedSection>
    </section>
  );
};
