// config/vite/__tests__/buildPlugins.test.ts
//
// RED test for Phase 2, T5: the PurgeCSS plugin must be registered on EVERY
// production build, not only when ANALYZE=true. Today it is gated behind
// `isProd && analyze`, which means normal `npm run build` never purges CSS.
import type { PluginOption } from 'vite';
import { describe, expect, it } from 'vitest';

import { buildPlugins } from '../buildPlugins.ts';
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

function flatten(options: PluginOption[]): PluginOption[] {
  return (options as unknown[]).flat(Infinity).filter(Boolean) as PluginOption[];
}

function pluginNames(options: PluginOption[]): string[] {
  return flatten(options)
    .map((plugin) =>
      typeof plugin === 'object' && plugin !== null && 'name' in plugin
        ? String((plugin as { name?: string }).name)
        : ''
    )
    .filter(Boolean);
}

describe('buildPlugins', () => {
  it('registers the PurgeCSS plugin on a plain production build (no ANALYZE)', () => {
    expect(pluginNames(buildPlugins(makeOptions()))).toContain('vite-plugin-purgecss');
  });

  it('registers the bundle visualizer only when ANALYZE=true', () => {
    const withoutAnalyze = pluginNames(buildPlugins(makeOptions({ analyze: false })));
    const withAnalyze = pluginNames(buildPlugins(makeOptions({ analyze: true })));

    expect(withoutAnalyze).not.toContain('visualizer');
    expect(withAnalyze).toContain('visualizer');
    expect(withAnalyze).toContain('vite-plugin-purgecss');
  });

  it('does not register production-only plugins in dev', () => {
    const names = pluginNames(buildPlugins(makeOptions({ isDev: true, mode: 'development' })));

    expect(names).not.toContain('vite-plugin-purgecss');
    expect(names).not.toContain('visualizer');
  });

  it('always registers the svg transform and static locale copy', () => {
    const names = pluginNames(buildPlugins(makeOptions()));

    expect(names).toContain('vite-plugin-scss-unused-analyzer');
    expect(names.length).toBeGreaterThan(3);
  });
});
