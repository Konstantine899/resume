// ============================================
// Sidebar Widget
// ============================================

import { useLanguage } from '@/shared/lib/contexts/LanguageContext';
import { useTheme } from '@/shared/lib/contexts/ThemeContext';
import {
  ChevronRight,
  Code,
  FileText,
  Globe,
  Home,
  Mail,
  Menu,
  Monitor,
  Moon,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Sidebar.module.scss';
import type { SidebarProps } from './types';

/**
 * Sidebar Widget Component
 *
 * Navigation sidebar with theme and language controls.
 * Follows FSD architecture - widgets layer for complex UI blocks.
 */
export const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  onNavigation,
  'data-testid': testId = 'sidebar',
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, isTransitioning } = useTheme();
  const { toggleLanguage, t, isTransitioning: isLangTransitioning, language } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>('#home');

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { icon: Home, href: '#home', label: t.home },
    { icon: Code, href: '#work', label: t.work },
    { icon: FileText, href: '#about', label: t.about },
    { icon: Mail, href: '#contact', label: t.contact },
    { icon: Sparkles, href: '#skills', label: t.skills },
    { icon: Monitor, href: '/uses', label: t.uses },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['#home', '#work', '#about', '#contact', '#skills'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.querySelector(section) as HTMLElement | null;
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Проверить при монтировании

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus trap useEffect
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const focusableElements = mobileMenuRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    // Фокус на первый элемент при открытии
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Для десктопной навигации
  const handleDesktopKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number, totalItems: number) => {
      const navItems = document.querySelectorAll(`.${styles.desktopNavItem}`);

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          {
            const nextIndex = (index + 1) % totalItems;
            (navItems[nextIndex] as HTMLElement)?.focus();
          }
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          {
            const prevIndex = (index - 1 + totalItems) % totalItems;
            (navItems[prevIndex] as HTMLElement)?.focus();
          }
          break;

        case 'Home':
          e.preventDefault();
          (navItems[0] as HTMLElement)?.focus();
          break;

        case 'End':
          e.preventDefault();
          (navItems[totalItems - 1] as HTMLElement)?.focus();
          break;
      }
    },
    []
  );

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

  const handleToggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* ✅ Skip Link */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      {/* ✅ Live region для announce */}
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {mobileMenuOpen ? 'Navigation menu opened' : 'Navigation menu closed'}
        {!mobileMenuOpen && (isOpen ? 'Sidebar expanded' : 'Sidebar collapsed')}
      </div>

      {/* Mobile Burger Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className={styles.mobileMenuButton}
        aria-label="Open menu"
        type="button"
        aria-expanded={mobileMenuOpen}
      >
        <Menu className={styles.menuIcon} aria-hidden="true" />
      </button>

      {/* Mobile Menu Overlay */}
      <div
        className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          className={styles.backdrop}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
        {/* ref на панель */}
        <div className={styles.mobilePanel} ref={mobileMenuRef}></div>

        {/* Menu Panel */}
        <div className={styles.mobilePanel}>
          {/* Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className={styles.closeButton}
            aria-label="Close menu"
            type="button"
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <X className={styles.closeIcon} />
          </button>

          {/* Logo */}
          <div className={styles.logoSection}>
            <a
              href="#home"
              onClick={() => handleMobileNavClick('#home')}
              className={styles.logoLink}
            >
              <span className={styles.logoText}>KONSTANTIN</span>
            </a>
          </div>

          {/* Navigation */}
          <nav className={styles.mobileNav} role="navigation" aria-label="Main navigation">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={index}
                  href={item.href}
                  onClick={() => handleMobileNavClick(item.href)}
                  className={styles.mobileNavItem}
                  role="menuitem"
                  aria-current={activeSection === item.href ? 'page' : undefined}
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  onKeyDown={(e) => {
                    // Arrow keys для мобильного меню
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                      e.preventDefault();
                      const nextIndex = (index + 1) % navItems.length;
                      const nextItem = document.querySelectorAll(`.${styles.mobileNavItem}`)[
                        nextIndex
                      ];
                      (nextItem as HTMLElement)?.focus();
                    }
                    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                      e.preventDefault();
                      const prevIndex = (index - 1 + navItems.length) % navItems.length;
                      const prevItem = document.querySelectorAll(`.${styles.mobileNavItem}`)[
                        prevIndex
                      ];
                      (prevItem as HTMLElement)?.focus();
                    }
                    if (e.key === 'Home') {
                      e.preventDefault();
                      const firstItem = document.querySelectorAll(`.${styles.mobileNavItem}`)[0];
                      (firstItem as HTMLElement)?.focus();
                    }
                    if (e.key === 'End') {
                      e.preventDefault();
                      const lastItem = document.querySelectorAll(`.${styles.mobileNavItem}`)[
                        navItems.length - 1
                      ];
                      (lastItem as HTMLElement)?.focus();
                    }
                  }}
                >
                  <Icon className={styles.navIcon} aria-hidden="true" />
                  <span className={styles.navLabel}>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Theme & Language Toggle */}
          <div className={styles.controlsSection}>
            {/* Language Toggle */}
            <button
              onClick={handleLanguageToggle}
              className={styles.controlButton}
              type="button"
              aria-label={`Switch language to ${language === 'en' ? 'Russian' : 'English'}`}
            >
              <Globe
                className={`${styles.controlIcon} ${isLangTransitioning ? styles.spinning : ''}`}
                aria-hidden="true"
              />
              <span className={styles.controlText}>
                <span className={styles.languageLabel}>{t.language}</span>
                <span className={styles.languageFull}>({t.languageFull})</span>
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className={styles.controlButton}
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Moon
                  className={`${styles.controlIcon} ${isTransitioning ? styles.spinning : ''}`}
                  aria-hidden="true"
                />
              ) : (
                <Sun
                  className={`${styles.controlIcon} ${isTransitioning ? styles.spinning : ''}`}
                  aria-hidden="true"
                />
              )}
              <span className={styles.controlText}>
                {theme === 'dark' ? t.darkMode : t.lightMode}
              </span>
            </button>

            <p className={styles.footerText}>{t.footerTitle}</p>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`${styles.desktopSidebar} ${isOpen ? styles.expanded : styles.collapsed} ${className}`}
        data-testid={testId}
        aria-expanded={isOpen}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a
          href="#home"
          className={styles.desktopLogo}
          onClick={() => handleDesktopNavClick('#home')}
          aria-label="Go to homepage"
        >
          <span className={styles.desktopLogoText}>A</span>
          {isOpen && <span className={styles.desktopLogoTextFull}>KONSTANTIN</span>}
        </a>

        {/* Navigation */}
        <nav className={styles.desktopNav} role="menubar" aria-label="Main navigation">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={index}
                href={item.href}
                onClick={() => handleDesktopNavClick(item.href)}
                className={`${styles.desktopNavItem} ${isOpen ? styles.expanded : ''}`}
                aria-label={item.label}
                title={item.label}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e) => handleDesktopKeyDown(e, index, navItems.length)}
              >
                <Icon className={styles.desktopNavIcon} />
                {isOpen && <span className={styles.desktopNavLabel}>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* Controls */}
        <div className={styles.desktopControls}>
          {/* Language Toggle */}
          <button
            onClick={handleLanguageToggle}
            className={`${styles.sidebarControlButton} ${isOpen ? styles.expanded : ''}`}
            type="button"
            aria-label={`Switch language to ${language === 'en' ? 'Russian' : 'English'}`}
            title={!isOpen ? t.languageFull : undefined}
          >
            <Globe
              className={`${styles.desktopControlIcon} ${isLangTransitioning ? styles.spinning : ''}`}
              aria-hidden="true"
            />
            {isOpen && (
              <span className={styles.sidebarControlText}>
                <span className={styles.languageLabel}>{language == 'ru' ? 'RU' : 'EN'}</span>
                <span className={styles.languageFull}>
                  {language == 'ru' ? '(Русский)' : '(English)'}
                </span>
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className={`${styles.sidebarControlButton} ${isOpen ? styles.expanded : ''}`}
            type="button"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={!isOpen ? (theme === 'dark' ? t.darkMode : t.lightMode) : undefined}
          >
            {theme === 'dark' ? (
              <Moon
                className={`${styles.desktopControlIcon} ${isTransitioning ? styles.spinning : ''}`}
                aria-hidden="true"
              />
            ) : (
              <Sun
                className={`${styles.desktopControlIcon} ${isTransitioning ? styles.spinning : ''}`}
                aria-hidden="true"
              />
            )}
            {isOpen && (
              <span className={styles.sidebarControlText} aria-hidden="true">
                <span className={styles.languageLabel}>
                  {theme === 'dark' ? t.darkMode : t.lightMode}
                </span>
              </span>
            )}
          </button>

          {/* Expand indicator */}
          <div
            className={styles.expandIndicator}
            onClick={handleToggleSidebar}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            aria-label={isOpen ? t.collapseSidebar : t.expandSidebar}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggleSidebar();
              }
              if (e.key === 'Escape' && isOpen) {
                e.preventDefault();
                setIsOpen(false);
              }
            }}
          >
            <ChevronRight
              className={`${styles.expandIcon} ${isOpen ? styles.rotated : ''}`}
              aria-hidden="true"
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
