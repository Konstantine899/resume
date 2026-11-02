interface TechCatalogEntry {
  key: string;
  url: string;
  invertInDark?: boolean;
}
import type { SkillTechnology } from '../model/types/types';

/**
 * A record that went through the resolver — `name` is ALWAYS a string.
 *
 * The vitrina renders `alt={tech.name}` and `<span>{tech.name}</span>`;
 * with an optional name a catalog-less sparse record produced `<img>`
 * WITHOUT an alt attribute and an empty label (D6, axe `image-alt` on /).
 * Callers must not need a `?? ''` of their own.
 */
export type ResolvedSkillTechnology = SkillTechnology & { name: string };

/**
 * Runtime canonical resolve for a skill technology using the technology
 * catalog. Snapshot fields remain the fallback for legacy records or when
 * the catalog does not contain the referenced key.
 *
 * Precedence (D5): an explicit per-record override wins, then the catalog
 * default, and only then the stale snapshot. A catalog default that
 * changes after the skill was saved must reach the vitrina — the snapshot
 * used to beat it and pinned the old value forever.
 *
 * Display name (AD-6): while the catalog has no display-name field, the
 * key IS the label. A proper `name` on `Technology` is separate work.
 */
export const resolveSkillTechnology = (
  technology: SkillTechnology,
  technologies?: readonly TechCatalogEntry[]
): ResolvedSkillTechnology => {
  // AD-7 guarantees at least one identifier for stored data; the `?? ''`
  // keeps the contract total for hand-built fixtures.
  const label = technology.name ?? technology.techKey ?? '';
  const techKey = technology.techKey;

  if (!techKey || !technologies || technologies.length === 0) {
    return { ...technology, name: label };
  }

  const source = technologies.find((tech) => tech.key === techKey);
  if (!source) {
    // Catalog miss (deleted record / legacy link): keep the snapshot.
    return { ...technology, name: label };
  }

  return {
    ...technology,
    name: techKey,
    iconSvg: source.url,
    invertInDark: technology.invertInDarkOverride ?? source.invertInDark ?? technology.invertInDark,
    techKey,
  };
};
