// ============================================
// Hero Feature - TypeScript Types
// ============================================

/**
 * Hero component props
 */
export interface HeroProps {
  className?: string;
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
}

/**
 * Hero state
 */
export interface HeroState {
  isCodeVisible: boolean;
  isPhotoLoaded: boolean;
  scrollProgress: number;
}
