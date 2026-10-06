// ContactContent selectors (plan Contact CRUD §4).

import type { ContactContent } from '@/entities/ContactContent';
import type { ContactContentRootState } from '../types/types';

export const selectContactContent = (state: ContactContentRootState): ContactContent =>
  state.contactContent;
