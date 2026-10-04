import { DEVELOPER_DATA, PROFILE_STACK } from '@/entities/Developer';
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
  content,
}) => {
  const { t, language } = useLanguage();

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
            {/* The candidate name IS the page h1 (Hero was removed in
                ee547ca — this heading carries the document outline now;
                review fix, was a silent level-3). size="4xl" keeps the
                original visual scale — level alone would jump to 6xl. */}
            <Heading level={1} size="4xl" className={styles.title}>
              {content?.fullName ?? DEVELOPER_DATA.fullName}
            </Heading>
            {/* Recruiter-audit P1: expanded multi-paragraph pitch (i18n both locales). */}
            <div className={styles.description}>
              <Paragraph theme="muted">
                {content?.descriptions[0][language] ?? t('aboutDescription')}
              </Paragraph>
              <Paragraph theme="muted">
                {content?.descriptions[1][language] ?? t('aboutDescription2')}
              </Paragraph>
              <Paragraph theme="muted">
                {content?.descriptions[2][language] ?? t('aboutDescription3')}
              </Paragraph>
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
                  <span className={styles.stat}>{content?.stats[key][language] ?? t(key)}</span>
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
              {content?.ctaLabel[language] ?? t('getInTouch')}
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
