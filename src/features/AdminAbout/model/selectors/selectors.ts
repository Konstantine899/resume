// AboutContent selectors (plan About CRUD §4).

import type { AboutContent } from '@/entities/AboutContent';
import type { AboutContentRootState } from '../types/types';

export const selectAboutContent = (state: AboutContentRootState): AboutContent =>
  state.aboutContent;
