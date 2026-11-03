// ============================================
// Static RU seed texts (lazy ru locale — issue #298)
// ============================================
//
// The ru LOCALE BUNDLE is loaded lazily (config/i18n.ts: loadRu/whenReady),
// but the About/Contact content seeds must carry REAL ru copy at store-init
// time for EVERY visitor: an en browser opening the admin vitrina would
// otherwise see — and could save — empty ru fields. So the ru half of the
// bilingual seed records lives here as static data.
//
// Drift cannot happen silently: locales-parity.test.ts pins every entry to
// its ru.json value (seed ⇄ locale equality), and the feature seed.test.ts
// files assert create*Seed() against ru.json as well. The en side keeps
// importing en.json directly — en ships statically with the i18next init and
// never goes lazy.

export const SEED_RU_TEXTS = {
  // AdminAbout seed (features/AdminAbout/model/services/seed.ts)
  aboutDescription:
    'Увлеченный full stack разработчик с 6+ годами опыта создания современных веб-приложений.',
  aboutDescription2:
    'Работаю с React и TypeScript на фронтенде, Node.js, PostgreSQL и Docker на бэкенде — с доставкой через CI/CD и GitHub Actions.',
  aboutDescription3:
    'Тесты, доступность и интернационализация есть в каждом проекте, а работаю я удалённо в разных часовых поясах.',
  aboutStatYears: '6+ лет',
  aboutStatProjects: '7+ проектов',
  aboutStatUsers: '1M+ пользователей',
  aboutStatRemote: 'Готов к удалённой работе',
  getInTouch: 'Наймите Меня',
  // AdminContact seed (features/AdminContact/model/services/seed.ts)
  contactDescription:
    'Я всегда открыт для обсуждения новых проектов, творческих идей или возможностей стать частью вашего видения.',
  responseTimeHint: 'Отвечаю в течение 24 часов',
  nameField: 'Имя',
  email: 'Email',
  message: 'Сообщение',
  namePlaceholder: 'введите имя',
  emailPlaceholder: 'введите email',
  messagePlaceholder: 'введите сообщение',
  sendMessage: 'Отправить Сообщение',
  sending: 'Отправка...',
  contactFormRequired: 'Все поля обязательны для заполнения',
  contactFormSent: 'Сообщение успешно отправлено!',
  contactFormError: 'Не удалось отправить сообщение. Попробуйте позже.',
  contactFormConfigError: 'Не удалось отправить сообщение. Попробуйте позже.',
} as const;
