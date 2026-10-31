import { Project, ProjectCategory, ProjectStatus } from '../types/types';

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
    techIcons: ['react', 'nextjs', 'tailwind', 'framer'],
    link: 'https://dragonflyprocessing.com',
    image: '/assets/projects/dragonfly.webp',
    category: 'ecommerce',
    status: 'completed',
    featured: true,
    role: {
      en: 'Frontend Developer',
      ru: 'Фронтенд-разработчик',
    },
    year: 2023,
  },
  {
    id: '2',
    title: 'Idea Makers',
    description: {
      en: 'Idea Makers is a full stack product development firm that can turn any Idea into a reality! I developed their new, revamped website!',
      ru: 'Idea Makers — компания по разработке продуктов полного цикла, способная воплотить любую идею в реальность! Я разработал их новый, обновлённый сайт!',
    },
    techIcons: ['react', 'javascript', 'nodejs', 'css'],
    link: 'https://ideamakersinc.com',
    image: '/assets/projects/idea-makers.webp',
    category: 'portfolio',
    status: 'completed',
    featured: true,
    role: {
      en: 'Full-Stack Developer',
      ru: 'Full-Stack разработчик',
    },
    year: 2023,
  },
  {
    id: '3',
    title: 'Central Valley Foods',
    description: {
      en: 'An ecommerce site for farm products, utilizing online shopping features like a cart, order form, and credit card checkout.',
      ru: 'Интернет-магазин фермерских продуктов с функциями онлайн-покупок: корзина, форма заказа и оплата картой.',
    },
    techIcons: ['react', 'javascript', 'nodejs', 'redux', 'css'],
    link: 'https://centralvalleyfoods.net',
    image: '/assets/projects/central-valley-foods.webp',
    category: 'ecommerce',
    status: 'completed',
    featured: true,
    role: {
      en: 'Full-Stack Developer',
      ru: 'Full-Stack разработчик',
    },
    year: 2023,
  },
  {
    id: '4',
    title: 'The Schwab Bakery',
    description: {
      en: 'A stylish site for The Schwab Bakery, a small bakery in Smithfield Utah.',
      ru: 'Стильный сайт для The Schwab Bakery, небольшой пекарни в Смитфилде, Юта.',
    },
    techIcons: ['react', 'javascript', 'nodejs', 'css'],
    link: 'https://www.schwabbakery.com',
    image: '/assets/projects/schwab-bakery.webp',
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
    techIcons: ['html', 'css', 'javascript', 'nodejs'],
    link: 'https://www.veteranlawncareandsprinklers.com',
    image: '/assets/projects/veteran-lawncare.webp',
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
    techIcons: ['html', 'css', 'javascript'],
    link: null,
    image: '/assets/projects/neumorphic-watch-face.webp',
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
    techIcons: ['react', 'javascript', 'nodejs', 'css'],
    link: '/covid19-tracker',
    image: '/assets/projects/covid19-tracker.webp',
    category: 'dashboard',
    status: 'completed',
    featured: true,
    // Grounded in the real description (Johns Hopkins scraping) — no numbers invented.
    role: {
      en: 'Built a COVID-19 dashboard on Johns Hopkins data',
      ru: 'Собрал дашборд COVID-19 на данных Johns Hopkins',
    },
    year: 2023,
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
