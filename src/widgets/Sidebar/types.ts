export interface SidebarProps {
  className?: string;
  onNavigation?: (href: string) => void;
  'data-testid'?: string;
}

export interface SidebarState {
  isOpen: boolean;
  mobileMenuOpen: boolean;
}

export interface NavItem {
  icon: React.ComponentType;
  href: string;
  label: string;
}

// Добавить интерфейс для keyboard handlers
export interface KeyboardNavProps {
  onKeyDown?: (e: React.KeyboardEvent, index: number, total: number) => void;
}
