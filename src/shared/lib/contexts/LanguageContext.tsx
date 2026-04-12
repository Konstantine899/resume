// ============================================
// Language Context (Shared Layer)
// ============================================

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type Language = 'en' | 'ru';

const TRANSITION_DURATION = 300;

export interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: Record<string, string>;
  isTransitioning: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const getInitialLanguage = (): Language => {
  // SSR guard
  if (typeof window === 'undefined') {
    return 'en';
  }

  // Проверяем localStorage
  const savedLanguage = localStorage.getItem('language');

  if (savedLanguage === 'en' || savedLanguage === 'ru') {
    return savedLanguage as Language;
  }

  // Язык по умолчанию
  return 'en';
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const translations = {
  en: {
    greeting: 'Hi,',
    name: "I'm Konstantin",
    fullName: 'Atroschenko Konstantin',
    profession: 'Full Stack Developer',
    specialties:
      'React, Node.js, TypeScript, React, Node.js, TypeScript, React, Node.js, TypeScript',
    skillsLabel: 'Modern Web Technologies',
    mySkills: 'My Skills',
    yearsOfExperience: 'yearsOfExperience',
    age: 'age',
    getResume: 'Get Resume',
    home: 'Home',
    work: 'Work',
    about: 'About',
    contact: 'Contact',
    skills: 'Skills',
    uses: 'Uses',
    language: 'EN',
    languageFull: 'English',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    footerTitle: 'Made with ❤️ by Maximus',
    myWork: 'My Work',
    builtUsing: 'Built using',
    link: 'Link',
    workHistory: 'Work History',
    present: 'Present',
    aboutDescription:
      'Passionate full stack developer with 6+ years of experience creating modern web applications.',
    getInTouch: 'Get in Touch',
    email: 'Email',
    sendMessage: 'Send Message',
    nameField: 'Name',
    message: 'Message',
    sending: 'Sending...',
    sent: 'Sent!',
    technologies: 'Technologies',
    tools: 'Tools',
    languages: 'Languages',
  },
  ru: {
    greeting: 'Привет, я',
    name: 'Константин',
    fullName: 'Атрощенко Константин',
    profession: 'Full Stack Разработчик',
    specialties: 'React, Node.js, TypeScript',
    skillsLabel: 'Современные Веб-Технологии',
    mySkills: 'Мои Навыки',
    yearsOfExperience: 'летОпыта',
    age: 'возраст',
    getResume: 'Скачать Резюме',
    home: 'Главная',
    work: 'Работы',
    about: 'Обо мне',
    contact: 'Контакты',
    skills: 'Навыки',
    uses: 'Инструменты',
    language: 'РУ',
    languageFull: 'Русский',
    darkMode: 'Тёмная Тема',
    lightMode: 'Светлая Тема',
    footerTitle: 'Сделано с ❤️ Максимусом',
    myWork: 'Мои Работы',
    builtUsing: 'Создано с помощью',
    link: 'Ссылка',
    workHistory: 'История Работы',
    present: 'Настоящее время',
    aboutDescription:
      'Увлеченный full stack разработчик с 6+ годами опыта создания современных веб-приложений.',
    getInTouch: 'Связаться',
    email: 'Email',
    sendMessage: 'Отправить Сообщение',
    nameField: 'Имя',
    message: 'Сообщение',
    sending: 'Отправка...',
    sent: 'Отправлено!',
    technologies: 'Технологии',
    tools: 'Инструменты',
    languages: 'Языки',
  },
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Эффект только для синхронизации с DOM и localStorage
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);

  // Cleanup при unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const toggleLanguage = () => {
    // Очищаем предыдущий таймер
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    setIsTransitioning(true);
    setLanguage((prev) => (prev === 'en' ? 'ru' : 'en'));

    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isTransitioning }}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageContext };
export default LanguageProvider;
