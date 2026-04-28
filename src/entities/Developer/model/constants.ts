import type { DeveloperProfile } from './types';

export const DEVELOPER_DATA: DeveloperProfile = {
  fullName: 'Атрощенко Константин',
  profession: 'Full Stack Разработчик',
  specialties: ['React', 'Node.js', 'TypeScript'],
  skillsLabel: 'Современные Веб-Технологии',
  yearsOfExperience: 6,
  age: 20,
  email: undefined, // Заполните при необходимости
  location: undefined, // Заполните при необходимости
  avatarUrl: undefined, // Заполните если есть фото
};

/**
 * Получить инициалы разработчика
 */
export const getDeveloperInitials = (): string => {
  return DEVELOPER_DATA.fullName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase();
};
