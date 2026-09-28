import { Code, FileText, Home, Mail, Sparkles, WorkflowIcon } from 'lucide-react';
import type { NavItem } from './types';

/**
 * Placeholder section anchors for the Nav scaffold (T1).
 *
 * T2 consolidates the single source of truth here (decision R8): both the
 * rendered links and the scroll tracker must read from this array instead of
 * the currently diverged Sidebar `getNavItems` / hardcoded tracker list.
 */
export const NAV_ITEMS: NavItem[] = [
  { id: 'home', href: '#home', labelKey: 'home', icon: Home },
  { id: 'work', href: '#work', labelKey: 'work', icon: Code },
  { id: 'experience', href: '#experience', labelKey: 'workHistory', icon: WorkflowIcon },
  { id: 'about', href: '#about', labelKey: 'about', icon: FileText },
  { id: 'skills', href: '#skills', labelKey: 'skills', icon: Sparkles },
  { id: 'contact', href: '#contact', labelKey: 'contact', icon: Mail },
];

/**
 * Admin area stub (decision R3) — leads to the future `#/admin` route;
 * the full admin flow lands with the Supabase stage.
 */
export const ADMIN_HREF = '#/admin';

/**
 * CTA target (decision R7) — points at Contact until a downloadable resume
 * file exists, so the button is never a dead end.
 */
export const CTA_HREF = '#contact';

/**
 * DOM id of the mobile menu dialog (T6, decision R9) — shared between the
 * panel (`id`) and the burger (`aria-controls`) so the toggle always points
 * at the real element.
 */
export const MOBILE_MENU_ID = 'nav-mobile-menu';
