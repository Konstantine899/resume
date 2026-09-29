import { PROFILE_STACK } from '@/entities/Developer';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import React from 'react';

/**
 * Syntax-highlighted `developer.ts` snippet inside the Hero code block.
 *
 * Selling-oriented object: `role` + `stack` + `focus` only — no age and no
 * other personal data (recruiter audit P0). Property names stay code-English;
 * the `role` / `focus` values come from i18n, the stack entries come from the
 * shared `PROFILE_STACK` (proper nouns, same convention as the Skills data).
 */
const SkillsCode: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      <span className="keyword">const</span> <span className="property">developer</span> ={' '}
      <span className="punctuation">{'{'}</span>
      {'\n'}
      {'  '}
      <span className="property">role</span>:{' '}
      <span className="string">&apos;{t('heroRole')}&apos;</span>,{'\n'}
      {'  '}
      <span className="property">stack</span>: <span className="punctuation">[</span>
      {PROFILE_STACK.map((skill) => (
        <React.Fragment key={skill}>
          {'\n    '}
          <span className="string">&apos;{skill}&apos;</span>
          <span className="punctuation">,</span>
        </React.Fragment>
      ))}
      {'\n  '}
      <span className="punctuation">]</span>,{'\n'}
      {'  '}
      <span className="property">focus</span>:{' '}
      <span className="string">&apos;{t('heroFocus')}&apos;</span>
      {'\n'}
      <span className="punctuation">{'};'}</span>
    </>
  );
};

export default SkillsCode;
