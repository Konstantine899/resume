import { DEVELOPER_DATA } from '@/entities/Developer';
import React from 'react';

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

export default SkillsCode;
