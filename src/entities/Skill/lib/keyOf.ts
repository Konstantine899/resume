// ============================================
// keyOf — the single identity of a skill technology record
// ============================================
//
// The admin catalog key wins when present: after a record is linked to
// /admin/technologies, the key — not the legacy display name — is what
// the schema dedupe, the slice actions, the list rows, the page selection
// and the edit form key on (AD-1).
//
// Total by contract (AD-7): TechnologySchema rejects a record with
// neither identifier, so the trailing `''` is unreachable for anything
// that went through storage. It exists only so callers never branch on
// `string | undefined` — the colliding `undefined` row id was defect D3
// (two sparse records produced the same key and React reused one row).

import type { SkillTechnology } from '../model/types/types';

export const keyOf = (technology: SkillTechnology): string =>
  technology.techKey ?? technology.name ?? '';
