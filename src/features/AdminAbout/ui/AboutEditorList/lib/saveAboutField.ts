// ============================================
// saveAboutField — the merged-save seams (admin-about-table WU-2 + WU-12)
// ============================================
//
// Snapshot → merge → persistAboutContent. Every caller (the vitrina's
// Pencil today via persistMergedAboutField, the add/delete handlers via
// persistAdded/persistRemovedAboutRow) dispatches `updateAboutContent(merged)`
// only when this returns a document; `null` means the storage write failed —
// the store must NOT move (SPEC R-2/R-3/R-4 persist-THEN-dispatch,
// resume-*). Same shape as AdminMyWork's `toUpdateDto` + persist pair, but
// About's slice is FULL REPLACE, so the merge produces a whole document
// instead of a partial patch.

import type { AboutContent } from '@/entities/AboutContent';

import { persistAboutContent } from '../../../model/services/storage';
import {
  toMergedDocument,
  withAddedRow,
  withRemovedRow,
  type AboutFieldValueOf,
  type AboutRowField,
  type AboutRowPayload,
  type EditAboutField,
} from './fieldSchemas';

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

/** Persist `base` with the added row appended (SPEC R-2). */
export const persistAddedAboutRow = (
  base: AboutContent,
  payload: AboutRowPayload
): AboutContent | null => {
  const merged = withAddedRow(base, payload);
  return persistAboutContent(merged) ? merged : null;
};

/** Persist `base` with the row removed (SPEC R-3). */
export const persistRemovedAboutRow = (
  base: AboutContent,
  field: AboutRowField
): AboutContent | null => {
  const merged = withRemovedRow(base, field);
  return persistAboutContent(merged) ? merged : null;
};
