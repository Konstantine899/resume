import { focusTrap } from '@/shared/lib/utils/focusTrap';
import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { NAV_ITEMS } from '../model/constants';

export interface UseNavigationProps {
  /** Optional callback fired when a section anchor is activated. */
  onNavigation?: (href: string) => void;
}

export interface UseNavigationResult {
  /** Id of the section currently at the viewport trigger line. */
  activeSection: string;
  /** Click handler: activates the section, closes the menu, forwards `onNavigation`. */
  onNavClick: (href: string) => void;
  isMobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
}

/** Desktop breakpoint — the menu auto-closes at/above it (old Sidebar parity). */
const DESKTOP_BREAKPOINT = 768;

/**
 * Section id targeted by a nav href (`#home` → `home`).
 *
 * The ONE derivation shared by the scroll tracker, click handling and
 * active-link highlighting — decision R8 (single source of truth).
 */
export const sectionIdFromHref = (href: string): string =>
  href.startsWith('#') ? href.slice(1) : href;

/**
 * Section ids derived ONCE from `NAV_ITEMS` — never a local hardcoded array.
 * Stays in sync with the rendered links automatically (decision R8).
 */
const SECTION_IDS: string[] = NAV_ITEMS.map((item) => sectionIdFromHref(item.href));

/**
 * Navigation state owner for the Nav widget (plan §5):
 * active-section tracking, mobile-menu state and click handling.
 *
 * - Tracking uses IntersectionObserver with a trigger line at 30% of the
 *   viewport (parity with the old scroll listener's trigger point), instead
 *   of a scroll listener.
 * - Scrolling itself is left to the browser anchor + global
 *   `scroll-behavior: smooth` (old Sidebar UX parity) — no manual scrollTo.
 */
export const useNavigation = ({ onNavigation }: UseNavigationProps = {}): UseNavigationResult => {
  const [activeSection, setActiveSection] = useState<string>(SECTION_IDS[0] ?? '');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openMobileMenu = useCallback(() => setIsMobileMenuOpen(true), []);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen((open) => !open), []);

  // Active section: IntersectionObserver over NAV_ITEMS-derived ids + hashchange.
  useEffect(() => {
    // jsdom and older browsers may lack IntersectionObserver — degrade to
    // hashchange/click tracking instead of crashing.
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const visible = new Set<string>();
    const observer: IntersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Topmost visible section in document order wins (top-of-viewport rule).
        const next = SECTION_IDS.find((id) => visible.has(id));
        if (next) setActiveSection(next);
      },
      // Zero-height line at 30% of the viewport — matches the old
      // `scrollY + viewportHeight * 0.3` trigger point.
      { rootMargin: '-30% 0px -70% 0px', threshold: 0 }
    );

    for (const id of SECTION_IDS) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }

    const handleHashChange = () => {
      const id = sectionIdFromHref(window.location.hash);
      if (SECTION_IDS.includes(id)) setActiveSection(id);
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      observer.disconnect();
    };
  }, []);

  // Auto-close the mobile menu once the viewport reaches the desktop breakpoint.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) closeMobileMenu();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMobileMenu]);

  // Lock body scroll while the mobile menu is open (old Sidebar parity).
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const onNavClick = useCallback(
    (href: string) => {
      const id = sectionIdFromHref(href);
      if (SECTION_IDS.includes(id)) setActiveSection(id);
      setIsMobileMenuOpen(false);
      onNavigation?.(href);
    },
    [onNavigation]
  );

  return {
    activeSection,
    onNavClick,
    isMobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    toggleMobileMenu,
  };
};

/**
 * Binds a WORKING focus trap to a real container (fixes the dead
 * `mobileMenuRef` — decision R11).
 *
 * Tab/Shift+Tab cycling is delegated to the shared `focusTrap` engine
 * (`@/shared/lib/utils/focusTrap`); Escape is forwarded to `onEscape`.
 * Returns a cleanup function that unbinds both listeners.
 *
 * T6 wires it to the mobile panel:
 * `useEffect(() => (open ? trapFocus(panelRef, closeMobileMenu) : undefined), [open])`
 */
export const trapFocus = (
  containerRef: RefObject<HTMLElement | null>,
  onEscape?: () => void
): (() => void) => {
  // focusTrap tolerates a null container (no-op) — the ref must be bound to
  // real DOM for Tab cycling; Escape still works either way.
  const releaseTabTrap = focusTrap(containerRef.current);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') onEscape?.();
  };
  document.addEventListener('keydown', handleKeyDown);

  return () => {
    releaseTabTrap();
    document.removeEventListener('keydown', handleKeyDown);
  };
};
