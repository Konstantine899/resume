import { PROFILE_STACK } from '@/entities/Developer';
import aboutPortrait from '@/shared/assets/Firefly_RemoveBackground.png';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Badge } from '@/shared/ui/Badge';
import { Heading } from '@/shared/ui/Heading';
import { Image } from '@/shared/ui/Image';
import { Link } from '@/shared/ui/Link';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Section } from '@/shared/ui/Section';
import { Fragment } from 'react';
import type { AboutFeatureProps } from '../model/types';
import styles from './About.module.scss';

/** Recruiter-audit P1 stats — data-backed, translatable, never invented. */
const STATS_KEYS = [
  'aboutStatYears',
  'aboutStatProjects',
  'aboutStatUsers',
  'aboutStatRemote',
] as const;

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
            <Heading level={1} className={styles.title}>
              {t('fullName')}
            </Heading>
            <Paragraph theme="muted" className={styles.role}>
              {t('developerRole')}
            </Paragraph>
            {/* Recruiter-audit P1: expanded multi-paragraph pitch (i18n both locales). */}
            <div className={styles.description}>
              <Paragraph theme="muted">{t('aboutDescription')}</Paragraph>
              <Paragraph theme="muted">{t('aboutDescription2')}</Paragraph>
              <Paragraph theme="muted">{t('aboutDescription3')}</Paragraph>
            </div>
            {/* Stack badges — shared PROFILE_STACK, scannable proof. */}
            <ul className={styles.stackBadges} data-testid="about-stack">
              {PROFILE_STACK.map((tech) => (
                <li key={tech}>
                  <Badge variant="outline" size="sm">
                    {tech}
                  </Badge>
                </li>
              ))}
            </ul>
            {/* Stats row — translatable facts, separated by decorative dots. */}
            <div className={styles.stats} data-testid="about-stats">
              {STATS_KEYS.map((key, index) => (
                <Fragment key={key}>
                  {index > 0 && (
                    <span className={styles.statSeparator} aria-hidden="true">
                      ·
                    </span>
                  )}
                  <span className={styles.stat}>{t(key)}</span>
                </Fragment>
              ))}
            </div>
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
