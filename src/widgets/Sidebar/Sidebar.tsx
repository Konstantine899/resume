// ============================================
// Sidebar Widget - Main Component
// ============================================
import { useTheme } from '@/shared/lib/contexts';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { Menu } from 'lucide-react';
import React from 'react';
import styles from './Sidebar.module.scss';
import { useNavigation } from './hooks/useNavigation';
import { useSidebar } from './hooks/useSidebar';
import { getNavItems } from './model/constants';
import type { SidebarProps } from './model/types';
import { Controls } from './ui/Controls';
import { MobileMenu } from './ui/MobileMenu';
import { Navigation } from './ui/Navigation';
import { SidebarHeader } from './ui/SidebarHeader';
import { ToggleButton } from './ui/ToggleButton';

export const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  onNavigation,
  'data-testid': testId = 'sidebar',
}) => {
  const { theme, toggleTheme, isTransitioning } = useTheme();
  const { toggleLanguage, t, isTransitioning: isLangTransitioning } = useLanguage();

  const { isOpen, isHoverExpanded, toggleSidebar, handleMouseEnter, handleMouseLeave } =
    useSidebar();

  const { activeSection, mobileMenuOpen, setMobileMenuOpen, handleNavClick, handleDesktopKeyDown } =
    useNavigation({ onNavigation });

  const navItems = getNavItems(t);
  const isExpanded = isOpen || isHoverExpanded;

  return (
    <>
      {/* Skip Link */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      {/* Accessibility Announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {mobileMenuOpen ? t('accessibility.menuOpen') : t('accessibility.menuClose')}
        {!mobileMenuOpen &&
          (isExpanded ? t('accessibility.sidebarExpand') : t('accessibility.sidebarCollapse'))}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className={`${styles.mobileMenuButton} ${mobileMenuOpen ? styles.hidden : ''}`}
        aria-label="Open menu"
        type="button"
        aria-expanded={mobileMenuOpen}
      >
        <Menu className={styles.menuIcon} aria-hidden="true" />
      </button>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        items={navItems}
        activeSection={activeSection}
        onNavClick={handleNavClick}
        theme={theme}
        toggleTheme={toggleTheme}
        toggleLanguage={toggleLanguage}
        isTransitioning={isTransitioning}
        isLangTransitioning={isLangTransitioning}
        t={t}
      />

      {/* Desktop Sidebar */}
      <aside
        className={`${styles.desktopSidebar} ${isOpen ? styles.expanded : styles.collapsed} ${isHoverExpanded ? styles.hoverExpanded : ''} ${className}`}
        data-testid={testId}
        aria-expanded={isExpanded}
        role="navigation"
        aria-label="Main navigation"
        onClick={toggleSidebar}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSidebar();
          }
        }}
        tabIndex={0}
      >
        {/* Header */}
        <SidebarHeader
          isCollapsed={!isOpen}
          isHoverExpanded={isHoverExpanded}
          onClick={() => handleNavClick('#home')}
          variant="desktop"
        />

        {/* Navigation */}
        <Navigation
          items={navItems}
          activeSection={activeSection}
          isCollapsed={!isOpen}
          isHoverExpanded={isHoverExpanded}
          onNavClick={handleNavClick}
          onKeyDown={handleDesktopKeyDown}
        />

        {/* Controls */}
        <Controls
          theme={theme}
          toggleTheme={toggleTheme}
          toggleLanguage={toggleLanguage}
          isCollapsed={!isOpen}
          isHoverExpanded={isHoverExpanded}
          variant="desktop"
          isTransitioning={isTransitioning}
          isLangTransitioning={isLangTransitioning}
          t={t}
        />

        {/* Toggle Button */}
        <ToggleButton
          isCollapsed={!isOpen}
          isHoverExpanded={isHoverExpanded}
          onToggle={toggleSidebar}
          t={t}
        />
      </aside>

      {/* Desktop Spacer */}
      <div className={`${styles.desktopSpacer} ${isExpanded ? styles.expanded : ''}`} />
    </>
  );
};

Sidebar.displayName = 'Sidebar';
export default Sidebar;
