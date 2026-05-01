import { useTheme } from '@/shared/lib/contexts';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { SKILLS_DATA } from '../model/constants';
import type { SkillsFeatureProps } from '../model/types';
import styles from './Skills.module.scss';

export const Skills: React.FC<SkillsFeatureProps> = ({
  className = '',
  'data-testid': testId = 'skills',
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <section id="skills" className={`${styles.skillsSection} ${className}`} data-testid={testId}>
      <AnimatedSection animation="fadeUp">
        <div className={styles.card}>
          <h3 className={styles.title}>{t(`mySkills`)}</h3>

          <div className={styles.skillsGrid}>
            {SKILLS_DATA.map((skill, index) => (
              <AnimatedSection key={index} animation="fadeIn" delay={index * 30}>
                <div className={styles.skillItem}>
                  <img
                    src={skill.icon}
                    alt={skill.name}
                    className={`${styles.icon} ${skill.invertInDark && theme === 'dark' ? styles.invert : ''}`}
                  />
                  <span className={styles.label}>{skill.name}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
};
