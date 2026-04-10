import { ThemeProvider as SharedThemeProvider } from '@/shared/lib/contexts';
import React from 'react';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <SharedThemeProvider>{children}</SharedThemeProvider>;
};

export default ThemeProvider;
