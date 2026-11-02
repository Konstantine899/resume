interface TechCatalogEntry {
  key: string;
  url: string;
  invertInDark?: boolean;
}
import type { SkillTechnology } from '../model/types/types';

/**
 * Runtime canonical resolve for a skill technology using the technology
 * catalog. Snapshot fields remain the fallback for legacy records or when
 * the catalog does not contain the referenced key.
 */
export const resolveSkillTechnology = (
  technology: SkillTechnology,
  technologies?: readonly TechCatalogEntry[]
): SkillTechnology => {
  if (!technology.techKey || !technologies || technologies.length === 0) {
    return technology;
  }

  const source = technologies.find((tech) => tech.key === technology.techKey);
  if (!source) {
    return technology;
  }

  return {
    ...technology,
    name: technology.techKey,
    iconSvg: source.url,
    invertInDark: technology.invertInDarkOverride ?? technology.invertInDark ?? source.invertInDark,
    techKey: technology.techKey,
  };
};
