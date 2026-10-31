import type { SkillCategoryData } from '../types/types';

// Frontend иконки

// Backend иконки

// Testing иконки

// DevOps иконки

// Architecture иконки

// AI иконки

/**
 * Данные навыков сгруппированы по категориям
 * Все иконки — локальные SVG файлы из shared/assets/icons/skills/
 */
export const SKILLS_DATA: SkillCategoryData[] = [
  {
    category: 'frontend',
    categoryName: 'Frontend',
    technologies: [
      { name: 'JavaScript (ES6+)', iconSvg: 'javascript' },
      { name: 'TypeScript', iconSvg: 'typescript' },
      { name: 'React', iconSvg: 'react' },
      { name: 'Redux Toolkit', iconSvg: 'redux' },
      { name: 'SASS/SCSS', iconSvg: 'sass' },
      { name: 'Material-UI', iconSvg: 'material-ui' },
      { name: 'Ant Design', iconSvg: 'ant-design' },
      { name: 'Chakra UI', iconSvg: 'chakra-ui' },
      { name: 'ESLint', iconSvg: 'eslint' },
      { name: 'Webpack', iconSvg: 'webpack' },
      { name: 'Babel', iconSvg: 'babel' },
      { name: 'Vite', iconSvg: 'vitejs' },
      { name: 'i18next', iconSvg: 'i18next' },
    ],
  },
  {
    category: 'backend',
    categoryName: 'Backend',
    technologies: [
      { name: 'Node.js', iconSvg: 'nodejs' },
      { name: 'Express', iconSvg: 'express' },
      { name: 'Nest.js', iconSvg: 'nestjs' },
      { name: 'REST API', iconSvg: 'api' },
      { name: 'WebSocket', iconSvg: 'websocket' },
      { name: 'Long Polling', iconSvg: 'long-polling' },
      { name: 'Sequelize', iconSvg: 'sequelize' },
      { name: 'PassportJS', iconSvg: 'passportjs' },
      { name: 'Swagger', iconSvg: 'swagger' },
      { name: 'Axios', iconSvg: 'axios' },
      { name: 'bcrypt', iconSvg: 'bcrypt' },
      { name: 'JWT', iconSvg: 'jwt' },
    ],
  },
  {
    category: 'testing',
    categoryName: 'Testing',
    technologies: [
      { name: 'React Testing Library', iconSvg: 'testing-library' },
      { name: 'Jest', iconSvg: 'jest' },
      { name: 'Cypress', iconSvg: 'cypress' },
      { name: 'Storybook', iconSvg: 'storybook' },
    ],
  },
  {
    category: 'devops',
    categoryName: 'DevOps & CI/CD',
    technologies: [
      { name: 'Docker', iconSvg: 'docker' },
      { name: 'Git', iconSvg: 'git' },
      { name: 'GitHub Actions', iconSvg: 'github-actions' },
    ],
  },
  {
    category: 'architecture',
    categoryName: 'Architecture',
    technologies: [
      { name: 'Feature-Sliced Design (FSD)', iconSvg: 'fsd' },
      { name: 'Domain-Driven Design (DDD)', iconSvg: 'ddd' },
    ],
  },
  {
    category: 'ai',
    categoryName: 'AI & Automation',
    technologies: [
      // AI IDE & Assistants
      {
        name: 'Cursor',
        iconSvg: 'cursor',
        invertInDark: true,
      },
      {
        name: 'GitHub Copilot',
        iconSvg: 'github-copilot',
        invertInDark: true,
      },
      {
        name: 'OpenCode AI',
        iconSvg: 'opencode-ai',
        invertInDark: true,
      },
      // AI Engineering
      {
        name: 'Ollama',
        iconSvg: 'ollama',
        invertInDark: true,
      },
      {
        name: 'Hugging Face',
        iconSvg: 'hugging-face',
        invertInDark: true,
        iconFilter:
          'brightness(0) saturate(100%) invert(87%) sepia(99%) saturate(339%) hue-rotate(346deg)',
      },
      {
        name: 'LangChain',
        iconSvg: 'langchain',
        iconFilter:
          'brightness(0) saturate(100%) invert(22%) sepia(96%) saturate(436%) hue-rotate(155deg)',
      },
      // AI Agents & Automation
      {
        name: 'AI Agents',
        iconSvg: 'bot',
        iconFilter:
          'brightness(0) saturate(100%) invert(69%) sepia(89%) saturate(2196%) hue-rotate(251deg)',
      },
      {
        name: 'Workflow Automation',
        iconSvg: 'n8n',
        invertInDark: true,
        iconFilter:
          'brightness(0) saturate(100%) invert(83%) sepia(43%) saturate(4720%) hue-rotate(325deg)',
      },
    ],
  },
];
