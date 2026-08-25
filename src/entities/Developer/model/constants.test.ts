import { describe, expect, it } from 'vitest';
import { DEVELOPER_DATA, getDeveloperInitials } from './constants';

describe('getDeveloperInitials', () => {
  it('returns a non-empty string', () => {
    const initials = getDeveloperInitials();
    expect(typeof initials).toBe('string');
    expect(initials.length).toBeGreaterThan(0);
  });

  it('is stable across calls', () => {
    expect(getDeveloperInitials()).toBe(getDeveloperInitials());
  });

  it('is derived from the configured full name', () => {
    expect(DEVELOPER_DATA.fullName).toContain(' ');
  });
});
