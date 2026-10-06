// ============================================
// ContactContent Entity — Public API
// ============================================

export type { ContactContent, FormTextKey, TextKey } from './model/types';
export { CONTACT_EMAIL } from './model/constants';
export {
  ContactContentEnvelopeSchema,
  ContactContentSchema,
  ContactFormDataSchema,
  type ContactContentEnvelope,
  type ContactFormDataInput,
} from './model/services/schema';
// Re-exported for importer convenience: contracts across CRUD plans
// (About + Contact) share this type from one place (§5).
export type { LocalizedText } from '@/shared/lib/i18n/types';
