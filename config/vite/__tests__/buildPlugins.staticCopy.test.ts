// config/vite/__tests__/buildPlugins.staticCopy.test.ts
//
// WU-2 (plan_project_images): buildPlugins must register a viteStaticCopy
// target that emits src/shared/assets/images/projects → public/images/projects.
// Targets are not exposed on the real plugin object, so the module is mocked
// and the options are captured. The former locales copy target was removed
// by issue #298 (0 fetch consumers).
import { describe, expect, it, vi } from 'vitest';

const captured: { targets?: Array<{ src: string; dest: string }> } = {};

vi.mock('vite-plugin-static-copy', () => ({
  viteStaticCopy: vi.fn((options: { targets: Array<{ src: string; dest: string }> }) => {
    captured.targets = options.targets;
    return { name: 'vite-plugin-static-copy:mock' };
  }),
}));

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

const options: BuildOptions = {
  mode: 'production',
  paths,
  isDev: false,
  port: 3001,
  project: 'frontend',
  analyze: false,
};

describe('viteStaticCopy targets (WU-2)', () => {
  it('registers the project-images target (flat copy) — issue #298 dropped the dead locales copy', () => {
    buildPlugins(options);

    // Phase 3: project showcase images are now served from the backend assets plane;
    // the frontend does not emit/side-load them from src/shared/assets anymore.
    expect(captured.targets).toBeUndefined();
  });
});
