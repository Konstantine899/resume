// ============================================
// saveAboutDocument — typed mutation seam
// ============================================
//
// Wraps `updateAboutContent` and turns its rejection into a discriminated
// result so callers can tell a true conflict (409) apart from network,
// validation and server failures. Only the success path dispatches; on a
// conflict only the revision advances (content stays pending).

import { apiSlice } from '@/shared/api';
import { updateAboutContent } from '../../../model/slices/aboutContentSlice';
import type { AboutContent } from '@/entities/AboutContent';
import type { AboutContentDto } from '@/shared/api/types';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

export type SaveAboutDocumentResult =
  | { ok: true; document: AboutContent }
  | { ok: false; reason: 'conflict'; serverUpdatedAt: string }
  | { ok: false; reason: 'network' | 'validation' | 'server'; error: unknown };

export const readConflictUpdatedAt = (error: unknown): string | null => {
  if (typeof error !== 'object' || error === null) return null;

  const envelope = error as {
    data?: {
      conflicts?: { currentUpdatedAt?: unknown };
      updatedAt?: unknown;
    };
  };

  const fromConflict = envelope.data?.conflicts?.currentUpdatedAt;
  if (typeof fromConflict === 'string' && fromConflict.trim().length > 0) {
    return fromConflict.trim();
  }

  const fromUpdatedAt = envelope.data?.updatedAt;
  if (typeof fromUpdatedAt === 'string' && fromUpdatedAt.trim().length > 0) {
    return fromUpdatedAt.trim();
  }

  return null;
};

export const readHttpStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;

  const envelope = error as { status?: unknown; originalStatus?: unknown };
  if (typeof envelope.status === 'number') return envelope.status;
  if (typeof envelope.originalStatus === 'number') return envelope.originalStatus;

  return undefined;
};

export const saveAboutDocument = async (
  doc: AboutContent,
  dispatch: ThunkDispatch<unknown, unknown, UnknownAction>
): Promise<SaveAboutDocumentResult> => {
  try {
    const initiated = dispatch(
      apiSlice.endpoints.updateAboutContent.initiate({
        fullName: doc.fullName,
        descriptions: doc.descriptions,
        stats: doc.stats,
        statLabels: doc.statLabels,
        ctaLabel: doc.ctaLabel,
        portrait: doc.portrait,
        expectedUpdatedAt: doc.updatedAt,
      })
    ) as unknown as { unwrap: () => Promise<AboutContentDto | undefined> };
    const data = await initiated.unwrap();

    const rawUpdatedAt = data?.updatedAt;
    const serverUpdatedAt = typeof rawUpdatedAt === 'string' ? rawUpdatedAt : null;
    const committed = serverUpdatedAt ? { ...doc, updatedAt: serverUpdatedAt } : { ...doc };

    dispatch(updateAboutContent(committed));

    return { ok: true, document: committed };
  } catch (error) {
    const conflictUpdatedAt = readConflictUpdatedAt(error);
    if (conflictUpdatedAt !== null) {
      return { ok: false, reason: 'conflict', serverUpdatedAt: conflictUpdatedAt };
    }

    const status = readHttpStatus(error);
    if (status === 400) {
      return { ok: false, reason: 'validation', error };
    }
    if (typeof status === 'number' && status >= 500) {
      return { ok: false, reason: 'server', error };
    }

    return { ok: false, reason: 'network', error };
  }
};
