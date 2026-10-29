// ============================================
// Updated App Component with FSD Structure
// ============================================

import { I18nProvider, StoreProvider, ThemeProvider } from '@/app/providers';
import { AppRouter } from '@/pages/AppRouter';
import './app/styles/globals/index.scss';

import React, { useCallback, useEffect, useRef } from 'react';
import { CONTENT_SYNC_CHANNEL, isContentSyncMessage } from '@/shared/lib/contentSync/contentSync';
import { useDispatch, useSelector } from 'react-redux';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { apiSlice } from '@/shared/api/apiSlice';
import { selectAuthUser } from '@/features/Auth/model/selectors/selectors';
import { bootstrapSession } from '@/features/Auth';
import { updateAboutContent } from '@/features/AdminAbout/model/slices/aboutContentSlice';
import { normalizeAboutPayload, extractAboutRevision } from '@/entities/AboutContent';
import { ToastProvider } from './shared/lib/contexts/ToastContext';
import { useTheme } from '@/shared/lib/contexts/ThemeContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import type { Theme } from '@/shared/lib/contexts/ThemeContext/model/types';
import type { UserTheme, UserLanguage } from '@/shared/api/types';
import { storeReducers } from './storeReducers';

/**
 * Main App Component
 *
 * Provider stack + global router (wiki/plan/admin-panel.md §2.3):
 * Store → Toast → I18n → Theme → Router (RTK provider outermost, per spec —
 * review fix reordered it back; routes: `/` showcase, `/admin` lazy page
 * module).
 */
const SessionBootstrap: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<unknown, unknown, UnknownAction>>();

  const loadedAboutRevisionRef = useRef<string | null>(null);
  const loadInFlightRef = useRef<Promise<void> | null>(null);

  const loadAbout = useCallback(async () => {
    try {
      const data = await dispatch(
        apiSlice.endpoints.getAboutContent.initiate(undefined, { forceRefetch: true })
      ).unwrap();
      if (!data) return;

      const revision = extractAboutRevision(data);
      if (revision !== null && revision === loadedAboutRevisionRef.current) return;

      const normalized = normalizeAboutPayload(data);
      if (normalized === undefined) return;

      dispatch(updateAboutContent(normalized));
      loadedAboutRevisionRef.current = revision;
    } catch {
      // Design C: keep seed fallback when API is unavailable or empty.
    }
  }, [dispatch]);

  const scheduleLoadAbout = useCallback(() => {
    if (loadInFlightRef.current) return loadInFlightRef.current;

    const promise = loadAbout().finally(() => {
      if (loadInFlightRef.current === promise) {
        loadInFlightRef.current = null;
      }
    });

    loadInFlightRef.current = promise;
    return promise;
  }, [loadAbout]);

  useEffect(() => {
    const api = {
      refresh: () => dispatch(apiSlice.endpoints.refresh.initiate()).unwrap(),
      me: () => dispatch(apiSlice.endpoints.me.initiate()).unwrap(),
    };
    void bootstrapSession(dispatch, api);
  }, [dispatch]);

  useEffect(() => {
    void scheduleLoadAbout();

    if (typeof BroadcastChannel === 'undefined') {
      // No BroadcastChannel: rely on storage event fallback only
      const storageKey = 'resume.about.content';
      const handleStorage = (e: StorageEvent) => {
        if (e.key !== storageKey) return;
        try {
          const raw = e.newValue ?? window.localStorage.getItem(storageKey);
          if (!raw) return;
          const parsed = JSON.parse(raw);
          const source =
            typeof parsed === 'object' &&
            parsed !== null &&
            !Array.isArray(parsed) &&
            'content' in (parsed as Record<string, unknown>)
              ? (parsed as Record<string, unknown>).content
              : parsed;
          const normalized = normalizeAboutPayload(source);
          if (normalized === undefined) return;
          dispatch(updateAboutContent(normalized));
          loadedAboutRevisionRef.current = extractAboutRevision(source ?? parsed);
        } catch {
          // ignore storage errors
        }
      };
      window.addEventListener('storage', handleStorage);
      return () => {
        window.removeEventListener('storage', handleStorage);
      };
    }

    // BroadcastChannel path
    const channel = new BroadcastChannel(CONTENT_SYNC_CHANNEL);
    channel.onmessage = (event) => {
      if (isContentSyncMessage(event.data)) {
        void scheduleLoadAbout();
      }
    };
    const onFocus = () => {
      void scheduleLoadAbout();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void scheduleLoadAbout();
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      channel.close();
    };
  }, [scheduleLoadAbout, dispatch]);
};

const AuthPreferenceSync: React.FC = () => {
  const user = useSelector(selectAuthUser);
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();

  useEffect(() => {
    if (!user) return;

    const theme = user.theme as UserTheme | undefined;
    if (theme === 'dark' || theme === 'light') {
      setTheme(theme as Theme);
    }

    const language = user.language as UserLanguage | undefined;
    if (language === 'en' || language === 'ru') {
      setLanguage(language);
    }
  }, [user, setTheme, setLanguage]);

  return null;
};

const App: React.FC = () => {
  return (
    <StoreProvider reducers={storeReducers}>
      <SessionBootstrap />
      <ToastProvider>
        <I18nProvider>
          <ThemeProvider>
            <AuthPreferenceSync />
            <AppRouter />
          </ThemeProvider>
        </I18nProvider>
      </ToastProvider>
    </StoreProvider>
  );
};

export default App;
