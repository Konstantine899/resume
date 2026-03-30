// ============================================
// Job Entity - Constants
// ============================================

import type { Job, JobType, JobLocation, JobsConfig } from './types';

/**
 * Default job values
 */
export const DEFAULT_JOB_VALUES: Partial<Job> = {
  type: 'full-time',
  location: 'remote',
  featured: false,
  companyWebsite: null,
  companyLogo: null,
  endDate: null, // current position
};

/**
 * Sample jobs data
 */
export const jobs: Job[] = [
  {
    id: 'freelance-2020',
    company: 'Freelance',
    position: 'Full Stack Developer',
    description: {
      en: 'Developing web applications for various clients using modern technologies including React, Node.js, and cloud services.',
      ru: 'Разработка веб-приложений для различных клиентов с использованием современных технологий, включая React, Node.js и облачные сервисы.'
    },
    responsibilities: {
      en: [
        'Developed full-stack web applications for clients across various industries',
        'Implemented responsive designs and optimized performance',
        'Integrated third-party APIs and services',
        'Provided technical consulting and project management'
      ],
      ru: [
        'Разрабатывал full-stack веб-приложения для клиентов из различных отраслей',
        'Реализовывал адаптивный дизайн и оптимизировал производительность',
        'Интегрировал сторонние API и сервисы',
        'Оказывал технические консультации и управление проектами'
      ]
    },
    achievements: {
      en: [
        'Successfully delivered 15+ projects with 100% client satisfaction',
        'Reduced application load time by 40% through optimization',
        'Implemented CI/CD pipelines for multiple projects'
      ],
      ru: [
        'Успешно завершил 15+ проектов со 100% удовлетворенностью клиентов',
        'Сократил время загрузки приложений на 40% за счет оптимизации',
        'Внедрил CI/CD пайплайны для нескольких проектов'
      ]
    },
    technologies: ['React', 'TypeScript', 'Node.js', 'Next.js', 'MongoDB', 'AWS', 'Docker'],
    startDate: new Date('2020-01-01'),
    endDate: null, // current position
    type: 'freelance',
    location: 'remote',
    companyWebsite: null,
    companyLogo: null,
    featured: true,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2023-12-01'),
  },
  {
    id: 'startup-2019',
    company: 'Startup Company',
    position: 'Frontend Developer',
    description: {
      en: 'Built responsive user interfaces and collaborated with design team to create modern web applications.',
      ru: 'Создавал адаптивные пользовательские интерфейсы и сотрудничал с командой дизайнеров для разработки современных веб-приложений.'
    },
    responsibilities: {
      en: [
        'Developed responsive UI components using React and TypeScript',
        'Collaborated with UX/UI designers to implement designs',
        'Participated in code reviews and team meetings',
        'Optimized application performance and accessibility'
      ],
      ru: [
        'Разрабатывал адаптивные UI компоненты с использованием React и TypeScript',
        'Сотрудничал с UX/UI дизайнерами для реализации дизайнов',
        'Участвовал в code review и командных встречах',
        'Оптимизировал производительность и доступность приложений'
      ]
    },
    achievements: {
      en: [
        'Improved application performance by 30%',
        'Implemented design system used across multiple projects',
        'Mentored junior developers'
      ],
      ru: [
        'Улучшил производительность приложений на 30%',
        'Внедрил дизайн-систему, используемую в нескольких проектах',
        'Наставлял junior разработчиков'
      ]
    },
    technologies: ['React', 'JavaScript', 'CSS', 'Sass', 'Webpack', 'Git'],
    startDate: new Date('2019-06-01'),
    endDate: new Date('2020-12-31'),
    type: 'full-time',
    location: 'onsite',
    companyWebsite: 'https://startupcompany.example.com',
    companyLogo: null,
    featured: true,
    createdAt: new Date('2019-06-01'),
    updatedAt: new Date('2020-12-31'),
  },
  {
    id: 'techcorp-2018',
    company: 'Tech Corporation',
    position: 'Junior Web Developer',
    description: {
      en: 'Assisted in development and maintenance of corporate websites and internal tools.',
      ru: 'Помогал в разработке и поддержке корпоративных сайтов и внутренних инструментов.'
    },
    responsibilities: {
      en: [
        'Maintained existing websites and fixed bugs',
        'Developed new features for internal tools',
        'Assisted senior developers with project tasks',
        'Participated in testing and quality assurance'
      ],
      ru: [
        'Поддерживал существующие сайты и исправлял ошибки',
        'Разрабатывал новые функции для внутренних инструментов',
        'Помогал senior разработчикам с задачами проекта',
        'Участвовал в тестировании и обеспечении качества'
      ]
    },
    achievements: {
      en: [
        'Successfully completed 50+ bug fixes',
        'Implemented automated testing for critical features',
        'Received "Rising Star" award'
      ],
      ru: [
        'Успешно завершил 50+ исправлений ошибок',
        'Внедрил автоматизированное тестирование для критических функций',
        'Получил награду "Восходящая звезда"'
      ]
    },
    technologies: ['HTML', 'CSS', 'JavaScript', 'jQuery', 'PHP', 'MySQL'],
    startDate: new Date('2018-03-01'),
    endDate: new Date('2019-05-31'),
    type: 'full-time',
    location: 'hybrid',
    companyWebsite: 'https://techcorp.example.com',
    companyLogo: null,
    featured: false,
    createdAt: new Date('2018-03-01'),
    updatedAt: new Date('2019-05-31'),
  }
];

/**
 * Jobs configuration
 */
export const JOBS_CONFIG: JobsConfig = {
  itemsPerPage: 10,
  defaultSort: 'startDate',
  defaultSortOrder: 'desc',
  enableSearch: true,
  enableFilters: true,
};

/**
 * Utility functions
 */

/**
 * Get job by ID
 */
export const getJobById = (jobs: Job[], id: string): Job | undefined => {
  return jobs.find(job => job.id === id);
};

/**
 * Filter jobs based on criteria
 */
export const filterJobs = (jobs: Job[], filters: any): Job[] => {
  return jobs.filter(job => {
    if (filters.type && job.type !== filters.type) return false;
    if (filters.location && job.location !== filters.location) return false;
    if (filters.featured !== undefined && job.featured !== filters.featured) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        job.company.toLowerCase().includes(searchLower) ||
        job.position.toLowerCase().includes(searchLower) ||
        job.description.en.toLowerCase().includes(searchLower) ||
        job.description.ru.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
};

/**
 * Sort jobs
 */
export const sortJobs = (jobs: Job[], sortBy: keyof Job, order: 'asc' | 'desc' = 'desc'): Job[] => {
  return [...jobs].sort((a, b) => {
    const aValue = a[sortBy] ?? '';
    const bValue = b[sortBy] ?? '';
    
    if (order === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
};

/**
 * Get current job (where endDate is null)
 */
export const getCurrentJob = (jobs: Job[]): Job | undefined => {
  return jobs.find(job => job.endDate === null);
};

/**
 * Calculate total experience in years
 */
export const calculateTotalExperience = (jobs: Job[]): number => {
  let totalMonths = 0;
  
  jobs.forEach(job => {
    const endDate = job.endDate || new Date();
    const months = (endDate.getFullYear() - job.startDate.getFullYear()) * 12 +
                   (endDate.getMonth() - job.startDate.getMonth());
    totalMonths += Math.max(0, months);
  });
  
  return Math.round(totalMonths / 12 * 10) / 10; // Return with 1 decimal place
};