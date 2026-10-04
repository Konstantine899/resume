// AdminAbout feature-local types (plan About CRUD §4, §5).

import type { AboutContent } from '@/entities/AboutContent';

/** Root-state shape for this slice — selectors are typed against it. */
export interface AboutContentRootState {
  aboutContent: AboutContent;
}
