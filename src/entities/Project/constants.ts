import type { TechIcon } from '@/shared/ui/Card/types';
import { Project, ProjectCategory, ProjectStatus } from './types';

// ============================================
// Централизованный словарь иконок технологий
// ============================================
export const TECH_ICONS: Record<string, TechIcon> = {
  // Frontend
  react: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    invertInDark: true,
  },
  nextjs: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
    invertInDark: true,
  },
  typescript: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  },
  javascript: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
  },

  // Styling
  tailwind: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg',
  },
  css: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
  },
  html: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
  },
  sass: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg',
  },

  // Backend
  nodejs: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  },
  python: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  },
  postgresql: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
  },

  // Tools & Libraries
  redux: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg',
  },
  framer: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/framermotion/framermotion-original.svg',
    invertInDark: true,
  },
  d3js: {
    url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/d3js/d3js-original.svg',
    invertInDark: true,
  },
};

// ============================================
// Проекты портфолио
// ============================================
export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Dragonfly',
    description: {
      en: 'Dragonfly is a fully vertically integrated cannabis company that manages product from seed to sale, and the first medical cannabis company in Utah!',
      ru: 'Dragonfly — полностью вертикально интегрированная компания по производству каннабиса, управляющая продуктом от семени до продажи, первая медицинская каннабис-компания в Юте!',
    },
    techIcons: [TECH_ICONS.react, TECH_ICONS.nextjs, TECH_ICONS.tailwind, TECH_ICONS.framer],
    link: 'https://dragonflyprocessing.com',
    image: 'https://ext.same-assets.com/55871041/1910007590.webp',
    category: 'ecommerce',
    status: 'completed',
    featured: true,
  },
  {
    id: '2',
    title: 'Idea Makers',
    description: {
      en: 'Idea Makers is a full stack product development firm that can turn any Idea into a reality! I developed their new, revamped website!',
      ru: 'Idea Makers — компания по разработке продуктов полного цикла, способная воплотить любую идею в реальность! Я разработал их новый, обновлённый сайт!',
    },
    techIcons: [TECH_ICONS.react, TECH_ICONS.javascript, TECH_ICONS.nodejs, TECH_ICONS.css],
    link: 'https://ideamakersinc.com',
    image: 'https://ext.same-assets.com/55871041/141458236.webp',
    category: 'portfolio',
    status: 'completed',
    featured: true,
  },
  {
    id: '3',
    title: 'Central Valley Foods',
    description: {
      en: 'An ecommerce site for farm products, utilizing online shopping features like a cart, order form, and credit card checkout.',
      ru: 'Интернет-магазин фермерских продуктов с функциями онлайн-покупок: корзина, форма заказа и оплата картой.',
    },
    techIcons: [
      TECH_ICONS.react,
      TECH_ICONS.javascript,
      TECH_ICONS.nodejs,
      TECH_ICONS.redux,
      TECH_ICONS.css,
    ],
    link: 'https://centralvalleyfoods.net',
    image: 'https://ext.same-assets.com/55871041/341412428.webp',
    category: 'ecommerce',
    status: 'completed',
    featured: true,
  },
  {
    id: '4',
    title: 'The Schwab Bakery',
    description: {
      en: 'A stylish site for The Schwab Bakery, a small bakery in Smithfield Utah.',
      ru: 'Стильный сайт для The Schwab Bakery, небольшой пекарни в Смитфилде, Юта.',
    },
    techIcons: [TECH_ICONS.react, TECH_ICONS.javascript, TECH_ICONS.nodejs, TECH_ICONS.css],
    link: 'https://www.schwabbakery.com',
    image: 'https://ext.same-assets.com/55871041/1748978189.webp',
    category: 'portfolio',
    status: 'completed',
    featured: false,
  },
  {
    id: '5',
    title: 'Veteran Lawncare',
    description: {
      en: 'I helped with the some of the design, and implemented some payment features into this Squarespace site.',
      ru: 'Я помог с дизайном и реализовал некоторые платёжные функции на этом сайте Squarespace.',
    },
    techIcons: [TECH_ICONS.html, TECH_ICONS.css, TECH_ICONS.javascript, TECH_ICONS.nodejs],
    link: 'https://www.veteranlawncareandsprinklers.com',
    image: 'https://ext.same-assets.com/55871041/328492081.webp',
    category: 'other',
    status: 'completed',
    featured: false,
  },
  {
    id: '6',
    title: 'Neumorphic Watch Face',
    description: {
      en: 'I created and published a watch face for the Samsung Galaxy Watch using web technologies to prototype it.',
      ru: 'Я создал и опубликовал циферблат для Samsung Galaxy Watch, используя веб-технологии для прототипирования.',
    },
    techIcons: [TECH_ICONS.html, TECH_ICONS.css, TECH_ICONS.javascript],
    link: null,
    image: 'https://ext.same-assets.com/55871041/2829911897.png',
    category: 'mobile',
    status: 'completed',
    featured: false,
  },
  {
    id: '7',
    title: 'COVID-19 Tracker',
    description: {
      en: 'A web app to track the amount of confirmed cases, deaths, and recoveries from COVID-19. Scrapes data from Johns Hopkins.',
      ru: 'Веб-приложение для отслеживания количества подтверждённых случаев, смертей и выздоровлений от COVID-19. Данные из Johns Hopkins.',
    },
    techIcons: [TECH_ICONS.react, TECH_ICONS.javascript, TECH_ICONS.nodejs, TECH_ICONS.css],
    link: '/covid19-tracker',
    image: 'https://ext.same-assets.com/55871041/2693025968.webp',
    category: 'dashboard',
    status: 'completed',
    featured: false,
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
