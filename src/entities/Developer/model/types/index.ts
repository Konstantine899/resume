import type { LucideIcon } from 'lucide-react';

export interface DeveloperSkills {
  frontend: string[];
  backend: string[];
  testing: string[];
  devops: string[];
  methodologies: string[];
  architecture: string[];
}

export interface DeveloperProfile {
  fullName: string;
  profession: string;
  specialties: string[];
  skillsLabel: string;
  skills?: DeveloperSkills;
}

/**
 * A public social profile link (GitHub / LinkedIn / Telegram).
 */
export interface SocialLink {
  name: string;
  href: string;
  /**
   * Lucide-compatible icon (brand icons from `shared/ui/Icon` are cast to
   * `LucideIcon`) — matches `Icon`'s `name` prop type.
   */
  icon: LucideIcon;
  /** i18n key for the accessible name — never a literal aria-label. */
  labelKey: string;
}
