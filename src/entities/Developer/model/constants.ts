import { getInitials } from '@/shared/lib/utils';
import type { DeveloperProfile } from './types';

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
  yearsOfExperience: 6,
  age: 36,
};

/**
 * Получить инициалы разработчика
 * Использует универсальную функцию getInitials из shared
 */
export const getDeveloperInitials = (): string => {
  return getInitials(DEVELOPER_DATA.fullName, { maxInitials: 3 });
};
