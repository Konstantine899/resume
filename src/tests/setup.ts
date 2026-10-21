import { loadRu } from '@/shared/lib/i18n/config/i18n';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// The i18n import above must stay first: it initializes the
// global i18next instance for EVERY unit test. Components like Image used
// to do this transitively (side-effect import), so removing the Hero broke
// tests that assert translated text without rendering Image at all.
//
// The ru locale bundle is lazy in the app (config/i18n.ts), but every unit
// test gets it eagerly: test/story mocks call i18n.changeLanguage('ru') and
// must never race the dynamic import (top-level await is fine in a vitest
// setup module).

await loadRu();

// jsdom does not implement Element.scrollIntoView — stub it once so
// components may call it (e.g. MyWork pagination nav-parity scroll) and
// individual tests may spy on the element instance.
Element.prototype.scrollIntoView = vi.fn();
