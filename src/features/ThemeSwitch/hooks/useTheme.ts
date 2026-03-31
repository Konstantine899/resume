// ============================================
// useTheme Hook
// ============================================

import { ThemeContext } from '@/shared/lib/contexts';
import { useContext } from 'react';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default useTheme;
