import type { TFunction } from 'i18next';
import { Code, FileText, Home, Mail, Monitor, Sparkles } from 'lucide-react';

export const getNavItems = (t: TFunction) => [
  { icon: Home, href: '#home', label: t('nav.home') },
  { icon: Code, href: '#work', label: t('nav.work') },
  { icon: FileText, href: '#about', label: t('nav.about') },
  { icon: Mail, href: '#contact', label: t('nav.contact') },
  { icon: Sparkles, href: '#skills', label: t('nav.skills') },
  { icon: Monitor, href: '/uses', label: t('nav.uses') },
];
