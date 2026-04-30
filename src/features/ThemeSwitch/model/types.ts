export interface UseThemeSwitchReturn {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isTransitioning: boolean;
}

export interface ThemeSwitchProps {
  className?: string;
  'data-testid'?: string;
}
