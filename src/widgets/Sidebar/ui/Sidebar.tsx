// ============================================
// Sidebar Widget
// ============================================

import { useLanguage } from '@/features/LanguageSwitch/hooks/useLanguage';
import { useTheme } from '@/features/ThemeSwitch/hooks/useTheme';
import { Button } from '@/shared/ui/Button';
import {
  ChevronRight,
  Code, FileText,
  Globe,
  Home,
  Mail,
  Menu,
  Monitor,
  Moon,
  Sparkles,
  Sun,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styles from '../styles/Sidebar.module.scss';
import type { SidebarProps } from '../types';

/**
 * Sidebar Widget Component
 *
 * Navigation sidebar with theme and language controls.
 * Follows FSD architecture - widgets layer for complex UI blocks.
 */
export const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  onNavigation,
  'data-testid': testId = 'sidebar'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, isTransitioning } = useTheme();
  const { language, toggleLanguage, t, isTransitioning: isLangTransitioning } = useLanguage();

  const navItems = [
    { icon: Home, href: "#home", label: t.home },
    { icon: Code, href: "#work", label: t.work },
    { icon: FileText, href: "#about", label: t.about },
    { icon: Mail, href: "#contact", label: t.contact },
    { icon: Sparkles, href: "#skills", label: t.skills },
    { icon: Monitor, href: "/uses", label: t.uses },
  ];

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleMobileNavClick = (href: string) => {
    setMobileMenuOpen(false);
    onNavigation?.(href);
  };

  const handleDesktopNavClick = (href: string) => {
    onNavigation?.(href);
  };

  const handleLanguageToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLanguage();
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <>
      {/* Mobile Burger Button */}
      <Button
        variant="primary"
        size="sm"
        onClick={() => setMobileMenuOpen(true)}
        className={styles.mobileMenuButton}
        aria-label="Open menu"
      >
        <Menu className={styles.menuIcon} />
      </Button>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.open : ''}`}>
        {/* Backdrop */}
        <div
          className={styles.backdrop}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div className={styles.mobilePanel}>
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(false)}
            className={styles.closeButton}
            aria-label="Close menu"
          >
            <X className={styles.closeIcon} />
          </Button>

          {/* Logo */}
          <div className={styles.logoSection}>
            <a
              href="#home"
              onClick={() => handleMobileNavClick("#home")}
              className={styles.logoLink}
            >
              <span className={styles.logoText}>KONSTANTIN</span>
            </a>
          </div>

          {/* Navigation */}
          <nav className={styles.mobileNav}>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={index}
                  href={item.href}
                  onClick={() => handleMobileNavClick(item.href)}
                  className={styles.mobileNavItem}
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Theme & Language Toggle */}
          <div className={styles.controlsSection}>
            {/* Language Toggle */}
            <Button
              variant="ghost"
              onClick={handleLanguageToggle as any}
              className={styles.controlButton}
            >
              <Globe className={`${styles.controlIcon} ${isLangTransitioning ? styles.spinning : ''}`} />
              <span className={styles.controlText}>
                <span className={styles.languageLabel}>{t.language}</span>
                <span className={styles.languageFull}>({t.languageFull})</span>
              </span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              onClick={handleThemeToggle}
              className={styles.controlButton}
            >
              {theme === "dark" ? (
                <Moon className={`${styles.controlIcon} ${isTransitioning ? styles.spinning : ''}`} />
              ) : (
                <Sun className={`${styles.controlIcon} ${isTransitioning ? styles.spinning : ''}`} />
              )}
              <span className={styles.controlText}>
                {theme === "dark" ? t.darkMode : t.lightMode}
              </span>
            </Button>

            <p className={styles.footerText}>
              {t.footerTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`${styles.desktopSidebar} ${isOpen ? styles.expanded : ''} ${className}`}
        data-testid={testId}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Logo */}
        <a
          href="#home"
          className={styles.desktopLogo}
          onClick={() => handleDesktopNavClick("#home")}
        >
          <span className={styles.desktopLogoText}>A</span>
          {isOpen && (
            <span className={styles.desktopLogoTextFull}>KONSTANTIN</span>
          )}
        </a>

        {/* Navigation */}
        <nav className={styles.desktopNav}>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={index}
                href={item.href}
                onClick={() => handleDesktopNavClick(item.href)}
                className={`${styles.desktopNavItem} ${isOpen ? styles.expanded : ''}`}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className={styles.desktopNavIcon} />
                {isOpen && (
                  <span className={styles.desktopNavLabel}>{item.label}</span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Controls */}
        <div className={styles.desktopControls}>
          {/* Language Toggle */}
          <Button
            variant="ghost"
            onClick={handleLanguageToggle as any}
            className={`${styles.desktopControlButton} ${isOpen ? styles.expanded : ''}`}
            title={!isOpen ? t.languageFull : undefined}
          >
            <Globe className={`${styles.desktopControlIcon} ${isLangTransitioning ? styles.spinning : ''}`} />
            {isOpen && (
              <span className={styles.desktopControlText}>
                <span className={styles.desktopLanguageLabel}>{t.language}</span>
                <span className={styles.desktopLanguageFull}>({t.languageFull})</span>
              </span>
            )}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            onClick={handleThemeToggle}
            className={`${styles.desktopControlButton} ${isOpen ? styles.expanded : ''}`}
            title={!isOpen ? (theme === "dark" ? t.darkMode : t.lightMode) : undefined}
          >
            {theme === "dark" ? (
              <Moon className={`${styles.desktopControlIcon} ${isTransitioning ? styles.spinning : ''}`} />
            ) : (
              <Sun className={`${styles.desktopControlIcon} ${isTransitioning ? styles.spinning : ''}`} />
            )}
            {isOpen && (
              <span className={styles.desktopControlText}>
                {theme === "dark" ? t.darkMode : t.lightMode}
              </span>
            )}
          </Button>

          {/* Expand indicator */}
          <div className={styles.expandIndicator}>
            <ChevronRight
              className={`${styles.expandIcon} ${isOpen ? styles.rotated : ''}`}
            />
          </div>
        </div>
      </aside>

      {/* Spacer for content - only on desktop */}
      <div className={`${styles.desktopSpacer} ${isOpen ? styles.expanded : ''}`} />
    </>
  );
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;
