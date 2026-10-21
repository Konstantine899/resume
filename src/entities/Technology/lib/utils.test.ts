// resolveTechIcons tests (technologies-crud SPEC D3: same signature as the
// old entities/Project util — keys in, TechIcon[] out; the catalog is read
// from localStorage with a seed fallback, unknown keys are skipped + warned).
//
// NOTE: this file deliberately does NOT import entities/Project — the
// "every seed PROJECTS techIcons key resolves" guard cannot live inside this
// entity (entities→entities is banned) and moves to features/MyWork (WU-2).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { seedTechnologies } from '../model/constants/constants';
import { persistTechnologies } from '../model/services/storage';
import { resolveTechIcons } from './utils';

// Independent literals — byte-parity with the old TECH_ICONS entries.
const REACT_ICON = {
  url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  invertInDark: true,
};
const NEXTJS_ICON = {
  url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
  invertInDark: true,
};
const CSS_ICON = {
  url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('resolveTechIcons', () => {
  it('resolves known keys to TechIcon objects in the given order', () => {
    expect(resolveTechIcons(['react', 'nextjs'])).toEqual([REACT_ICON, NEXTJS_ICON]);
  });

  it('does not leak the storage key field into TechIcon output', () => {
    for (const icon of resolveTechIcons(['react'])) {
      expect(icon).not.toHaveProperty('key');
    }
  });

  it('skips unknown keys with a console.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(resolveTechIcons(['react', 'definitely-not-a-key', 'css'])).toEqual([
      REACT_ICON,
      CSS_ICON,
    ]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('definitely-not-a-key'));
  });

  it('returns an empty array for empty input without warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(resolveTechIcons([])).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
  });

  it('reads the catalog from localStorage (admin edits surface without a rebuild)', () => {
    const withoutReact = seedTechnologies().filter((tech) => tech.key !== 'react');
    expect(persistTechnologies(withoutReact)).toBe(true);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(resolveTechIcons(['react', 'css'])).toEqual([CSS_ICON]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('react'));
  });

  it('falls back to the seed when storage is missing or corrupt', () => {
    expect(resolveTechIcons(['react'])).toEqual([REACT_ICON]);

    localStorage.setItem('technologies', '{broken');
    expect(resolveTechIcons(['react'])).toEqual([REACT_ICON]);
  });
});
