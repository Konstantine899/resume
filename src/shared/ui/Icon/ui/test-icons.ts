// Проверка доступных иконок в lucide-react v0.468.0
import {
  // Навигация
  Home,
  Mail,
  // Темы
  Moon,
  Sun,
  // Язык
  Globe,
  // Статусы
  Check,
  X,
  AlertCircle,
  // Соцсети - пробуем оба варианта
  Github,
  // Github - может не существовать в v0.468.0
} from 'lucide-react';

// Экспортируем для использования в stories
export const ICONS = {
  Home,
  Mail,
  Moon,
  Sun,
  Globe,
  Check,
  X,
  AlertCircle,
  Github, // Используем старое название для совместимости
};
