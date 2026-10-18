// ============================================
// withTableRows — ContactContent table replacement helper
// ============================================
//
// Spread by a union key ('texts' | 'formTexts') is not type-safe: branch
// once so the result stays an exact ContactContent (no index signature).
// Lives in lib/ because ContactEditorForm imports it too — a component
// file may not export non-components (react-refresh/only-export-components).

import type { ContactContent, LocalizedText } from '@/entities/ContactContent';
import type { ContactTableRow } from '../../../model/slices/contactContentSlice';

/** Replace one table of the document, keeping the other one intact. */
export const withTableRows = (
  doc: ContactContent,
  table: ContactTableRow,
  rows: Record<string, LocalizedText>
): ContactContent => (table === 'texts' ? { ...doc, texts: rows } : { ...doc, formTexts: rows });
