// ============================================
// Contact Feature - TypeScript Types
// ============================================

/**
 * Contact component props
 */
export interface ContactProps {
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
 * Contact translations
 */
export interface ContactTranslations {
  contact: string;
  getInTouch: string;
  email: string;
  sendMessage: string;
  name: string;
  message: string;
  sending: string;
  sent: string;
}
