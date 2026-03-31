import type { Project, ProjectCategory, ProjectStatus } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: {
      en: 'Full-stack online store with payment integration and admin dashboard',
      ru: 'Полноценный интернет-магазин с интеграцией платежей и админ-панелью',
    },
    techIcons: [
      { name: 'React', url: '/icons/react.svg', invertInDark: true },
      { name: 'Node.js', url: '/icons/nodejs.svg', invertInDark: false },
      { name: 'PostgreSQL', url: '/icons/postgresql.svg', invertInDark: false },
    ],
    link: 'https://ecommerce-demo.com',
    image: '/projects/ecommerce.jpg',
    category: 'ecommerce',
    status: 'completed',
    featured: true,
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    title: 'Analytics Dashboard',
    description: {
      en: 'Real-time analytics dashboard with interactive charts and reports',
      ru: 'Панель аналитики реального времени с интерактивными графиками и отчётами',
    },
    techIcons: [
      { name: 'Next.js', url: '/icons/nextjs.svg', invertInDark: true },
      { name: 'TypeScript', url: '/icons/typescript.svg', invertInDark: false },
      { name: 'D3.js', url: '/icons/d3js.svg', invertInDark: true },
    ],
    link: 'https://dashboard-demo.com',
    image: '/projects/dashboard.jpg',
    category: 'dashboard',
    status: 'completed',
    featured: true,
    createdAt: new Date('2023-09-20'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: '3',
    title: 'Portfolio Website',
    description: {
      en: 'Personal portfolio website with animations and multi-language support',
      ru: 'Персональный сайт-портфолио с анимациями и поддержкой нескольких языков',
    },
    techIcons: [
      { name: 'React', url: '/icons/react.svg', invertInDark: true },
      { name: 'SASS', url: '/icons/sass.svg', invertInDark: false },
      { name: 'Framer Motion', url: '/icons/framer.svg', invertInDark: true },
    ],
    link: 'https://maximusdayton.com',
    image: '/projects/portfolio.jpg',
    category: 'portfolio',
    status: 'in-progress',
    featured: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-15'),
  },
];

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  'ecommerce',
  'portfolio',
  'saas',
  'blockchain',
  'mobile',
  'dashboard',
  'api',
  'other',
];

export const PROJECT_STATUSES: ProjectStatus[] = [
  'completed',
  'in-progress',
  'maintenance',
  'archived',
];
