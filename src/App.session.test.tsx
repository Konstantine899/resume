// ============================================
// SessionBootstrap / AuthPreferenceSync coverage
// ============================================
//
// `App.test.tsx` only proves that the tree mounts. This suite exercises the
// two behaviours that keep the showcase in sync with the backend:
//   * canonical About reload (mount, focus, visibility, cross-tab invalidation,
//     revision dedupe, error / empty fallback to the seed);
//   * server preference application (theme + language).
//
// Providers are mocked to passthrough components so the test never needs a
// real router, i18n detector, or theme engine; react-redux is reduced to the
// two hooks App actually calls.

import { act, render, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const h = vi.hoisted(() => ({
  initiate: vi.fn(),
  bootstrapSession: vi.fn(),
  updateAboutContent: vi.fn(),
  dispatch: vi.fn(),
  setTheme: vi.fn(),
  setLanguage: vi.fn(),
  user: { current: null as unknown },
}));

vi.mock('@/app/providers', () => {
  const Passthrough = ({ children }: { children: ReactNode }) => children;
  return {
    StoreProvider: Passthrough,
    I18nProvider: Passthrough,
    ThemeProvider: Passthrough,
  };
});

vi.mock(
  'react-redux',
  () =>
    ({
      useDispatch: () => h.dispatch,
      useSelector: () => h.user.current,
    }) as unknown as typeof import('react-redux')
);

vi.mock('@/pages/AppRouter', () => ({ AppRouter: () => null }));

vi.mock('@/shared/api/apiSlice', () => {
  const unwrap = async () => ({});
  return {
    apiSlice: {
      reducer: (state: unknown = {}) => state,
      middleware: () => (next: (action: unknown) => unknown) => next,
      endpoints: {
        getAboutContent: { initiate: h.initiate },
        refresh: { initiate: () => ({ unwrap }) },
        me: { initiate: () => ({ unwrap }) },
      },
    },
    baseQuery: vi.fn(),
    baseQueryWithReauth: vi.fn(),
    reauthBaseQuery: vi.fn(),
  };
});

vi.mock('@/features/AdminAbout/model/slices/aboutContentSlice', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/AdminAbout/model/slices/aboutContentSlice')>();
  return { ...actual, updateAboutContent: h.updateAboutContent };
});

vi.mock('@/features/Auth/model/services/sessionBootstrap', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/Auth/model/services/sessionBootstrap')>();
  return { ...actual, bootstrapSession: h.bootstrapSession };
});

vi.mock('@/shared/lib/contexts/ThemeContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib/contexts/ThemeContext')>();
  return { ...actual, useTheme: () => ({ setTheme: h.setTheme }) };
});

vi.mock('@/shared/lib/i18n/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/lib/i18n/hooks')>();
  return { ...actual, useLanguage: () => ({ setLanguage: h.setLanguage }) };
});

type ChannelLike = {
  readonly name: string;
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
};

const channels: ChannelLike[] = [];

class FakeBroadcastChannel implements ChannelLike {
  onmessage: ((event: MessageEvent) => void) | null = null;

  postMessage = vi.fn();

  close = vi.fn();

  constructor(public readonly name: string) {
    channels.push(this);
  }
}

const ABOUT_DOMAIN = {
  fullName: 'Ada Lovelace',
  descriptions: [{ en: 'Hello', ru: 'Привет' }],
  stats: { aboutStatYears: { en: '5', ru: '5' } },
  ctaLabel: { en: 'Hire me', ru: 'Найми' },
};
const ABOUT_ROW = { id: 'about-1', updatedAt: 'rev-1', ...ABOUT_DOMAIN };
const ABOUT_ROW_NEXT = {
  id: 'about-1',
  updatedAt: 'rev-2',
  ...ABOUT_DOMAIN,
  fullName: 'Ada Byron',
};

const lastChannel = (): ChannelLike => {
  const channel = channels[channels.length - 1];
  if (!channel) throw new Error('BroadcastChannel was never constructed');
  return channel;
};

const flush = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve();
  });
};

beforeEach(() => {
  channels.length = 0;
  vi.clearAllMocks();
  h.initiate.mockReset();
  h.bootstrapSession.mockReset().mockResolvedValue(undefined);
  h.updateAboutContent
    .mockReset()
    .mockImplementation((payload: unknown) => ({ type: 'about/update', payload }));
  h.dispatch.mockReset().mockImplementation((action: unknown) => action);
  h.setTheme.mockReset();
  h.setLanguage.mockReset();
  h.user.current = null;
  h.initiate.mockImplementation(() => ({ unwrap: async () => ABOUT_ROW }));
  vi.stubGlobal('BroadcastChannel', FakeBroadcastChannel);
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete (document as unknown as { visibilityState?: unknown }).visibilityState;
});

describe('SessionBootstrap — canonical About load', () => {
  it('hydrates About from the API and strips transport fields', async () => {
    render(<App />);

    await waitFor(() => expect(h.updateAboutContent).toHaveBeenCalledTimes(1));

    expect(h.initiate).toHaveBeenCalledWith(undefined, { forceRefetch: true });
    expect(h.updateAboutContent).toHaveBeenCalledWith(ABOUT_DOMAIN);
    expect(h.bootstrapSession).toHaveBeenCalledWith(h.dispatch, expect.any(Object));
  });

  it('exposes refresh/me to the session bootstrap', async () => {
    render(<App />);
    await waitFor(() => expect(h.bootstrapSession).toHaveBeenCalledTimes(1));

    const api = h.bootstrapSession.mock.calls[0]?.[1] as {
      refresh: () => Promise<unknown>;
      me: () => Promise<unknown>;
    };

    await expect(api.refresh()).resolves.toEqual({});
    await expect(api.me()).resolves.toEqual({});
  });

  it('hydrates a document that carries no revision marker', async () => {
    h.initiate.mockImplementation(() => ({
      unwrap: async () => ({ id: 'about-1', ...ABOUT_DOMAIN }),
    }));

    render(<App />);
    await waitFor(() => expect(h.updateAboutContent).toHaveBeenCalledTimes(1));
    expect(h.updateAboutContent).toHaveBeenCalledWith(ABOUT_DOMAIN);
  });

  it('falls back to the seed when the API call rejects', async () => {
    h.initiate.mockImplementation(() => ({
      unwrap: () => Promise.reject(new Error('offline')),
    }));

    render(<App />);
    await waitFor(() => expect(h.initiate).toHaveBeenCalledTimes(1));
    await flush();

    expect(h.updateAboutContent).not.toHaveBeenCalled();
    expect(h.setTheme).not.toHaveBeenCalled();
  });

  it('treats an empty API document as "no override"', async () => {
    h.initiate.mockImplementation(() => ({ unwrap: async () => null }));

    render(<App />);
    await waitFor(() => expect(h.initiate).toHaveBeenCalledTimes(1));
    await flush();

    expect(h.updateAboutContent).not.toHaveBeenCalled();
  });

  it('skips a reload that carries the same revision', async () => {
    render(<App />);
    await waitFor(() => expect(h.updateAboutContent).toHaveBeenCalledTimes(1));

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => expect(h.initiate).toHaveBeenCalledTimes(2));
    expect(h.updateAboutContent).toHaveBeenCalledTimes(1);
  });

  it('reloads on window focus when the revision changed', async () => {
    render(<App />);
    await waitFor(() => expect(h.updateAboutContent).toHaveBeenCalledTimes(1));

    h.initiate.mockImplementation(() => ({ unwrap: async () => ABOUT_ROW_NEXT }));

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => expect(h.updateAboutContent).toHaveBeenCalledTimes(2));
    expect(h.updateAboutContent).toHaveBeenLastCalledWith({
      ...ABOUT_DOMAIN,
      fullName: 'Ada Byron',
    });
  });

  it('reloads when another tab publishes an invalidation', async () => {
    render(<App />);
    await waitFor(() => expect(h.updateAboutContent).toHaveBeenCalledTimes(1));

    h.initiate.mockImplementation(() => ({ unwrap: async () => ABOUT_ROW_NEXT }));

    act(() => {
      lastChannel().onmessage?.(
        new MessageEvent('message', {
          data: { entity: 'about', updatedAt: 'rev-2', sourceTabId: 'tab-1' },
        })
      );
    });

    await waitFor(() => expect(h.updateAboutContent).toHaveBeenCalledTimes(2));
  });

  it('skips hidden visibility changes and reloads when visible again', async () => {
    render(<App />);
    await waitFor(() => expect(h.updateAboutContent).toHaveBeenCalledTimes(1));

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await flush();
    expect(h.initiate).toHaveBeenCalledTimes(1);

    h.initiate.mockImplementation(() => ({ unwrap: async () => ABOUT_ROW_NEXT }));
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await waitFor(() => expect(h.initiate).toHaveBeenCalledTimes(2));
  });

  it('bails out of the sync effect when BroadcastChannel is unavailable', async () => {
    vi.stubGlobal('BroadcastChannel', undefined);

    render(<App />);
    await waitFor(() => expect(h.updateAboutContent).toHaveBeenCalledTimes(1));
    expect(channels).toHaveLength(0);

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await flush();

    expect(h.initiate).toHaveBeenCalledTimes(1);
  });

  it('closes the channel and detaches listeners on unmount', async () => {
    const { unmount } = render(<App />);
    await waitFor(() => expect(h.updateAboutContent).toHaveBeenCalledTimes(1));

    const channel = lastChannel();
    unmount();

    expect(channel.close).toHaveBeenCalledTimes(1);

    h.initiate.mockClear();
    window.dispatchEvent(new Event('focus'));
    document.dispatchEvent(new Event('visibilitychange'));
    expect(h.initiate).not.toHaveBeenCalled();
  });
});

describe('AuthPreferenceSync — server preferences', () => {
  it('applies a valid server theme and language', async () => {
    h.user.current = { id: 'u1', theme: 'dark', language: 'ru' };

    render(<App />);

    await waitFor(() => expect(h.setTheme).toHaveBeenCalledWith('dark'));
    expect(h.setLanguage).toHaveBeenCalledWith('ru');
  });

  it('applies light and english preferences', async () => {
    h.user.current = { id: 'u1', theme: 'light', language: 'en' };

    render(<App />);

    await waitFor(() => expect(h.setTheme).toHaveBeenCalledWith('light'));
    expect(h.setLanguage).toHaveBeenCalledWith('en');
  });

  it('ignores unknown preference values', async () => {
    h.user.current = { id: 'u1', theme: 'oled', language: 'de' };

    render(<App />);
    await flush();

    expect(h.setTheme).not.toHaveBeenCalled();
    expect(h.setLanguage).not.toHaveBeenCalled();
  });

  it('does nothing for an anonymous session', async () => {
    render(<App />);
    await flush();

    expect(h.setTheme).not.toHaveBeenCalled();
    expect(h.setLanguage).not.toHaveBeenCalled();
  });
});
