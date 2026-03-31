// ============================================
// Hero Feature
// ============================================

import { useLanguage } from '@/features/LanguageSwitch/hooks/useLanguage';
import { useTheme } from '@/features/ThemeSwitch/hooks/useTheme';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import React from 'react';
import styles from '../styles/Hero.module.scss';
import type { HeroProps } from '../types';

/**
 * Hero Feature Component
 *
 * Main hero section with introduction and call-to-action.
 * Follows FSD architecture - features layer for user scenarios.
 */
export const Hero: React.FC<HeroProps> = ({
  className = '',
  onGetResume,
  'data-testid': testId = 'hero'
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const handleGetResume = () => {
    onGetResume?.();
  };

  return (
    <section
      id="home"
      className={`${styles.hero} ${className}`}
      data-testid={testId}
    >
      {/* Gradient Background */}
      <div
        className={styles.gradientBackground}
        data-theme={theme}
      />

      {/* Overlay for better text contrast */}
      <div
        className={styles.overlay}
        data-theme={theme}
      />

      <div className={styles.content}>
        {/* Left side - Text content */}
        <div className={styles.textContent}>
          {/* Greeting */}
          <h1 className={styles.greeting}>
            {t.greeting}
          </h1>

          <h2 className={styles.name}>
            {t.name}
          </h2>

          {/* Code Block */}
          <Card className={styles.codeBlock}>
            {/* Terminal dots */}
            <div className={styles.terminalDots}>
              <div className={`${styles.terminalDot} ${styles.red}`} />
              <div className={`${styles.terminalDot} ${styles.yellow}`} />
              <div className={`${styles.terminalDot} ${styles.green}`} />
            </div>

            {/* Code content */}
            <div className={styles.codeContent}>
              <pre className={styles.codePre}>
                <span className={styles.codeVariable}>konstantin</span>
                <span className={styles.codeOperator}> = </span>
                <span className={styles.codeBrace}>{'{'}</span>
                {'\n\n'}
                <span className={styles.codeProperty}>  fullName: </span>
                <span className={styles.codeString}>'{t.fullName}'</span>
                <span className={styles.codeComma}>,</span>
                {'\n'}
                <span className={styles.codeProperty}>  profession: </span>
                <span className={styles.codeString}>'{t.profession}'</span>
                <span className={styles.codeComma}>,</span>
                {'\n'}
                <span className={styles.codeProperty}>  specialties: </span>
                <span className={styles.codeStringAccent}>'{t.specialties}'</span>
                <span className={styles.codeComma}>,</span>
                {'\n'}
                <span className={styles.codeProperty}>  skills: </span>
                <span className={styles.codeString}>'{t.skillsLabel}'</span>
                <span className={styles.codeComma}>,</span>
                {'\n'}
                <span className={styles.codeProperty}>  {t.yearsOfExperience}: </span>
                <span className={styles.codeNumber}>6</span>
                <span className={styles.codeComma}>,</span>
                {'\n'}
                <span className={styles.codeProperty}>  {t.age}: </span>
                <span className={styles.codeNumber}>20</span>
                {'\n\n'}
                <span className={styles.codeBrace}>{'};'}</span>
              </pre>
            </div>
          </Card>

          {/* Resume Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleGetResume}
            className={styles.resumeButton}
          >
            {t.getResume}
          </Button>
        </div>

        {/* Right side - Photo */}
        <div className={styles.photoSection}>
          <div className={styles.photoContainer}>
            {/* Outer glow effect */}
            <div className={styles.photoGlow} />

            {/* Photo circle */}
            <div className={styles.photoCircle}>
              <div
                className={styles.photoInner}
                data-theme={theme}
              >
                {/* Placeholder with initials - replace src with actual photo */}
                <span className={styles.photoInitial}>M</span>
              </div>
            </div>

            {/* Decorative ring */}
            <div className={styles.photoRing} />
          </div>
        </div>
      </div>
    </section>
  );
};

Hero.displayName = 'Hero';

export default Hero;
