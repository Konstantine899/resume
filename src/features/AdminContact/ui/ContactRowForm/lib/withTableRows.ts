// ============================================
// withTableRows — ContactContent table replacement helper
// ============================================
//
// Spread by a union key ('texts' | 'formTexts' | 'socials') is not
// type-safe: branch once so the result stays an exact ContactContent
// (no index signature). Lives in lib/ because ContactEditorForm imports
// it too — a component file may not export non-components
// (react-refresh/only-export-components).

import type { ContactContent, ContactSocialLink, LocalizedText } from '@/entities/ContactContent';
import type { ContactTableRow } from '../../../model/slices/contactContentSlice';

/** Row shape per table — the caller always passes a matching record. */
type TableRows = Record<string, LocalizedText> | Record<string, ContactSocialLink>;

/** Replace one table of the document, keeping the others intact. */
export const withTableRows = (
  doc: ContactContent,
  table: ContactTableRow,
  rows: TableRows
): ContactContent =>
  table === 'texts'
    ? { ...doc, texts: rows as Record<string, LocalizedText> }
    : table === 'formTexts'
      ? { ...doc, formTexts: rows as Record<string, LocalizedText> }
      : { ...doc, socialLinks: rows as Record<string, ContactSocialLink> };
