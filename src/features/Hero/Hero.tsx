// ============================================
// Hero Feature
// ============================================
import { useLanguage } from '@/shared/lib/contexts/LanguageContext';
import React from 'react';
import styles from './Hero.module.scss';
import { HeroProps } from './types';

/**
 * Hero Feature Component
 * Main hero section with introduction and call-to-action.
 */
export const Hero: React.FC<HeroProps> = ({
  className = '',
  onGetResume,
  'data-testid': testId = 'hero',
}) => {
  const { t } = useLanguage();

  return (
    <section id="home" className={`${styles.hero} ${className}`} data-testid={testId}>
      {/* Gradient Background */}
      <div className={styles.gradientBackground} />

      {/* Overlay for better text contrast */}
      <div className={styles.overlay} />
      <div className={styles.content}>
        {/* Left side - Text content */}
        <div className={styles.leftContent}>
          {/* Greeting */}
          <h1 className={styles.greeting}>{t.greeting}</h1>
          <h2 className={styles.name}>{t.name}</h2>

          {/* Code Block */}
          <div className={styles.codeBlock}>
            {/* Terminal dots */}
            <div className={styles.terminalDots}>
              <div className={`${styles.dot} ${styles.red}`} />
              <div className={`${styles.dot} ${styles.yellow}`} />
              <div className={`${styles.dot} ${styles.green}`} />
            </div>

            {/* Code content */}
            <div className={styles.codeContent}>
              <pre>
                <span className={styles.keyword}>kosmos</span>
                <span className={styles.punctuation}> = {'{'}</span>
                {'\n\n'}
                <span className={styles.property}>fullName:</span>
                <span className={styles.string}>'{t.fullName}'</span>
                <span className={styles.punctuation}>,</span>
                {'\n'}
                <span className={styles.property}> profession:</span>
                <span className={styles.string}>'{t.profession}'</span>
                <span className={styles.punctuation}>,</span>
                {'\n'}
                <span className={styles.property}> specialties:</span>
                <span className={styles.string}>'{t.specialties}'</span>
                <span className={styles.punctuation}>,</span>
                {'\n'}
                <span className={styles.property}> skills:</span>
                <span className={styles.string}>'{t.skillsLabel}'</span>
                <span className={styles.punctuation}>,</span>
                {'\n'}
                <span className={styles.property}> {t.yearsOfExperience}:</span>
                <span className={styles.number}>6</span>
                <span className={styles.punctuation}>,</span>
                {'\n'}
                <span className={styles.property}> {t.age}:</span>
                <span className={styles.number}>20</span>
                {'\n\n'}
                <span className={styles.punctuation}>{'};'}</span>
              </pre>
            </div>
          </div>

          {/* Resume Button */}
          <a
            href="#"
            className={styles.resumeButton}
            onClick={(e) => {
              e.preventDefault();
              onGetResume?.();
            }}
          >
            {t.getResume}
          </a>
        </div>

        {/* Right side - Photo */}
        <div className={styles.rightContent}>
          <div className={styles.photoContainer}>
            {/* Outer glow effect */}
            <div className={styles.photoGlow} />

            {/* Photo circle */}
            <div className={styles.photoCircle}>
              <div className={styles.photoInner}>
                {/* Placeholder with initials */}
                <span className={styles.initial}>M</span>
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
