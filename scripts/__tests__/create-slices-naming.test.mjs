import { describe, expect, it } from 'vitest';
import { deriveNames, toCamel, toKebab, toLayerPascal } from '../createSlices/naming.mjs';

/**
 * REQ-Q4.1 / plan §2.3.1 — naming rules of the slice generator.
 *
 * Every artifact name is derived from the PascalCase CLI argument:
 *   - directory / component: argument as-is;
 *   - RTK name, store key, slice file base: `arg[0].toLowerCase() + arg.slice(1)`;
 *   - SCSS class: same camelCase value;
 *   - story title: `<LayerPascal>/<Name>`;
 *   - data-testid: kebab via `replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()`
 *     (digits never break it: `Contact2` → `contact2`, `OAuthClient2` → `oauth-client2`).
 */
describe('naming helpers (REQ-G3, plan §2.3.1)', () => {
  it('toCamel lowercases only the first character of the Pascal argument', () => {
    expect(toCamel('ContactForm')).toBe('contactForm');
    expect(toCamel('Contact2')).toBe('contact2');
    expect(toCamel('OAuthClient2')).toBe('oAuthClient2');
    expect(toCamel('A')).toBe('a');
  });

  it('toKebab splits on lower/digit → upper boundaries only', () => {
    expect(toKebab('ContactForm')).toBe('contact-form');
    expect(toKebab('Contact2')).toBe('contact2');
    expect(toKebab('Contact2Form')).toBe('contact2-form');
    expect(toKebab('OAuthClient2')).toBe('oauth-client2');
  });

  it('toLayerPascal capitalizes the layer segment for story titles', () => {
    expect(toLayerPascal('features')).toBe('Features');
    expect(toLayerPascal('entities')).toBe('Entities');
    expect(toLayerPascal('pages')).toBe('Pages');
    expect(toLayerPascal('widgets')).toBe('Widgets');
  });

  it('deriveNames assembles every artifact name (REQ-G3 table)', () => {
    expect(deriveNames('features', 'ContactForm')).toEqual({
      layer: 'features',
      name: 'ContactForm',
      camel: 'contactForm',
      kebab: 'contact-form',
      layerPascal: 'Features',
      storyTitle: 'Features/ContactForm',
      withSlice: false,
    });
  });

  it('deriveNames keeps digits intact in testids and story titles', () => {
    expect(deriveNames('features', 'Contact2').kebab).toBe('contact2');
    expect(deriveNames('features', 'OAuthClient2').kebab).toBe('oauth-client2');
    expect(deriveNames('pages', 'Contact2Form').storyTitle).toBe('Pages/Contact2Form');
    expect(deriveNames('entities', 'OAuthClient2').storyTitle).toBe('Entities/OAuthClient2');
  });

  it('deriveNames flags the redux option when requested', () => {
    expect(deriveNames('entities', 'Job', true).withSlice).toBe(true);
    expect(deriveNames('entities', 'Job').withSlice).toBe(false);
  });
});
