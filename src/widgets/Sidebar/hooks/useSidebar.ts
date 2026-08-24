import { useCallback, useEffect, useRef, useState } from 'react';
import { SIDEBAR_STORAGE_KEY } from '../model/constants';

export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      // Silent fallback to default state if localStorage is unavailable
      return true;
    }
  });

  const [isHoverExpanded, setIsHoverExpanded] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Сохранение состояния в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(isOpen));
    } catch {
      // Silent fail if localStorage is unavailable (e.g., private browsing)
    }
  }, [isOpen]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isOpen || isHoverExpanded) return;

    hoverTimerRef.current = setTimeout(() => {
      setIsHoverExpanded(true);
    }, 300);
  }, [isOpen, isHoverExpanded]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsHoverExpanded(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev: boolean) => !prev);
    setIsHoverExpanded(false);

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  return {
    isOpen,
    isHoverExpanded,
    toggleSidebar,
    handleMouseEnter,
    handleMouseLeave,
  };
};
