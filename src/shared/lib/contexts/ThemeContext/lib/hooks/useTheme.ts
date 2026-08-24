// ============================================
// Theme Context - useTheme Hook
// ============================================

import { useContext } from 'react';
import { ThemeContext } from '../../ui/ThemeContext';
import type { ThemeContextType } from '../../model/types';

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
