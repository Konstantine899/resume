// ============================================
// AboutContent Entity — Public API
// ============================================

export type { AboutContent, StatKey } from './model/types/types';
export {
  AboutContentEnvelopeSchema,
  AboutContentSchema,
  type AboutContentEnvelope,
} from './model/services/schema';
export {
  normalizeAboutPayload,
  extractAboutRevision,
  type AboutContentInput,
} from './model/services/normalize';
// Re-exported for importer convenience: contracts across CRUD plans
// (About + Contact) share this type from one place (§5).
export type { LocalizedText } from '@/shared/lib/i18n/types';
