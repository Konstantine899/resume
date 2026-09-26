// config/vite/__tests__/buildViteConfig.test.ts
//
// RED tests for Phase 2, T6: manualChunks must (a) emit an explicit "i18n" chunk
// for the bundled locale JSON, (b) stop emitting a "forms" chunk nobody builds
// against, and (c) keep node_modules/react-hit packages inside "vendor" exactly
// as they are today (react-hook-form already lands in vendor via the substring
// match — tightening that rule would push main.js over the budget cap).
import { describe, expect, it } from 'vitest';

import { buildViteConfig, resolveManualChunk } from '../buildViteConfig.ts';
import type { BuildOptions, BuildPath } from '../types/config.ts';

const paths: BuildPath = {
  src: '/repo/src',
  locales: '/repo/src/shared/lib/i18n/locales',
  buildLocales: '/repo/public/locales',
  app: '/repo/src/app',
  pages: '/repo/src/pages',
  entities: '/repo/src/entities',
  features: '/repo/src/features',
  shared: '/repo/src/shared',
  widgets: '/repo/src/widgets',
};

function makeOptions(overrides: Partial<BuildOptions> = {}): BuildOptions {
  return {
    mode: 'production',
    paths,
    isDev: false,
    port: 3001,
    project: 'frontend',
    analyze: false,
    ...overrides,
  };
}

describe('resolveManualChunk', () => {
  it('routes bundled locale JSON into the i18n chunk', () => {
    expect(resolveManualChunk('/repo/src/shared/lib/i18n/locales/en.json')).toBe('i18n');
    expect(resolveManualChunk('D:\\repo\\src\\shared\\lib\\i18n\\locales\\ru.json')).toBe('i18n');
  });

  it('routes i18next runtime packages into the i18n chunk', () => {
    expect(resolveManualChunk('/repo/node_modules/i18next/index.js')).toBe('i18n');
    // react-i18next is deliberately NOT listed here: it matches the broader
    // `node_modules/react` rule first and stays in vendor, exactly as it does
    // on the baseline build.
    expect(resolveManualChunk('/repo/node_modules/react-i18next/index.js')).toBe('vendor');
  });

  it('stops emitting a forms chunk', () => {
    expect(resolveManualChunk('/repo/node_modules/zod/index.js')).not.toBe('forms');
    expect(resolveManualChunk('/repo/node_modules/@hookform/resolvers/zod/index.js')).not.toBe(
      'forms'
    );
    expect(resolveManualChunk('/repo/node_modules/@emailjs/browser/index.js')).not.toBe('forms');
    expect(resolveManualChunk('/repo/node_modules/react-hook-form/dist/index.cjs.js')).not.toBe(
      'forms'
    );
  });

  it('keeps react-related packages in vendor, including react-hook-form', () => {
    expect(resolveManualChunk('/repo/node_modules/react/index.js')).toBe('vendor');
    expect(resolveManualChunk('/repo/node_modules/react-dom/index.js')).toBe('vendor');
    expect(resolveManualChunk('/repo/node_modules/scheduler/index.js')).toBe('vendor');
    expect(resolveManualChunk('/repo/node_modules/react-hook-form/dist/index.cjs.js')).toBe(
      'vendor'
    );
    expect(resolveManualChunk('/repo/node_modules/react-i18next/index.js')).toBe('vendor');
  });

  it('leaves unrelated dependencies to Rollup', () => {
    expect(resolveManualChunk('/repo/node_modules/lodash-es/index.js')).toBeUndefined();
  });

  it('matches the identifier namespaced chunk names only for real i18n packages', () => {
    expect(resolveManualChunk('/repo/node_modules/@i18next/parser/index.js')).toBeUndefined();
    expect(resolveManualChunk('/repo/node_modules/i18next-browser-languagedetector/x.js')).toBe(
      'i18n'
    );
  });
});

describe('buildViteConfig', () => {
  it('wires resolveManualChunk into rollupOptions.output.manualChunks', () => {
    const config = buildViteConfig(makeOptions());
    const output = config.build?.rollupOptions?.output;

    expect(output).toBeDefined();
    expect((output as { manualChunks?: unknown }).manualChunks).toBe(resolveManualChunk);
  });
});
