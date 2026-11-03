// ============================================
// Technology Entity - Types
// ============================================

/**
 * One catalog record — TechIcon parity: `key` replaces the old dictionary
 * key of TECH_ICONS and is the identity referenced by `Project.techIcons`.
 */
export interface Technology {
  /** Slug key referenced by projects ('react' | 'nextjs' | …). */
  key: string;
  /** Optional display name; missing values render from key. */
  name?: string;
  /** Absolute https:// icon URL (devicon CDN and alike). */
  url: string;
  /** Apply the dark-theme invert filter (parity with the old TECH_ICONS flag). */
  invertInDark?: boolean;
}

/**
 * Edit patch — the record key is immutable in edit mode (SPEC D7):
 * only display fields can change.
 */
export interface TechnologyUpdatePatch {
  name?: string;
  url: string;
  invertInDark?: boolean;
}

/**
 * The slice key may be ABSENT from state (SPEC D4): bare tests and
 * Storybook render without a StoreProvider — selectors fall back to the
 * seed instead of throwing.
 */
export interface TechnologyRootState {
  technologies?: Technology[];
}
