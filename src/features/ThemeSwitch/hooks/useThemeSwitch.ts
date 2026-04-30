import { useTheme } from '@/shared/lib/contexts';
import type { UseThemeSwitchReturn } from '../model/types';

/**
 * ThemeSwitch Feature Hook
 * Wraps shared theme context with feature-specific logic
 */
export const useThemeSwitch = (): UseThemeSwitchReturn => {
  const { theme, toggleTheme, isTransitioning } = useTheme();

  return {
    theme,
    toggleTheme,
    isTransitioning,
  };
};
