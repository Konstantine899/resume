// ============================================
// Session transitions — persist+dispatch pair (review fix, WU-5)
// ============================================
//
// Every auth transition must write BOTH the localStorage flag and the
// slice (§8.4-B contract) — that pair used to be inlined in two
// components (Duplicated Code finding). Here we pin the single source.

import { afterEach, describe, expect, it, vi } from 'vitest';

import { login, logout } from './session';
import { ADMIN_AUTH_STORAGE_KEY } from './storage';

describe('session transitions', () => {
  afterEach(() => {
    localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
  });

  it('persists the flag and dispatches adminAuth/login', () => {
    const dispatch = vi.fn();

    login(dispatch);

    expect(localStorage.getItem(ADMIN_AUTH_STORAGE_KEY)).toBe('1');
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0]?.[0]).toEqual({ type: 'adminAuth/login' });
  });

  it('logout clears the flag and dispatches adminAuth/logout', () => {
    localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, '1');
    const dispatch = vi.fn();

    logout(dispatch);

    expect(localStorage.getItem(ADMIN_AUTH_STORAGE_KEY)).toBeNull();
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0]?.[0]).toEqual({ type: 'adminAuth/logout' });
  });
});
