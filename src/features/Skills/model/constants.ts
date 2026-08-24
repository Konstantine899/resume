import type { SkillCategoryData } from './types';

// Frontend иконки
import javascriptIcon from '@/shared/assets/icons/skills/javascript.svg';
import typescriptIcon from '@/shared/assets/icons/skills/typescript.svg';
import reactIcon from '@/shared/assets/icons/skills/react.svg';
import reduxIcon from '@/shared/assets/icons/skills/redux.svg';
import sassIcon from '@/shared/assets/icons/skills/sass.svg';
import materialUiIcon from '@/shared/assets/icons/skills/material-ui.svg';
import antDesignIcon from '@/shared/assets/icons/skills/ant-design.svg';
import chakraUiIcon from '@/shared/assets/icons/skills/chakra-ui.svg';
import eslintIcon from '@/shared/assets/icons/skills/eslint.svg';
import webpackIcon from '@/shared/assets/icons/skills/webpack.svg';
import babelIcon from '@/shared/assets/icons/skills/babel.svg';
import vitejsIcon from '@/shared/assets/icons/skills/vitejs.svg';
import i18nextIcon from '@/shared/assets/icons/skills/i18next.svg';

// Backend иконки
import nodejsIcon from '@/shared/assets/icons/skills/nodejs.svg';
import expressIcon from '@/shared/assets/icons/skills/express.svg';
import nestjsIcon from '@/shared/assets/icons/skills/nestjs.svg';
import apiIcon from '@/shared/assets/icons/skills/api.svg';
import websocketIcon from '@/shared/assets/icons/skills/websocket.svg';
import longPollingIcon from '@/shared/assets/icons/skills/long-polling.svg';
import sequelizeIcon from '@/shared/assets/icons/skills/sequelize.svg';
import passportIcon from '@/shared/assets/icons/skills/passportjs.svg';
import swaggerIcon from '@/shared/assets/icons/skills/swagger.svg';
import axiosIcon from '@/shared/assets/icons/skills/axios.svg';
import bcryptIcon from '@/shared/assets/icons/skills/bcrypt.svg';
import jwtIcon from '@/shared/assets/icons/skills/jwt.svg';

// Testing иконки
import jestIcon from '@/shared/assets/icons/skills/jest.svg';
import cypressIcon from '@/shared/assets/icons/skills/cypress.svg';
import testingLibraryIcon from '@/shared/assets/icons/skills/testing-library.svg';
import storybookIcon from '@/shared/assets/icons/skills/storybook.svg';

// DevOps иконки
import dockerIcon from '@/shared/assets/icons/skills/docker.svg';
import gitIcon from '@/shared/assets/icons/skills/git.svg';
import githubActionsIcon from '@/shared/assets/icons/skills/github-actions.svg';

// Methodologies иконки
import agileIcon from '@/shared/assets/icons/skills/agile.svg';
import solidIcon from '@/shared/assets/icons/skills/solid.svg';
import principlesIcon from '@/shared/assets/icons/skills/principles.svg';

// Architecture иконки
import fsdIcon from '@/shared/assets/icons/skills/fsd.svg';
import dddIcon from '@/shared/assets/icons/skills/ddd.svg';

// AI иконки
import cursorIcon from '@/shared/assets/icons/skills/cursor.svg';
import githubCopilotIcon from '@/shared/assets/icons/skills/github-copilot.svg';
import ollamaIcon from '@/shared/assets/icons/skills/ollama.svg';
import huggingFaceIcon from '@/shared/assets/icons/skills/hugging-face.svg';
import langchainIcon from '@/shared/assets/icons/skills/langchain.svg';
import botIcon from '@/shared/assets/icons/skills/bot.svg';
import n8nIcon from '@/shared/assets/icons/skills/n8n.svg';
import opencodeAiIcon from '@/shared/assets/icons/skills/opencode-ai.svg';

/**
 * Данные навыков сгруппированы по категориям
 * Все иконки — локальные SVG файлы из shared/assets/icons/skills/
 */
export const SKILLS_DATA: SkillCategoryData[] = [
  {
    category: 'frontend',
    categoryName: 'Frontend',
    technologies: [
      { name: 'JavaScript (ES6+)', iconSvg: javascriptIcon },
      { name: 'TypeScript', iconSvg: typescriptIcon },
      { name: 'React', iconSvg: reactIcon },
      { name: 'Redux Toolkit', iconSvg: reduxIcon },
      { name: 'SASS/SCSS', iconSvg: sassIcon },
      { name: 'Material-UI', iconSvg: materialUiIcon },
      { name: 'Ant Design', iconSvg: antDesignIcon },
      { name: 'Chakra UI', iconSvg: chakraUiIcon },
      { name: 'ESLint', iconSvg: eslintIcon },
      { name: 'Webpack', iconSvg: webpackIcon },
      { name: 'Babel', iconSvg: babelIcon },
      { name: 'Vite', iconSvg: vitejsIcon },
      { name: 'i18next', iconSvg: i18nextIcon },
    ],
  },
  {
    category: 'backend',
    categoryName: 'Backend',
    technologies: [
      { name: 'Node.js', iconSvg: nodejsIcon },
      { name: 'Express', iconSvg: expressIcon },
      { name: 'Nest.js', iconSvg: nestjsIcon },
      { name: 'REST API', iconSvg: apiIcon },
      { name: 'WebSocket', iconSvg: websocketIcon },
      { name: 'Long Polling', iconSvg: longPollingIcon },
      { name: 'Sequelize', iconSvg: sequelizeIcon },
      { name: 'PassportJS', iconSvg: passportIcon },
      { name: 'Swagger', iconSvg: swaggerIcon },
      { name: 'Axios', iconSvg: axiosIcon },
      { name: 'bcrypt', iconSvg: bcryptIcon },
      { name: 'JWT', iconSvg: jwtIcon },
    ],
  },
  {
    category: 'testing',
    categoryName: 'Testing',
    technologies: [
      { name: 'React Testing Library', iconSvg: testingLibraryIcon },
      { name: 'Jest', iconSvg: jestIcon },
      { name: 'Cypress', iconSvg: cypressIcon },
      { name: 'Storybook', iconSvg: storybookIcon },
    ],
  },
  {
    category: 'devops',
    categoryName: 'DevOps & CI/CD',
    technologies: [
      { name: 'Docker', iconSvg: dockerIcon },
      { name: 'Git', iconSvg: gitIcon },
      { name: 'GitHub Actions', iconSvg: githubActionsIcon },
    ],
  },
  {
    category: 'methodologies',
    categoryName: 'Methodologies',
    technologies: [
      { name: 'Agile', iconSvg: agileIcon },
      { name: 'SOLID', iconSvg: solidIcon },
      { name: 'DRY', iconSvg: principlesIcon },
      { name: 'KISS', iconSvg: principlesIcon },
      { name: 'YAGNI', iconSvg: principlesIcon },
    ],
  },
  {
    category: 'architecture',
    categoryName: 'Architecture',
    technologies: [
      { name: 'Feature-Sliced Design (FSD)', iconSvg: fsdIcon },
      { name: 'Domain-Driven Design (DDD)', iconSvg: dddIcon },
    ],
  },
  {
    category: 'ai',
    categoryName: 'AI & Automation',
    technologies: [
      // AI IDE & Assistants
      {
        name: 'Cursor',
        iconSvg: cursorIcon,
        invertInDark: true,
      },
      {
        name: 'GitHub Copilot',
        iconSvg: githubCopilotIcon,
        invertInDark: true,
      },
      {
        name: 'OpenCode AI',
        iconSvg: opencodeAiIcon,
        invertInDark: true,
      },
      // AI Engineering
      {
        name: 'Ollama',
        iconSvg: ollamaIcon,
        invertInDark: true,
      },
      {
        name: 'Hugging Face',
        iconSvg: huggingFaceIcon,
        invertInDark: true,
        iconFilter:
          'brightness(0) saturate(100%) invert(87%) sepia(99%) saturate(339%) hue-rotate(346deg)',
      },
      {
        name: 'LangChain',
        iconSvg: langchainIcon,
        iconFilter:
          'brightness(0) saturate(100%) invert(22%) sepia(96%) saturate(436%) hue-rotate(155deg)',
      },
      // AI Agents & Automation
      {
        name: 'AI Agents',
        iconSvg: botIcon,
        iconFilter:
          'brightness(0) saturate(100%) invert(69%) sepia(89%) saturate(2196%) hue-rotate(251deg)',
      },
      {
        name: 'Workflow Automation',
        iconSvg: n8nIcon,
        invertInDark: true,
        iconFilter:
          'brightness(0) saturate(100%) invert(83%) sepia(43%) saturate(4720%) hue-rotate(325deg)',
      },
    ],
  },
];
