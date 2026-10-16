// ============================================
// resolveTechIcons — keys → TechIcon[] (moved from entities/Project, D3)
// ============================================
//
// Same signature as before the epic: the vitrina keeps rendering the same
// icons; the catalog now comes from localStorage with a seed fallback, so
// admin edits surface without a rebuild. Unknown keys are skipped with a
// defensive console.warn, exactly like the old TECH_ICONS implementation.

import type { TechIcon } from '@/shared/ui/Card/model/types';

import { seedTechnologies } from '../model/constants/constants';
import { readTechnologies } from '../model/services/storage';

export const resolveTechIcons = (keys: string[]): TechIcon[] => {
  const catalog = readTechnologies() ?? seedTechnologies();
  const table = new Map(catalog.map((tech) => [tech.key, tech]));
  const icons: TechIcon[] = [];
  for (const key of keys) {
    const tech = table.get(key);
    if (!tech) {
      // eslint-disable-next-line no-console
      console.warn(`[Technology] Unknown techIcons key "${key}" skipped`);
      continue;
    }
    // Strip the storage `key` — TechIcon output stays byte-identical to the
    // old TECH_ICONS entries ({ url, invertInDark? }).
    const { key: _key, ...icon } = tech;
    void _key;
    icons.push(icon);
  }
  return icons;
};
