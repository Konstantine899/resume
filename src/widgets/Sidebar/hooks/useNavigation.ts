import { useCallback, useEffect, useRef, useState } from 'react';

interface UseNavigationProps {
  onNavigation?: (href: string) => void;
}

export const useNavigation = ({ onNavigation }: UseNavigationProps = {}) => {
  const [activeSection, setActiveSection] = useState<string>('#home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Scroll detection для активной секции
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
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Focus trap для мобильного меню
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

  // Escape key для закрытия мобильного меню
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

  // Закрытие мобильного меню при resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Блокировка скролла body при открытом мобильном меню
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Keyboard navigation для десктопа
  const handleDesktopKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number, totalItems: number) => {
      const navElements = document.querySelectorAll('[data-desktop-nav-item]');

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

  const handleNavClick = useCallback(
    (href: string) => {
      setMobileMenuOpen(false);
      onNavigation?.(href);
    },
    [onNavigation]
  );

  return {
    activeSection,
    mobileMenuOpen,
    setMobileMenuOpen,
    handleNavClick,
    handleDesktopKeyDown,
    mobileMenuRef,
  };
};
