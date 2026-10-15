// ============================================
// About Feature Types
// ============================================

import type { AboutContent } from '@/entities/AboutContent';

export interface AboutFeatureProps {
  className?: string;
  'data-testid'?: string;
  /**
   * Store-backed content (WU-2, Design C): HomePage is the ONLY place that
   * reads the slice — the vitrina stays store-free, so its bare tests keep
   * rendering the i18n/seed fallback without a Provider.
   */
  content?: AboutContent;
}

export interface AboutTranslations {
  aboutTitle: string;
  about: string;
  aboutDescription: string;
  getInTouch: string;
}
