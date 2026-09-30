// ============================================
// adminAuth slice — WU-2 stub (admin-panel plan)
// ============================================
//
// The slice is the root store's first reducer: `enter`/`leave` flip the
// auth flag consumed by AdminGate (WU-3) via selectIsAuthed. Reducer-map
// injection from the composition root (src/App.tsx) is covered by
// StoreProvider.test; here we only prove the pure state machine.

import { describe, expect, it } from 'vitest';

import { adminAuthReducer, enter, leave } from './authSlice';
import { selectIsAuthed } from './selectors';
import type { AdminAuthRootState } from './types';

describe('adminAuth slice', () => {
  it('starts unauthenticated', () => {
    expect(adminAuthReducer(undefined, { type: 'unknown' })).toEqual({
      isAuthed: false,
    });
  });

  it('enter marks the session authed', () => {
    expect(adminAuthReducer({ isAuthed: false }, enter())).toEqual({
      isAuthed: true,
    });
  });

  it('leave clears the session', () => {
    expect(adminAuthReducer({ isAuthed: true }, leave())).toEqual({
      isAuthed: false,
    });
  });

  it('exposes namespaced action types', () => {
    expect(enter().type).toBe('adminAuth/enter');
    expect(leave().type).toBe('adminAuth/leave');
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
