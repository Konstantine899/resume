import { PROFILE_STACK } from '@/entities/Developer';
import React from 'react';

export interface SkillsCodeProps {
  /** Localized role, e.g. "Senior Full-Stack Developer" */
  role: string;
  /** Localized focus line, e.g. "Accessible, tested, maintainable web apps" */
  focus: string;
}

/**
 * Syntax-highlighted `developer.ts` snippet inside the Hero code block.
 *
 * Selling-oriented object: `role` + `stack` + `focus` only — no age and no
 * other personal data (recruiter audit P0). Property names stay code-English;
 * the stack entries come from the shared `PROFILE_STACK` (proper nouns, same
 * convention as the Skills data).
 *
 * MUST stay hook-free. `Code` derives the clipboard text by calling function
 * components as plain functions (`lib/utils/extractTextFromNode`), which runs
 * inside a `useMemo` in `useCopyCode`. A hook here is therefore called from
 * inside another hook's callback: React throws "Do not call Hooks inside
 * useMemo", the partially-registered hook corrupts the hook list, and the
 * whole tree unmounts. Localized strings are passed in as props by the Hero
 * instead of being read via `useLanguage` here.
 */
const SkillsCode: React.FC<SkillsCodeProps> = ({ role, focus }) => (
  <>
    <span className="keyword">const</span> <span className="property">developer</span> ={' '}
    <span className="punctuation">{'{'}</span>
    {'\n'}
    {'  '}
    <span className="property">role</span>: <span className="string">&apos;{role}&apos;</span>,
    {'\n'}
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
    <span className="property">focus</span>: <span className="string">&apos;{focus}&apos;</span>
    {'\n'}
    <span className="punctuation">{'};'}</span>
  </>
);

export default SkillsCode;
