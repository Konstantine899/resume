import { describe, expect, it, vi } from 'vitest';

import { login, logout } from './session';

describe('session transitions', () => {
  it('dispatches adminAuth/login without persisting', () => {
    const dispatch = vi.fn();
    login(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0]?.[0]).toEqual({ type: 'adminAuth/login' });
  });

  it('dispatches adminAuth/logout', () => {
    const dispatch = vi.fn();

    logout(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0]?.[0]).toEqual({ type: 'adminAuth/logout' });
  });
});
