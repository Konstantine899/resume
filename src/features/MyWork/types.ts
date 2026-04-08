// ============================================
// MyWork Feature - TypeScript Types
// ============================================

import { Project } from "@/entities/Project";


export interface MyWorkProps {

  className?: string;
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
