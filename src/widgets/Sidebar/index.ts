// ============================================
// Sidebar Widget - Public API
// ============================================

// Main Component
export type { SidebarProps } from './model/types';
export { Sidebar } from './Sidebar';

// UI Components (for advanced usage)
export { Controls } from './ui/Controls';
export { MobileMenu } from './ui/MobileMenu';
export { Navigation } from './ui/Navigation';
export { NavItem } from './ui/NavItem';
export { SidebarHeader } from './ui/SidebarHeader';
export { ToggleButton } from './ui/ToggleButton';

// Hooks (for custom implementations)
export { useNavigation } from './hooks/useNavigation';
export { useSidebar } from './hooks/useSidebar';

// Model
export { getNavItems, SIDEBAR_STORAGE_KEY } from './model/constants';
export type { NavItem as NavItemType } from './model/types';
