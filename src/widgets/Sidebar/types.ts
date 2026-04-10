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
