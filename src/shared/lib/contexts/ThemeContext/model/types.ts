// ============================================
// Theme Context Types
// ============================================

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  /** Apply a concrete theme (used for server-authenticated preferences sync). */
  setTheme: (theme: Theme) => void;
  isTransitioning: boolean;
}
