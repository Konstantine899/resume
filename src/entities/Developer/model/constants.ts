import { getInitials } from '@/shared/lib/utils';
import type { DeveloperProfile } from './types';

export const DEVELOPER_DATA: DeveloperProfile = {
  fullName: 'Атрощенко Константин',
  profession: 'Full Stack Разработчик',
  specialties: ['React', 'Node.js', 'TypeScript'],
  skillsLabel: 'Современные Веб-Технологии',
  yearsOfExperience: 6,
  age: 20,
  email: undefined,
  location: undefined,
  avatarUrl: '/avatars/kosmos-avatar-xl.webp',
  avatars: {
    sm: '/avatars/kosmos-avatar-sm.webp',
    md: '/avatars/kosmos-avatar-md.webp',
    lg: '/avatars/kosmos-avatar-lg.webp',
    xl: '/avatars/kosmos-avatar-xl.webp',
  },
};

/**
 * Получить инициалы разработчика
 * Использует универсальную функцию getInitials из shared
 */
export const getDeveloperInitials = (): string => {
  return getInitials(DEVELOPER_DATA.fullName, { maxInitials: 3 });
};
