// ============================================
// MyWork Feature - TypeScript Types
// ============================================

import { Project } from '@/entities/Project';

export interface MyWorkProps {
  className?: string;
  /**
   * WU-3 (Design C): the vitrina never touches the store — HomePage passes
   * the featured projects from `selectFeaturedProjects`. Without the prop
   * it falls back to the entity seed, so bare renders stay store-free.
   */
  content?: Project[];
  onProjectClick?: (projectId: string) => void;
  'data-testid'?: string;
}

export interface MyWorkTranslations {
  myWork: string;
  builtUsing: string;
  link: string;
}

export interface MyWorkState {
  selectedProject: Project | null;
  filters: {
    category?: string;
    featured?: boolean;
  };
}
