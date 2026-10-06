// AdminContact feature-local types (plan Contact CRUD §4, §5).

import type { ContactContent } from '@/entities/ContactContent';

/** Root-state shape for this slice — selectors are typed against it. */
export interface ContactContentRootState {
  contactContent: ContactContent;
}
