// Icon resolver tests (plan_skills_crud §12 WU-2, A3 dual-mode).
// Never assert the vite content hash — it changes every build; assert
// the SHAPE (ends with .svg) or passthrough identity instead.

import { describe, expect, it, vi } from 'vitest';

import { resolveIconSvg } from './resolveIconSvg';

describe('resolveIconSvg', () => {
  it("resolves a key name ('react') to a usable asset URL", () => {
    const resolved = resolveIconSvg('react');
    expect(resolved).toBeDefined();
    // Vite inlines small SVGs as data: URIs (assetsInlineLimit) and emits
    // file URLs for larger ones — both shapes are valid render targets.
    expect(resolved).toMatch(/(\.svg$|^data:image\/svg\+xml)/);
  });

  it("resolves a key name without extension ('long-polling')", () => {
    const resolved = resolveIconSvg('long-polling');
    expect(resolved).toBeDefined();
    expect(resolved).toMatch(/(\.svg$|^data:image\/svg\+xml)/);
  });

  it('passes an absolute path through untouched (legacy fixture regression)', () => {
    expect(resolveIconSvg('/icons/react.svg')).toBe('/icons/react.svg');
  });

  it('passes a dev-source path through (seed shape in vitest/dev)', () => {
    expect(resolveIconSvg('/src/shared/assets/icons/skills/react.svg')).toBe(
      '/src/shared/assets/icons/skills/react.svg'
    );
  });

  it('passes http(s) URLs through', () => {
    expect(resolveIconSvg('https://cdn.example.com/react.svg')).toBe(
      'https://cdn.example.com/react.svg'
    );
  });

  it('passes data: URLs through (inline SVG icons)', () => {
    expect(resolveIconSvg('data:image/svg+xml;base64,AAAA')).toBe('data:image/svg+xml;base64,AAAA');
  });

  it('returns undefined + warns for an unknown key (fallback path, §7)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(resolveIconSvg('unknown-technology-icon')).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
