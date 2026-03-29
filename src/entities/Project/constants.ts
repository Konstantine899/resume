// ============================================
// Project Entity - Constants
// ============================================

import type { Project, TechIcon, ProjectsConfig } from './types';

/**
 * Default project values
 */
export const DEFAULT_PROJECT_VALUES: Partial<Project> = {
  category: 'other',
  status: 'completed',
  featured: false,
  link: null,
};

/**
 * Technology icons library
 */
export const TECH_ICONS: Record<string, TechIcon> = {
  react: { 
    name: 'React', 
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' 
  },
  nextjs: { 
    name: 'Next.js', 
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', 
    invertInDark: true 
  },
  tailwind: { 
    name: 'Tailwind CSS', 
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' 
  },
  framer: { 
    name: 'Framer Motion', 
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/framermotion/framermotion-original.svg', 
    invertInDark: true 
  },
  javascript: { 
    name: 'JavaScript', 
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' 
  },
  nodejs: { 
    name: 'Node.js', 
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' 
  },
  css: { 
    name: 'CSS', 
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' 
  },
  html: { 
    name: 'HTML', 
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' 
  },
  redux: { 
    name: 'Redux', 
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg' 
  },
  typescript: { 
    name: 'TypeScript', 
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' 
  },
  aws: { 
    name: 'AWS', 
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg' 
  },
  solidity: { 
    name: 'Solidity', 
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/solidity/solidity-original.svg', 
    invertInDark: true 
  },
  vite: {
    name: 'Vite',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg'
  },
  sass: {
    name: 'Sass',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sass/sass-original.svg'
  },
  git: {
    name: 'Git',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg'
  },
  github: {
    name: 'GitHub',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg',
    invertInDark: true
  },
  mongodb: {
    name: 'MongoDB',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg'
  },
  postgresql: {
    name: 'PostgreSQL',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg'
  },
  docker: {
    name: 'Docker',
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg'
  }
};

/**
 * Sample projects data
 */
export const projects: Project[] = [
  {
    id: 'dragonfly',
    title: 'Dragonfly',
    description: {
      en: 'Dragonfly is a fully vertically integrated cannabis company that manages product from seed to sale, and the first medical cannabis company in Utah!',
      ru: 'Dragonfly — полностью вертикально интегрированная компания по производству каннабиса, управляющая продуктом от семени до продажи, первая медицинская каннабис-компания в Юте!'
    },
    techIcons: [TECH_ICONS.react, TECH_ICONS.nextjs, TECH_ICONS.tailwind, TECH_ICONS.framer],
    link: 'https://dragonflyprocessing.com',
    image: 'https://ext.same-assets.com/55871041/1910007590.webp',
    category: 'saas',
    status: 'completed',
    featured: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 'idea-makers',
    title: 'Idea Makers',
    description: {
      en: 'Idea Makers is a full stack product development firm that can turn any Idea into a reality! I developed their new, revamped website!',
      ru: 'Idea Makers — компания по разработке продуктов полного цикла, способная воплотить любую идею в реальность! Я разработал их новый, обновлённый сайт!'
    },
    techIcons: [TECH_ICONS.react, TECH_ICONS.javascript, TECH_ICONS.nodejs, TECH_ICONS.css],
    link: 'https://ideamakersinc.com',
    image: 'https://ext.same-assets.com/55871041/141458236.webp',
    category: 'portfolio',
    status: 'completed',
    featured: true,
    createdAt: new Date('2022-06-01'),
    updatedAt: new Date('2022-06-01'),
  },
  {
    id: 'crypto-tracker',
    title: 'Crypto Tracker',
    description: {
      en: 'A real-time cryptocurrency tracking application with portfolio management and price alerts.',
      ru: 'Приложение для отслеживания криптовалют в реальном времени с управлением портфелем и уведомлениями о ценах.'
    },
    techIcons: [TECH_ICONS.react, TECH_ICONS.typescript, TECH_ICONS.solidity, TECH_ICONS.nodejs],
    link: 'https://github.com/username/crypto-tracker',
    image: 'https://ext.same-assets.com/55871041/987654321.webp',
    category: 'blockchain',
    status: 'in-progress',
    featured: false,
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-03-01'),
  },
  {
    id: 'task-manager',
    title: 'Task Manager Pro',
    description: {
      en: 'A collaborative task management application with real-time updates and team collaboration features.',
      ru: 'Приложение для совместного управления задачами с обновлениями в реальном времени и функциями командной работы.'
    },
    techIcons: [TECH_ICONS.react, TECH_ICONS.nodejs, TECH_ICONS.mongodb, TECH_ICONS.docker],
    link: 'https://taskmanager-pro.vercel.app',
    image: 'https://ext.same-assets.com/55871041/123456789.webp',
    category: 'saas',
    status: 'completed',
    featured: true,
    createdAt: new Date('2022-09-01'),
    updatedAt: new Date('2022-09-01'),
  }
];

/**
 * Projects configuration
 */
export const PROJECTS_CONFIG: ProjectsConfig = {
  itemsPerPage: 10,
  defaultSort: 'createdAt',
  defaultSortOrder: 'desc',
  enableSearch: true,
  enableFilters: true,
};

/**
 * Utility functions
 */

/**
 * Get project by ID
 */
export const getProjectById = (projects: Project[], id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};

/**
 * Filter projects based on criteria
 */
export const filterProjects = (projects: Project[], filters: any): Project[] => {
  return projects.filter(project => {
    if (filters.category && project.category !== filters.category) return false;
    if (filters.status && project.status !== filters.status) return false;
    if (filters.featured !== undefined && project.featured !== filters.featured) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        project.title.toLowerCase().includes(searchLower) ||
        project.description.en.toLowerCase().includes(searchLower) ||
        project.description.ru.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
};

/**
 * Sort projects
 */
export const sortProjects = (projects: Project[], sortBy: keyof Project, order: 'asc' | 'desc' = 'desc'): Project[] => {
  return [...projects].sort((a, b) => {
    const aValue = a[sortBy] ?? '';
    const bValue = b[sortBy] ?? '';
    
    if (order === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
};