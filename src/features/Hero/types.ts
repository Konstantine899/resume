// ============================================
// Hero Feature - TypeScript Types
// ============================================

/**
 * Hero component props
 */
export interface HeroProps {
  /**
   * Additional CSS class
   */
  className?: string;
  
  /**
   * Callback when resume button is clicked
   */
  onGetResume?: () => void;
  
  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

/**
 * Hero translations
 */
export interface HeroTranslations {
  greeting: string;
  name: string;
  fullName: string;
  profession: string;
  specialties: string;
  skillsLabel: string;
  yearsOfExperience: string;
  age: string;
  getResume: string;
}

/**
 * Hero state
 */
export interface HeroState {
  isCodeVisible: boolean;
  isPhotoLoaded: boolean;
  scrollProgress: number;
}