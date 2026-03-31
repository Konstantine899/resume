import type { Skill, SkillCategory, SkillLevel } from './types';

export const SKILLS: Skill[] = [
  // Frontend
  {
    id: '1',
    name: 'React',
    level: 'expert',
    category: 'frontend',
    yearsOfExperience: 5,
    lastUsed: '2024',
    iconUrl: '/icons/react.svg',
    featured: true,
    projectIds: ['1', '3'],
  },
  {
    id: '2',
    name: 'TypeScript',
    level: 'advanced',
    category: 'frontend',
    yearsOfExperience: 4,
    lastUsed: '2024',
    iconUrl: '/icons/typescript.svg',
    featured: true,
    projectIds: ['2', '3'],
  },
  {
    id: '3',
    name: 'Next.js',
    level: 'advanced',
    category: 'frontend',
    yearsOfExperience: 3,
    lastUsed: '2024',
    iconUrl: '/icons/nextjs.svg',
    featured: true,
    projectIds: ['2'],
  },
  {
    id: '4',
    name: 'SASS/SCSS',
    level: 'advanced',
    category: 'frontend',
    yearsOfExperience: 4,
    lastUsed: '2024',
    iconUrl: '/icons/sass.svg',
    featured: false,
    projectIds: ['3'],
  },

  // Backend
  {
    id: '5',
    name: 'Node.js',
    level: 'advanced',
    category: 'backend',
    yearsOfExperience: 4,
    lastUsed: '2024',
    iconUrl: '/icons/nodejs.svg',
    featured: true,
    projectIds: ['1'],
  },

  // Database
  {
    id: '6',
    name: 'PostgreSQL',
    level: 'intermediate',
    category: 'database',
    yearsOfExperience: 3,
    lastUsed: '2024',
    iconUrl: '/icons/postgresql.svg',
    featured: true,
    projectIds: ['1'],
  },

  // DevOps
  {
    id: '7',
    name: 'Docker',
    level: 'intermediate',
    category: 'devops',
    yearsOfExperience: 2,
    lastUsed: '2024',
    iconUrl: '/icons/docker.svg',
    featured: false,
    projectIds: ['1'],
  },
  {
    id: '8',
    name: 'AWS',
    level: 'intermediate',
    category: 'devops',
    yearsOfExperience: 2,
    lastUsed: '2024',
    iconUrl: '/icons/aws.svg',
    featured: false,
    projectIds: ['1'],
  },

  // Tools
  {
    id: '9',
    name: 'Git',
    level: 'expert',
    category: 'tools',
    yearsOfExperience: 6,
    lastUsed: '2024',
    iconUrl: '/icons/git.svg',
    featured: true,
    projectIds: ['1', '2', '3'],
  },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  'frontend',
  'backend',
  'database',
  'devops',
  'tools',
  'soft-skills',
];

export const SKILL_LEVELS: SkillLevel[] = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
];
