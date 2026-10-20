import { DEVELOPER_DATA, PROFILE_STACK } from '@/entities/Developer';
import aboutPortrait from '@/shared/assets/Firefly_RemoveBackground.webp';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Heading } from '@/shared/ui/Heading';
import { Link } from '@/shared/ui/Link';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Section } from '@/shared/ui/Section';
import { Fragment } from 'react';
import type { AboutFeatureProps } from '../../model/types/types';
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

  // Contract v2 (SPEC D13): the CTA row is optional — `null` means the admin
  // deleted it, so the link disappears entirely. `undefined` (no content prop)
  // keeps the original i18n fallback.
  const ctaText = content ? content.ctaLabel : undefined;

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
            {/* Recruiter-audit P1: expanded multi-paragraph pitch (i18n both
                locales). Contract v2 (D13): with content every paragraph of
                the array is mapped (the seed ships three); without content the
                ORIGINAL three defaults render byte-identically. An empty or
                short array simply renders fewer/no paragraphs — no crash. */}
            <div className={styles.description}>
              {content ? (
                content.descriptions.map((paragraph, index) => (
                  <Paragraph key={index} theme="muted">
                    {paragraph[language]}
                  </Paragraph>
                ))
              ) : (
                <>
                  <Paragraph theme="muted">{t('aboutDescription')}</Paragraph>
                  <Paragraph theme="muted">{t('aboutDescription2')}</Paragraph>
                  <Paragraph theme="muted">{t('aboutDescription3')}</Paragraph>
                </>
              )}
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
            {/* Stats row — translatable facts, separated by decorative dots.
                Contract v2 (D13): with content every record entry renders in
                insertion order (custom stats show the raw value — no i18n
                label on the main page); a deleted key simply disappears.
                Without content the original four i18n stats render as-is. */}
            <div className={styles.stats} data-testid="about-stats">
              {content
                ? Object.entries(content.stats).map(([key, value], index) => (
                    <Fragment key={key}>
                      {index > 0 && (
                        <span className={styles.statSeparator} aria-hidden="true">
                          ·
                        </span>
                      )}
                      <span className={styles.stat}>{value[language]}</span>
                    </Fragment>
                  ))
                : STATS_KEYS.map((key, index) => (
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
            {/* CTA row — `null` = deleted by the admin → the link is hidden
                (D13); no content prop → the original i18n fallback. */}
            {ctaText !== null && (
              <Link
                href="#contact"
                unstyled
                variant="primary"
                underline="never"
                className={styles.ctaButton}
              >
                {ctaText?.[language] ?? t('getInTouch')}
              </Link>
            )}
          </div>
          {/* D14: the portrait runs through the kit Avatar portrait variant —
              transparent/contain/fill mapping lives inside Avatar now. The
              `.portrait` class stays on the root and owns the box (About.module
             .scss is intentionally untouched). */}
          <Avatar
            data-testid="about-portrait"
            src={content?.portrait ?? aboutPortrait}
            alt=""
            variant="portrait"
            className={styles.portrait}
          />
        </div>
      </AnimatedSection>
    </Section>
  );
};
