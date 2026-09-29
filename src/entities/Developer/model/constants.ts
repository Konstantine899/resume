import { getInitials } from '@/shared/lib/utils';
import { GitHubIcon, LinkedInIcon } from '@/shared/ui/Icon';
import { Send } from 'lucide-react';
import type { DeveloperProfile, SocialLink } from './types';

export const DEVELOPER_DATA: DeveloperProfile = {
  fullName: 'Атрощенко Константин',
  profession: 'Full Stack Разработчик',
  specialties: ['React', 'Node.js', 'TypeScript', 'TypeScript'],
  skillsLabel: 'Современные Веб-Технологии',
  skills: {
    frontend: [
      'JavaScript (ES6+)',
      'TypeScript',
      'React',
      'Redux Toolkit',
      'SASS/SCSS',
      'UI-Kit',
      'ESLint',
      'Webpack',
      'Babel',
      'Vite',
      'i18n',
    ],
    backend: [
      'Node.js',
      'Express',
      'Nest.js',
      'REST API',
      'WebSocket',
      'Long Polling',
      'Sequelize',
      'PassportJS',
      'Swagger',
      'Axios',
      'bcrypt',
      'JWT',
    ],
    testing: ['React Testing Library', 'Jest', 'Cypress', 'Storybook'],
    devops: ['Docker', 'Git', 'GitHub Actions'],
    methodologies: ['Agile', 'FSD', 'SOLID', 'DRY', 'KISS', 'YAGNI'],
    architecture: ['Feature-Sliced Design (FSD)', 'Domain-Driven Design (DDD)'],
  },
};

/**
 * Headline stack shown in the Hero code block / stack badges and the About
 * panel badges — the single source both features read (FSD: features may
 * only import from entities/shared, so the list lives HERE).
 */
export const PROFILE_STACK = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'] as const;

/**
 * Public social profiles of the developer — single source of truth for the
 * Contact section, the Hero socials, and the Nav SocialLinks row.
 * `labelKey` is the i18n aria-label used wherever the links are rendered.
 */
export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    name: 'GitHub',
    href: 'https://github.com/konstantin-atroshchenko',
    icon: GitHubIcon,
    labelKey: 'githubLabel',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/konstantin-atroshchenko',
    icon: LinkedInIcon,
    labelKey: 'linkedInLabel',
  },
  {
    name: 'Telegram',
    href: 'https://t.me/konstantin_atroshchenko',
    icon: Send,
    labelKey: 'telegramLabel',
  },
];

/**
 * Получить инициалы разработчика
 * Использует универсальную функцию getInitials из shared
 */
export const getDeveloperInitials = (): string => {
  return getInitials(DEVELOPER_DATA.fullName, { maxInitials: 3 });
};
