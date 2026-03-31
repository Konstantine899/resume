// ============================================
// Skills Feature
// ============================================
import type { Skill, SkillCategory } from '@/entities/Skill';
import { SKILLS, getFeaturedSkills, getSkillsByCategory } from '@/entities/Skill';
import { useLanguage } from '@/shared/lib/contexts/LanguageContext';
import { AnimatedSection } from '@/shared/ui/AnimatedSection';
import { Card } from '@/shared/ui/Card';
import React from 'react';
import styles from './Skills.module.scss';
import type { SkillsProps } from './types';


export const Skills: React.FC<SkillsProps> = ({
  className = '',
  'data-testid': testId = 'skills'
}) => {
    const { t, language } = useLanguage();


  // ✅ Получаем featured навыки и группируем их
  const featuredSkills = getFeaturedSkills(SKILLS);
  const skillsByCategory = getSkillsByCategory(featuredSkills);

  // Helper для красивых названий категорий
  const getCategoryTitle = (category: SkillCategory): string => {
    const map: Record<SkillCategory, string> = {
      frontend: t.technologies, // Или отдельный ключ перевода
      backend: 'Backend',
      database: 'Databases',
      devops: 'DevOps',
      tools: t.tools,
      'soft-skills': 'Soft Skills',
    };
    return map[category] || category;
  };

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
        {(Object.keys(skillsByCategory) as SkillCategory[]).map((category, index) => (
          <AnimatedSection
            key={category}
            animation="fadeUp"
            delay={index * 100}
          >
            <Card className={styles.skillCategory}>
              <h3 className={styles.categoryTitle}>
                {getCategoryTitle(category)}
              </h3>

              <div className={styles.skillsList}>
                {skillsByCategory[category]?.map((skill: Skill) => (
                  <div key={skill.id} className={styles.skillItem}>
                    {skill.iconUrl && (
                      <img
                        src={skill.iconUrl}
                        alt={skill.name}
                        className={styles.skillIcon}
                      />
                    )}
                    <span className={styles.skillName}>{skill.name}</span>
                    <span className={styles.skillLevel}>{skill.level}</span>
                  </div>
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
