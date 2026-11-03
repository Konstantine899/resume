import { authToken } from '@/shared/api/authToken';
import type { AuthUser } from '@/shared/api/types';

import {
  bootstrapFinished as bootstrapFinishedAction,
  signedOut,
  userSet,
} from '../slices/authSlice';

type BootstrapApi = {
  refresh: () => Promise<{ accessToken: string } | unknown> | unknown;
  me: () => Promise<AuthUser | unknown> | unknown;
};

let inFlight: Promise<void> | null = null;
let finished = false;

export function resetBootstrapSession(): void {
  inFlight = null;
  finished = false;
}

export const resetBootstrap = resetBootstrapSession;
export const resetFinished = resetBootstrapSession;
export function resetBootstrapFinished(): void {
  finished = false;
}

export async function bootstrapSession(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: (action: any) => any,
  api: BootstrapApi
): Promise<void> {
  if (finished) return Promise.resolve();
  if (inFlight) return inFlight;

  const run = async (): Promise<void> => {
    const hasToken = authToken.getAccessToken();
    if (!hasToken) {
      try {
        const refreshResult = await api.refresh();
        const token =
          (refreshResult as { accessToken?: string } | null | undefined)?.accessToken ??
          (refreshResult as { data?: { accessToken?: string } } | null | undefined)?.data
            ?.accessToken;
        if (token) authToken.setAccessToken(token);
        else authToken.clearAccessToken();
      } catch {
        authToken.clearAccessToken();
        dispatch(signedOut());
        dispatch(bootstrapFinishedAction());
        finished = true;
        return;
      }
    }

    try {
      const me = await api.me();
      dispatch(userSet(me as AuthUser));
      dispatch(bootstrapFinishedAction());
    } catch {
      authToken.clearAccessToken();
      dispatch(signedOut());
      dispatch(bootstrapFinishedAction());
    } finally {
      finished = true;
    }
  };

  inFlight = run();
  void inFlight.finally(() => {
    inFlight = null;
  });
  return inFlight;
}
