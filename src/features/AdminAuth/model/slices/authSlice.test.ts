// ============================================
// adminAuth slice — WU-2 stub (admin-panel plan)
// ============================================
//
// The slice is the root store's first reducer: `login`/`logout` flip the
// auth flag kept as the §8.4 JWT swap-point (the AdminGate that read it via
// selectIsAuthed was removed — plan rev. 2026-10-02). Reducer-map
// injection from the composition root (src/App.tsx) is covered by
// StoreProvider.test; here we only prove the pure state machine.

import { describe, expect, it, vi } from 'vitest';

import { adminAuthReducer, login, logout } from './authSlice';
import { selectIsAuthed } from '../selectors';
import { ADMIN_AUTH_STORAGE_KEY } from '../services/storage';
import type { AdminAuthRootState } from '../types';

describe('adminAuth slice', () => {
  it('starts unauthenticated', () => {
    expect(adminAuthReducer(undefined, { type: 'unknown' })).toEqual({
      isAuthed: false,
    });
  });

  it('login marks the session authed', () => {
    expect(adminAuthReducer({ isAuthed: false }, login())).toEqual({
      isAuthed: true,
    });
  });

  it('logout clears the session', () => {
    expect(adminAuthReducer({ isAuthed: true }, logout())).toEqual({
      isAuthed: false,
    });
  });

  it('exposes namespaced action types', () => {
    expect(login().type).toBe('adminAuth/login');
    expect(logout().type).toBe('adminAuth/logout');
  });
});

describe('selectIsAuthed', () => {
  it('reads the adminAuth slice from the injected root shape', () => {
    const authed: AdminAuthRootState = { adminAuth: { isAuthed: true } };
    const guest: AdminAuthRootState = { adminAuth: { isAuthed: false } };

    expect(selectIsAuthed(authed)).toBe(true);
    expect(selectIsAuthed(guest)).toBe(false);
  });
});

// Keep LAST: vi.resetModules + a fresh dynamic import replace the module
// copy for the rest of this file's imports (the static bindings above stay).
describe('persistence (§8.4-B)', () => {
  it('hydrates the initial state from the localStorage flag', async () => {
    localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, '1');
    vi.resetModules();
    const fresh = await import('./authSlice');

    expect(fresh.adminAuthReducer(undefined, { type: 'unknown' })).toEqual({
      isAuthed: true,
    });
    localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
  });
});
