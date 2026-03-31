import type { EmploymentType, Job, JobLevel } from './types';

export const JOBS: Job[] = [
  {
    id: '1',
    company: 'Tech Corp International',
    position: 'Senior Full-Stack Developer',
    period: '2022 — Present',
    startDate: new Date('2022-03-01'),
    endDate: null,
    description: {
      en: [
        'Led development of microservices architecture serving 1M+ users',
        'Mentored team of 5 junior developers',
        'Implemented CI/CD pipelines reducing deployment time by 60%',
        'Architected real-time data processing system',
      ],
      ru: [
        'Руководил разработкой микросервисной архитектуры для 1M+ пользователей',
        'Наставлял команду из 5 junior разработчиков',
        'Внедрил CI/CD пайплайны, сократив время деплоя на 60%',
        'Спроектировал систему обработки данных в реальном времени',
      ],
    },
    technologies: ['React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL', 'Redis'],
    location: 'Remote',
    current: true,
    employmentType: 'full-time',
    level: 'senior',
    companyUrl: 'https://techcorp.com',
    featured: true,
  },
  {
    id: '2',
    company: 'StartUp Innovations',
    position: 'Frontend Developer',
    period: '2020 — 2022',
    startDate: new Date('2020-06-01'),
    endDate: new Date('2022-02-28'),
    description: {
      en: [
        'Built responsive web applications using React and TypeScript',
        'Optimized application performance by 40%',
        'Collaborated with UX/UI design team on component library',
        'Implemented automated testing suite with 85% coverage',
      ],
      ru: [
        'Разрабатывал адаптивные веб-приложения на React и TypeScript',
        'Оптимизировал производительность приложений на 40%',
        'Сотрудничал с командой дизайна над библиотекой компонентов',
        'Внедрил автоматизированное тестирование с покрытием 85%',
      ],
    },
    technologies: ['React', 'TypeScript', 'SASS', 'Jest', 'Webpack'],
    location: 'New York, USA',
    current: false,
    employmentType: 'full-time',
    level: 'middle',
    companyUrl: 'https://startup-innovations.com',
    featured: false,
  },
  {
    id: '3',
    company: 'Digital Agency Pro',
    position: 'Junior Web Developer',
    period: '2018 — 2020',
    startDate: new Date('2018-09-01'),
    endDate: new Date('2020-05-31'),
    description: {
      en: [
        'Developed client websites using modern web technologies',
        'Learned best practices in code quality and version control',
        'Participated in agile development processes',
      ],
      ru: [
        'Разрабатывал клиентские сайты с использованием современных технологий',
        'Изучал лучшие практики качества кода и контроля версий',
        'Участвовал в процессах agile-разработки',
      ],
    },
    technologies: ['JavaScript', 'HTML/CSS', 'jQuery', 'Git', 'WordPress'],
    location: 'Kyiv, Ukraine',
    current: false,
    employmentType: 'full-time',
    level: 'junior',
    companyUrl: 'https://digitalagencypro.com',
    featured: false,
  },
];

export const EMPLOYMENT_TYPES: EmploymentType[] = [
  'full-time',
  'part-time',
  'contract',
  'freelance',
  'internship',
];

export const JOB_LEVELS: JobLevel[] = [
  'junior',
  'middle',
  'senior',
  'lead',
  'principal',
  'architect',
];
