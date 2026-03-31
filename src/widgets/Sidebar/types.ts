// ============================================
// Sidebar Widget - TypeScript Types
// ============================================

/**
 * Sidebar component props
 */
export interface SidebarProps {
  /**
   * Additional CSS class
   */
  className?: string;
  
  /**
   * Callback when navigation item is clicked
   */
  onNavigation?: (href: string) => void;
  
  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

/**
 * Sidebar state
 */
export interface SidebarState {
  isOpen: boolean;
  mobileMenuOpen: boolean;
}

/**
 * Navigation item
 */
export interface NavItem {
  icon: React.ComponentType;
  href: string;
  label: string;
}