// ============================================
// About Feature - TypeScript Types
// ============================================

/**
 * About component props
 */
export interface AboutProps {
  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

/**
 * About translations
 */
export interface AboutTranslations {
  about: string;
  aboutDescription: string;
}
