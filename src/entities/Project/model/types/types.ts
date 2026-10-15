// ============================================
// Project Entity - Types
// ============================================

export type ProjectCategory =
  'ecommerce' | 'portfolio' | 'saas' | 'blockchain' | 'mobile' | 'dashboard' | 'api' | 'other';

// ============================================
// Project Status Types
// ============================================
export type ProjectStatus = 'completed' | 'in-progress' | 'maintenance' | 'archived';

// ============================================
// Project Interface
// ============================================
export interface Project {
  id: string;
  title: string;
  description: {
    en: string;
    ru: string;
  };
  /**
   * A3: stored as KEYS only ('react' | 'nextjs' | …) — the TECH_ICONS
   * dictionary lives in constants.ts and is never serialized to the store.
   * Resolve to TechIcon objects at render time via `resolveTechIcons`.
   */
  techIcons: string[];
  link: string | null;
  image: string;
  category: ProjectCategory;
  status: ProjectStatus;
  featured: boolean;
  /**
   * The role actually held on the project, localized (recruiter audit P1).
   * Kept honest — grounded in the real stack/description, never inflated.
   */
  role?: {
    en: string;
    ru: string;
  };
  /**
   * Outcome metrics for the featured card (e.g. "1M+ users").
   * OPTIONAL and data-gated: only rendered when real numbers exist —
   * never invented to fill the UI.
   */
  metrics?: string[];
  /** Display year of the project (grounded in `createdAt` when known). */
  year?: number;
  /** ISO-8601 strings only — Date objects are never stored (plan §5, R-8). */
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Project Filters Interface
// ============================================
export interface ProjectFilters {
  search?: string;
  category?: ProjectCategory;
  status?: ProjectStatus;
  featured?: boolean;
}
