export { useContactForm } from './hooks/useContactForm';
// Re-exported from the entity (single source): features → features is
// banned, so `AdminContact`'s seed reads it from entities too (R-2).
export { CONTACT_EMAIL } from '@/entities/ContactContent';
export type { ContactFormData, FormStatus } from './model/types';
export { Contact } from './ui/Contact';
