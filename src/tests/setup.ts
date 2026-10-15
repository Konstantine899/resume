import '@/shared/lib/i18n/config/i18n';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// The i18n side-effect import above must stay first: it initializes the
// global i18next instance for EVERY unit test. Components like Image used
// to do this transitively (side-effect import), so removing the Hero broke
// tests that assert translated text without rendering Image at all.

// jsdom does not implement Element.scrollIntoView — stub it once so
// components may call it (e.g. MyWork pagination nav-parity scroll) and
// individual tests can spy on the element instance.
Element.prototype.scrollIntoView = vi.fn();
