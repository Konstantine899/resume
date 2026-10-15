// Skills storage tests (plan_skills_crud §5 + §7: envelope read/persist/
// remove, iconSvg normalization on every persist). The persist→dispatch
// ORDER is enforced at the call site (admin form, WU-5); here we pin the
// storage half: never throw, never write invalid data, never store URLs.

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SKILLS_DATA, type SkillCategoryData } from '@/entities/Skill';
import {
  SKILLS_STORAGE_KEY,
  normalizeIconSvg,
  persistSkills,
  readSkills,
  removeSkills,
} from './storage';

const VALID: SkillCategoryData[] = JSON.parse(JSON.stringify(SKILLS_DATA));

const INVALID_RECORD: SkillCategoryData = {
  category: 'frontend',
  categoryName: 'F',
  technologies: [],
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('SKILLS_STORAGE_KEY', () => {
  it('is the plan §5 key', () => {
    expect(SKILLS_STORAGE_KEY).toBe('resume.skills');
  });
});

describe('normalizeIconSvg', () => {
  it('keeps an already-normalized key name untouched', () => {
    expect(normalizeIconSvg('react')).toBe('react');
  });

  it('reduces a plain SVG path to its key name', () => {
    expect(normalizeIconSvg('/icons/react.svg')).toBe('react');
  });

  it('strips the vite content hash from a built URL', () => {
    expect(normalizeIconSvg('/assets/react-Ab12cd34.svg')).toBe('react');
  });

  it('keeps a multi-dash key name intact (no 8-char tail to strip)', () => {
    expect(normalizeIconSvg('/icons/long-polling.svg')).toBe('long-polling');
  });

  it('passes data: URLs through (not file-backed icons)', () => {
    expect(normalizeIconSvg('data:image/svg+xml;base64,AAAA')).toBe(
      'data:image/svg+xml;base64,AAAA'
    );
  });
});

describe('persistSkills', () => {
  it('round-trips a valid collection (normalized on the way in, A3)', () => {
    expect(persistSkills(VALID)).toBe(true);
    // Persist normalizes URLs to key names, so the round-trip expectation
    // applies the same normalization — writing is not a byte-for-byte echo.
    const expected = VALID.map((category) => ({
      ...category,
      technologies: category.technologies.map((technology) => ({
        ...technology,
        iconSvg: normalizeIconSvg(technology.iconSvg),
      })),
    }));
    expect(readSkills()).toEqual(expected);
  });

  it('normalizes legacy vite URLs to key names on every write (A3)', () => {
    const withUrl: SkillCategoryData[] = [
      {
        category: 'frontend',
        categoryName: 'Frontend',
        technologies: [
          { name: 'React', iconSvg: '/assets/react-Ab12cd34.svg' },
          { name: 'Vite', iconSvg: '/icons/vitejs.svg' },
          { name: 'Redux', iconSvg: 'redux' },
        ],
      },
    ];
    expect(persistSkills(withUrl)).toBe(true);

    const raw = JSON.parse(localStorage.getItem(SKILLS_STORAGE_KEY) ?? '{}');
    expect(raw.data[0].technologies.map((tech: { iconSvg: string }) => tech.iconSvg)).toEqual([
      'react',
      'vitejs',
      'redux',
    ]);
  });

  it('writes nothing for a schema-invalid payload (caller must not dispatch)', () => {
    expect(persistSkills([INVALID_RECORD])).toBe(false);
    expect(localStorage.getItem(SKILLS_STORAGE_KEY)).toBeNull();
  });
});

describe('readSkills', () => {
  it('returns null on an empty store (caller falls back to seed)', () => {
    expect(readSkills()).toBeNull();
  });

  it('round-trips a persisted collection', () => {
    expect(persistSkills(VALID)).toBe(true);
    const expected = VALID.map((category) => ({
      ...category,
      technologies: category.technologies.map((technology) => ({
        ...technology,
        iconSvg: normalizeIconSvg(technology.iconSvg),
      })),
    }));
    expect(readSkills()).toEqual(expected);
  });

  it('returns null for corrupt JSON instead of throwing', () => {
    localStorage.setItem(SKILLS_STORAGE_KEY, '{not json');
    expect(readSkills()).toBeNull();
  });

  it('returns null for an unknown envelope version (migration guard)', () => {
    localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify({ v: 2, data: VALID }));
    expect(readSkills()).toBeNull();
  });

  it('returns null for a schema-invalid payload inside the envelope', () => {
    localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify({ v: 1, data: [INVALID_RECORD] }));
    expect(readSkills()).toBeNull();
  });
});

describe('removeSkills', () => {
  it('drops the stored envelope (Reset path)', () => {
    persistSkills(VALID);
    removeSkills();
    expect(readSkills()).toBeNull();
  });

  it('is idempotent and never throws on an empty store', () => {
    expect(() => removeSkills()).not.toThrow();
    expect(() => removeSkills()).not.toThrow();
  });
});
