// Public-API hygiene (barrel-hygiene #301 / gold standard: admin-jobs-refactor
// WU-8, admin-contact-refactor WU-3).
//
// The barrel may only re-export symbols that have a production consumer
// at the BARREL level. The two `*Props` type re-exports were dead there
// — the page composes TechnologiesList/TechnologyForm by value and never
// names their prop interfaces — so they are gone from `index.ts`. The
// implementations (and the interfaces themselves, used internally by the
// components) are untouched.
//
// Types are erased at runtime, so the removals are only assertable as
// absence — same precedent as AdminContact's index.test.ts.

import { describe, expect, it } from 'vitest';

import * as publicApi from './index';

const DEAD_EXPORTS = ['TechnologiesListProps', 'TechnologyFormProps'] as const;

const LIVE_EXPORTS = ['TechnologiesList', 'TechnologyForm'] as const;

describe('AdminTechnologies public API (#301 barrel hygiene)', () => {
  it.each(DEAD_EXPORTS)('%s is no longer exported (zero barrel consumers)', (name) => {
    expect(publicApi).not.toHaveProperty(name);
  });

  it.each(LIVE_EXPORTS)('%s stays part of the public API', (name) => {
    expect(publicApi).toHaveProperty(name);
  });
});
