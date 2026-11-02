import { describe, expect, it } from 'vitest';

import { resolveSkillTechnology, type ResolvedSkillTechnology } from './resolveSkillTechnology';
import type { SkillTechnology } from '../model/types/types';
import type { Technology } from '../../Technology/model/types/types';

const catalog: Technology[] = [
  { key: 'react', url: 'https://cdn/react.svg', invertInDark: false },
  { key: 'nodejs', url: 'https://cdn/node.svg', invertInDark: true },
];

const catalogFor = (tech: TechCatalogEntry) => tech;

type TechCatalogEntry = { key: string; url: string; invertInDark?: boolean };

describe('resolveSkillTechnology', () => {
  it('returns the catalog url and slug as name (AD-6)', () => {
    const record: SkillTechnology = { techKey: 'react', invertInDarkOverride: undefined };
    const resolved = resolveSkillTechnology(
      record,
      catalog as unknown as readonly TechCatalogEntry[]
    );
    expect(resolved.iconSvg).toBe('https://cdn/react.svg');
    expect(resolved.name).toBe('react');
    expect(resolved.invertInDark).toBe(false);
  });

  // D5: catalog default beats a stale snapshot
  it('catalog default beats the stale snapshot (D5)', () => {
    const record: SkillTechnology = {
      techKey: 'nodejs',
      iconSvg: 'legacy-node',
      invertInDark: false,
    };
    const resolved = resolveSkillTechnology(
      record,
      catalog as unknown as readonly TechCatalogEntry[]
    );
    expect(resolved.invertInDark).toBe(true);
  });

  // override beats the catalog
  it('explicit override beats both catalog and snapshot', () => {
    const record: SkillTechnology = {
      techKey: 'nodejs',
      invertInDark: false,
      invertInDarkOverride: false,
    };
    const resolved = resolveSkillTechnology(
      record,
      catalog as unknown as readonly TechCatalogEntry[]
    );
    expect(resolved.invertInDark).toBe(false);
  });

  // catalog miss keeps the snapshot
  it('keeps the snapshot when the key is absent from the catalog', () => {
    const record: SkillTechnology = { techKey: 'gone', iconSvg: 'legacy.svg', name: 'Gone' };
    const resolved = resolveSkillTechnology(
      record,
      catalog as unknown as readonly TechCatalogEntry[]
    );
    expect(resolved.iconSvg).toBe('legacy.svg');
    expect(resolved.name).toBe('Gone');
  });

  // no catalog → identity fallback
  it('returns a label for a record without a catalog', () => {
    const record: SkillTechnology = { techKey: 'react', iconSvg: 'x' };
    const resolved = resolveSkillTechnology(record);
    expect(resolved.name).toBe('react');
    // fallback keeps the snapshot
    expect(resolved.iconSvg).toBe('x');
  });

  // no techKey: legacy record → survives
  it('survives a legacy record with only a name', () => {
    const record: SkillTechnology = { name: 'Preact', iconSvg: 'preact' };
    const resolved = resolveSkillTechnology(
      record,
      catalog as unknown as readonly TechCatalogEntry[]
    );
    expect(resolved.name).toBe('Preact');
    expect(resolved.iconSvg).toBe('preact');
  });

  // degenerate branch keeps the optional string contract total
  it('makes `name` a string even in the degenerate branch (D6)', () => {
    const record: SkillTechnology = {};
    const resolved: ResolvedSkillTechnology = resolveSkillTechnology(
      record,
      catalog as unknown as readonly TechCatalogEntry[]
    );
    expect(typeof resolved.name).toBe('string');
  });
});

void catalogFor;
