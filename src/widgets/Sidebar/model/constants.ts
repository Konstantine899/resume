import type { TFunction } from 'i18next';
import { Code, FileText, Home, Mail, Monitor, Sparkles } from 'lucide-react';
import type { NavItem } from './types';

export const SIDEBAR_STORAGE_KEY = 'sidebar-expanded';

export const getNavItems = (t: TFunction): NavItem[] => [
  { icon: Home, href: '#home', label: t('home') },
  { icon: Code, href: '#work', label: t('work') },
  { icon: FileText, href: '#about', label: t('about') },
  { icon: Mail, href: '#contact', label: t('contact') },
  { icon: Sparkles, href: '#skills', label: t('skills') },
  { icon: Monitor, href: '/uses', label: t('uses') },
];
