// ============================================
// Hero Feature
// ============================================
import { DEVELOPER_DATA } from '@/entities/Developer';

import { useLanguage } from '@/shared/lib/i18n/hooks';
import { Code } from '@/shared/ui/Code';
import { AvatarHero } from '@/shared/ui/Avatar';
import React from 'react';
import { HeroProps } from '../model/types';
import styles from './Hero.module.scss';

const SkillsCode: React.FC = () => {
  const skills = DEVELOPER_DATA.skills;

  return (
    <>
      <span className="keyword">const</span> <span className="property">developer</span> ={' '}
      <span className="punctuation">{'{'}</span>
      {'\n'}
      {'  '}
      <span className="property">fullName</span>:{' '}
      <span className="string">&apos;{DEVELOPER_DATA.fullName}&apos;</span>,{'\n'}
      {'  '}
      <span className="property">profession</span>:{' '}
      <span className="string">&apos;{DEVELOPER_DATA.profession}&apos;</span>,{'\n'}
      {'  '}
      <span className="property">yearsOfExperience</span>:{' '}
      <span className="number">{DEVELOPER_DATA.yearsOfExperience}</span>,{'\n'}
      {'  '}
      <span className="property">age</span>: <span className="number">{DEVELOPER_DATA.age}</span>,
      {'\n'}
      {'  '}
      <span className="property">skills</span>: <span className="punctuation">{'{'}</span>
      {'\n'}
      {'    '}
      <span className="property">frontend</span>: <span className="punctuation">[</span>
      {skills?.frontend.map((skill, i) => (
        <React.Fragment key={skill}>
          <span className="string">&apos;{skill}&apos;</span>
          <span className="punctuation">{i < skills.frontend.length - 1 ? ', ' : ''}</span>
        </React.Fragment>
      ))}
      <span className="punctuation">]</span>,{'\n'}
      {'    '}
      <span className="property">backend</span>: <span className="punctuation">[</span>
      {skills?.backend.map((skill, i) => (
        <React.Fragment key={skill}>
          <span className="string">&apos;{skill}&apos;</span>
          <span className="punctuation">{i < skills.backend.length - 1 ? ', ' : ''}</span>
        </React.Fragment>
      ))}
      <span className="punctuation">]</span>,{'\n'}
      {'    '}
      <span className="property">testing</span>: <span className="punctuation">[</span>
      {skills?.testing.map((skill, i) => (
        <React.Fragment key={skill}>
          <span className="string">&apos;{skill}&apos;</span>
          <span className="punctuation">{i < skills.testing.length - 1 ? ', ' : ''}</span>
        </React.Fragment>
      ))}
      <span className="punctuation">]</span>,{'\n'}
      {'    '}
      <span className="property">devops</span>: <span className="punctuation">[</span>
      {skills?.devops.map((skill, i) => (
        <React.Fragment key={skill}>
          <span className="string">&apos;{skill}&apos;</span>
          <span className="punctuation">{i < skills.devops.length - 1 ? ', ' : ''}</span>
        </React.Fragment>
      ))}
      <span className="punctuation">]</span>
      {'\n'}
      {'  '}
      <span className="punctuation">{'}'}</span>
      {'\n'}
      <span className="punctuation">{'};'}</span>
    </>
  );
};

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
          <h1 className={styles.greeting}>{t(`greeting`)}</h1>
          <h2 className={styles.name}>{t(`name`)}</h2>

          {/* Code Block с навыками */}
          <Code
            variant="block"
            title="developer.ts"
            language="TypeScript"
            copyable
            showLineNumbers
            className={styles.codeBlock}
          >
            <SkillsCode />
          </Code>

          {/* Resume Button */}
          <a
            href="#"
            className={styles.resumeButton}
            onClick={(e) => {
              e.preventDefault();
              onGetResume?.();
            }}
          >
            {t(`getResume`)}
          </a>
        </div>

        {/* Right side - Photo */}
        <div className={styles.rightContent}>
          <AvatarHero
            alt={DEVELOPER_DATA.fullName}
            size="xl"
            showGlow
            showRing
            showSkeleton={false}
          />
        </div>
      </div>
    </section>
  );
};

Hero.displayName = 'Hero';
export default Hero;
