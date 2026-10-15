import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { validateLinkProps } from './validateLinkProps';

/**
 * `validateLinkProps` is a no-op outside development, so the environment is
 * stubbed per test. The URL-scheme matrix is asserted here because two
 * independent guards must agree: the "may be invalid" prefix check and
 * `hasSafeUrlScheme` (the blocked-scheme check). They drifted apart —
 * `mailto:`/`tel:` passed the security check yet still warned as invalid,
 * which produced console noise on every Contact email render.
 */
describe('validateLinkProps: href scheme matrix', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  const hrefsWithoutWarning = [
    '/about',
    '/nested/path',
    'https://example.com',
    'http://example.com',
    '#contact',
    'mailto:kostay375298918971@gmail.com',
    'tel:+79991234567',
  ];

  it.each(hrefsWithoutWarning)('accepts "%s"', (href) => {
    validateLinkProps({ href });

    expect(warn).not.toHaveBeenCalled();
  });

  it('flags a malformed href as possibly invalid', () => {
    validateLinkProps({ href: 'some-relative-path' });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('may be invalid'));
  });

  it('blocks executable schemes regardless of the prefix check', () => {
    // Assembled rather than written as a literal: ESLint's `no-script-url`
    // forbids a bare `javascript:` string. The point of the case is the
    // dangerous scheme, so it is built explicitly instead of suppressed.
    const executableHref = ['javascript', 'alert(1)'].join(':');
    validateLinkProps({ href: executableHref });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('blocked URL scheme'));
  });

  it('blocks data: URLs as an unsafe scheme', () => {
    validateLinkProps({ href: 'data:text/html,<h1>hi</h1>' });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('blocked URL scheme'));
  });
});
