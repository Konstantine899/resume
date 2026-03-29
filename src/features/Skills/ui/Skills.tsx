// ============================================
// Skills Feature
// ============================================

import React from 'react';
import { useLanguage } from '@/features/LanguageSwitch/hooks/useLanguage';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Card } from '@/shared/ui/Card';
import type { SkillsProps } from '../types';
import styles from '../styles/Skills.module.scss';

/**
 * Skills Feature Component
 * 
 * Displays skills and technologies.
 * Follows FSD architecture - features layer for user scenarios.
 */
export const Skills: React.FC<SkillsProps> = ({
  className = '',
  'data-testid': testId = 'skills'
}) => {
  const { t } = useLanguage();

  const skillCategories = [
    {
      title: t.technologies,
      skills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'Vue.js']
    },
    {
      title: t.tools, 
      skills: ['Git', 'Docker', 'AWS', 'Figma', 'Webpack']
    },
    {
      title: t.languages,
      skills: ['JavaScript', 'Python', 'SQL', 'HTML/CSS', 'Sass']
    }
  ];

  return (
    <section 
      id="skills" 
      className={`${styles.skills} ${className}`}
      data-testid={testId}
    >
      <AnimatedSection animation="fadeUp">
        <h2 className={styles.sectionTitle}>{t.skills}</h2>
      </AnimatedSection>
      
      <div className={styles.skillsGrid}>
        {skillCategories.map((category, index) => (
          <AnimatedSection key={category.title} animation="fadeUp" delay={index * 100}>
            <Card className={styles.skillCategory}>
              <h3 className={styles.categoryTitle}>{category.title}</h3>
              <div className={styles.skillsList}>
                {category.skills.map((skill, skillIndex) => (
                  <span key={skillIndex} className={styles.skillItem}>
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
};

Skills.displayName = 'Skills';

export default Skills;