import type { TFunction } from 'i18next';
import { Code, FileText, Home, Mail, Sparkles, WorkflowIcon } from 'lucide-react';
import type { NavItem } from './types';

export const SIDEBAR_STORAGE_KEY = 'sidebar-expanded';

export const getNavItems = (t: TFunction): NavItem[] => [
  { icon: Home, href: '#home', label: t('home') },
  { icon: Code, href: '#work', label: t('work') },
  { icon: WorkflowIcon, href: '#experience', label: t('workHistory') },
  { icon: FileText, href: '#about', label: t('about') },
  { icon: Sparkles, href: '#skills', label: t('skills') },
  { icon: Mail, href: '#contact', label: t('contact') },
];
