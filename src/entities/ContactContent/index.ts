// ============================================
// ContactContent Entity — Public API
// ============================================

export type { ContactContent, ContactSocialLink, FormTextKey, TextKey } from './model/types/types';
export { CONTACT_EMAIL } from './model/constants';
export {
  ContactContentEnvelopeSchema,
  ContactContentSchema,
  ContactFormDataSchema,
  SOCIAL_HREF_MAX,
  SOCIAL_NAME_MAX,
  isHttpsUrl,
  type ContactContentEnvelope,
  type ContactFormDataInput,
} from './model/services/schema';
// Re-exported for importer convenience: contracts across CRUD plans
// (About + Contact) share this type from one place (§5).
export type { LocalizedText } from '@/shared/lib/i18n/types';
