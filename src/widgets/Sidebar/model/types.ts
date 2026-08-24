import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  icon: LucideIcon;
  href: string;
  label: string;
}

export interface SidebarProps {
  className?: string;
  onNavigation?: (href: string) => void;
  'data-testid'?: string;
}

export interface SidebarState {
  isOpen: boolean;
  mobileMenuOpen: boolean;
  isHoverExpanded: boolean;
}

export interface UseSidebarReturn {
  isOpen: boolean;
  isHoverExpanded: boolean;
  toggleSidebar: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export interface UseNavigationReturn {
  activeSection: string;
  handleNavClick: (href: string) => void;
  handleDesktopKeyDown: (e: React.KeyboardEvent, index: number, total: number) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}
