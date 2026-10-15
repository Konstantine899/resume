// ============================================
// Contact Feature Types
// ============================================

import type { ContactContent } from '@/entities/ContactContent';

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactProps {
  /**
   * Store-fed document (WU-2 read-path, Design C): pages is the ONLY
   * layer reading the slice — this feature stays store-free, so the bare
   * tests render without a Provider and hit the fallback branch (§11).
   */
  content?: ContactContent;
}
