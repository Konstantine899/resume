// ============================================
// MyWork Feature - TypeScript Types
// ============================================

import { Project } from "@/entities/Project";


/**
 * MyWork component props
 */
export interface MyWorkProps {
  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Callback when project is clicked
   */
  onProjectClick?: (projectId: string) => void;

  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

/**
 * MyWork translations
 */
export interface MyWorkTranslations {
  myWork: string;
  builtUsing: string;
  link: string;
}

/**
 * MyWork state
 */
export interface MyWorkState {
  selectedProject: Project | null;
  filters: {
    category?: string;
    featured?: boolean;
  };
}
