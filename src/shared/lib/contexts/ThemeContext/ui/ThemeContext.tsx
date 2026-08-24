// ============================================
// Theme Context (Shared Layer)
// ============================================

import React, { createContext, useEffect, useRef, useState } from 'react';
import type { Theme, ThemeContextType } from '../model/types';

const TRANSITION_DURATION = 400;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Функция для получения начальной темы
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'dark';
  }
  // Проверяем localStorage
  const savedTheme = localStorage.getItem('theme');

  // ✅ Явная проверка на валидное значение Theme
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme as Theme;
  }

  // Системные настройки
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Cleanup при unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const toggleTheme = () => {
    // Очищаем предыдущий таймер для предотвращения гонок
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    setIsTransitioning(true);
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext };
export default ThemeProvider;
