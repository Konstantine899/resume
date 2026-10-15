// resolveTechIcons tests (TDD red → green, plan_projects_crud §5 A3).
// Store keeps techIcon KEYS only; resolve happens at render time.

import { afterEach, describe, expect, it, vi } from 'vitest';

import { PROJECTS, TECH_ICONS } from '../model/constants/constants';
import { resolveTechIcons } from './utils';

describe('resolveTechIcons', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves known keys to TechIcon objects in the given order', () => {
    expect(resolveTechIcons(['react', 'nextjs'])).toEqual([TECH_ICONS.react, TECH_ICONS.nextjs]);
  });

  it('skips unknown keys with a console.warn', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(resolveTechIcons(['react', 'definitely-not-a-key', 'css'])).toEqual([
      TECH_ICONS.react,
      TECH_ICONS.css,
    ]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('definitely-not-a-key'));
  });

  it('returns an empty array for empty input without warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(resolveTechIcons([])).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
  });

  it('every seed project techIcons key resolves (guard against key typos)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const seedKeys = PROJECTS.flatMap((project) => project.techIcons);
    expect(seedKeys.length).toBeGreaterThan(0);

    for (const key of seedKeys) {
      expect(resolveTechIcons([key])).toEqual([
        expect.objectContaining({ url: expect.any(String) }),
      ]);
    }
    expect(warn).not.toHaveBeenCalled();
  });
});
