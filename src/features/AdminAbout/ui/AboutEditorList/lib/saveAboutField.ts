// ============================================
// saveAboutField — the merged-save seam (admin-about-table WU-2)
// ============================================
//
// Snapshot → toMergedDocument → persistAboutContent. The caller (the
// vitrina's Pencil today, the field-modal Save in WU-4) dispatches
// `updateAboutContent(merged)` only when this returns a document; `null`
// means the storage write failed — the store must NOT move (SPEC R-3
// persist-THEN-dispatch, resume-*. Same shape as AdminMyWork's
// `toUpdateDto` + persist pair, but About's slice is FULL REPLACE, so the
// merge produces a whole document instead of a partial patch.

import type { AboutContent } from '@/entities/AboutContent';

import { persistAboutContent } from '../../../model/services/storage';
import { toMergedDocument, type AboutFieldValueOf, type EditAboutField } from './fieldSchemas';

/**
 * Persist `base` with ONE field replaced. Returns the merged document on
 * success (ready for the dispatch) or `null` on a failed write — the
 * caller toasts `aboutSaveError` and keeps its state open.
 */
export const persistMergedAboutField = <F extends EditAboutField>(
  base: AboutContent,
  field: F,
  value: AboutFieldValueOf<F>
): AboutContent | null => {
  const merged = toMergedDocument(base, field, value);
  return persistAboutContent(merged) ? merged : null;
};
