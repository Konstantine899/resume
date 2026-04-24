// ============================================
// Sidebar Widget
// ============================================
import { useLanguage } from '@/features/LanguageSwitch';
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

const SIDEBAR_STORAGE_KEY = 'sidebar-expanded';

export const Sidebar: React.FC<SidebarProps> = ({
  className = '',
  onNavigation,
  'data-testid': testId = 'sidebar',
}) => {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch (error) {
      console.warn('Failed to read sidebar state from localStorage:', error);
      return true;
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);

  const { theme, toggleTheme, isTransitioning } = useTheme();
  const { toggleLanguage, t, isTransitioning: isLangTransitioning = false } = useLanguage();

  const [activeSection, setActiveSection] = useState<string>('#home');

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { icon: Home, href: '#home', label: t('home') },
    { icon: Code, href: '#work', label: t('work') },
    { icon: FileText, href: '#about', label: t('about') },
    { icon: Mail, href: '#contact', label: t('contact') },
    { icon: Sparkles, href: '#skills', label: t('skills') },
    { icon: Monitor, href: '/uses', label: t('uses') },
  ];

  const handleMouseEnter = useCallback(() => {
    if (isOpen || isHoverExpanded) return;
    hoverTimerRef.current = setTimeout(() => {
      setIsHoverExpanded(true);
    }, 300);
  }, [isOpen, isHoverExpanded]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setIsHoverExpanded(false);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(isOpen));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

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
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const focusableElements = mobileMenuRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleDesktopKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number, totalItems: number) => {
      const navElements = document.querySelectorAll(`.${styles.desktopNavItem}`);

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          (navElements[(index + 1) % totalItems] as HTMLElement)?.focus();
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          (navElements[(index - 1 + totalItems) % totalItems] as HTMLElement)?.focus();
          break;
        case 'Home':
          e.preventDefault();
          (navElements[0] as HTMLElement)?.focus();
          break;
        case 'End':
          e.preventDefault();
          (navElements[totalItems - 1] as HTMLElement)?.focus();
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

  const handleLanguageToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    toggleLanguage();
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleToggleSidebar = () => {
    setIsOpen((prev: boolean) => !prev);
    setIsHoverExpanded(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  };

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      <div role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {mobileMenuOpen ? t('accessibility.menuOpen') : t('accessibility.menuClose')}
        {!mobileMenuOpen &&
          (isOpen || isHoverExpanded
            ? t('accessibility.sidebarExpand')
            : t('accessibility.sidebarCollapse'))}
      </div>

      <button
        onClick={() => setMobileMenuOpen(true)}
        className={styles.mobileMenuButton}
        aria-label="Open menu"
        type="button"
        aria-expanded={mobileMenuOpen}
      >
        <Menu className={styles.menuIcon} aria-hidden="true" />
      </button>

      <div
        className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        aria-hidden={!mobileMenuOpen}
      >
        <div
          className={styles.backdrop}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        <div className={styles.mobilePanel} ref={mobileMenuRef}>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className={styles.closeButton}
            aria-label="Close menu"
            type="button"
            tabIndex={mobileMenuOpen ? 0 : -1}
          >
            <X className={styles.closeIcon} />
          </button>

          <div className={styles.logoSection}>
            <a
              href="#home"
              onClick={() => handleMobileNavClick('#home')}
              className={styles.logoLink}
            >
              <span className={styles.logoText}>{t('sidebar.logo')}</span>
            </a>
          </div>

          <nav className={styles.mobileNav} role="navigation" aria-label="Main navigation">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={`${item.href}-${index}`}
                  href={item.href}
                  onClick={() => handleMobileNavClick(item.href)}
                  className={styles.mobileNavItem}
                  role="menuitem"
                  aria-current={activeSection === item.href ? 'page' : undefined}
                  tabIndex={mobileMenuOpen ? 0 : -1}
                >
                  <Icon className={styles.navIcon} aria-hidden="true" />
                  <span className={styles.navLabel}>{item.label}</span>
                </a>
              );
            })}
          </nav>

          <div className={styles.controlsSection}>
            <button
              onClick={handleLanguageToggle}
              className={styles.controlButton}
              type="button"
              aria-label={t('language')}
            >
              <Globe
                className={`${styles.controlIcon} ${isLangTransitioning ? styles.spinning : ''}`}
                aria-hidden="true"
              />
              <span className={styles.controlText}>
                <span className={styles.languageLabel}>{t('language.label')}</span>
                <span className={styles.languageFull}></span>
              </span>
            </button>

            <button
              onClick={handleThemeToggle}
              className={styles.controlButton}
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? t('lightMode') : t('darkMode')}`}
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
                {theme === 'dark' ? t('darkMode') : t('lightMode')}
              </span>
            </button>
            <p className={styles.footerText}>{t('footerTitle')}</p>
          </div>
        </div>
      </div>

      <aside
        className={`${styles.desktopSidebar} ${isOpen ? styles.expanded : styles.collapsed} ${isHoverExpanded ? styles.hoverExpanded : ''} ${className}`}
        data-testid={testId}
        aria-expanded={isOpen || isHoverExpanded}
        role="navigation"
        aria-label="Main navigation"
        onClick={handleToggleSidebar}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleSidebar();
          }
        }}
        tabIndex={0}
      >
        <a
          href="#home"
          className={styles.desktopLogo}
          onClick={(e) => {
            e.stopPropagation();
            handleDesktopNavClick('#home');
          }}
          aria-label="Go to homepage"
        >
          {isOpen || isHoverExpanded ? (
            <span className={styles.desktopLogoTextFull}>{t('name')}</span>
          ) : (
            <span className={styles.desktopLogoText}>K</span>
          )}
        </a>

        <nav className={styles.desktopNav} role="menubar" aria-label="Main navigation">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={`${item.href}-${index}`}
                href={item.href}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.stopPropagation();
                  handleDesktopNavClick(item.href);
                }}
                className={`${styles.desktopNavItem} ${isOpen || isHoverExpanded ? styles.expanded : ''}`}
                aria-label={item.label}
                title={!isOpen ? item.label : undefined}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e) => handleDesktopKeyDown(e, index, navItems.length)}
              >
                <Icon className={styles.desktopNavIcon} />
                {(isOpen || isHoverExpanded) && (
                  <span className={styles.desktopNavLabel}>{item.label}</span>
                )}
              </a>
            );
          })}
        </nav>

        <div className={styles.desktopControls}>
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              handleLanguageToggle(e);
            }}
            className={`${styles.sidebarControlButton} ${isOpen ? styles.expanded : ''}`}
            type="button"
            aria-label={t('language')}
            title={!isOpen ? t('language') : undefined}
          >
            <Globe
              className={`${styles.desktopControlIcon} ${isLangTransitioning ? styles.spinning : ''}`}
              aria-hidden="true"
            />
            {(isOpen || isHoverExpanded) && (
              <span className={styles.sidebarControlText}>
                <span className={styles.languageLabel}>
                  {t(`language`)} ({t(`languageFull`)})
                </span>
              </span>
            )}
          </button>

          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              handleThemeToggle();
            }}
            className={`${styles.sidebarControlButton} ${isOpen ? styles.expanded : ''}`}
            type="button"
            aria-label={`Switch to ${theme === 'dark' ? t('lightMode') : t('darkMode')}`}
            title={!isOpen ? (theme === 'dark' ? t('lightMode') : t('darkMode')) : undefined}
          >
            {theme === 'dark' ? (
              <>
                <Moon
                  className={`${styles.desktopControlIcon} ${isTransitioning ? styles.spinning : ''}`}
                  aria-hidden="true"
                />
                <span>{t(`darkMode`)}</span>
              </>
            ) : (
              <>
                <Sun
                  className={`${styles.desktopControlIcon} ${isTransitioning ? styles.spinning : ''}`}
                  aria-hidden="true"
                />
                <span>{t(`lightMode`)}</span>
              </>
            )}
          </button>

          <button
            className={styles.expandIndicator}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleSidebar();
            }}
            aria-expanded={isOpen || isHoverExpanded}
            aria-label={isOpen || isHoverExpanded ? t('sidebar.collapse') : t('sidebar.expand')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggleSidebar();
              }
              if (e.key === 'Escape' && (isOpen || isHoverExpanded)) {
                e.preventDefault();
                setIsOpen(false);
                setIsHoverExpanded(false);
              }
            }}
            type="button"
          >
            <ChevronRight
              className={`${styles.expandIcon} ${isOpen || isHoverExpanded ? styles.rotated : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </aside>

      <div
        className={`${styles.desktopSpacer} ${isOpen || isHoverExpanded ? styles.expanded : ''}`}
      />
    </>
  );
};

Sidebar.displayName = 'Sidebar';
export default Sidebar;
