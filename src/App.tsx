// ============================================
// Updated App Component with FSD Structure
// ============================================

import { I18nProvider, StoreProvider, ThemeProvider } from '@/app/providers';
import { AppRouter } from '@/pages/AppRouter';
import './app/styles/globals/index.scss';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { apiSlice } from '@/shared/api/apiSlice';
import { selectAuthUser } from '@/features/Auth/model/selectors/selectors';
import { bootstrapSession } from '@/features/Auth';
import { updateAboutContent } from '@/features/AdminAbout/model/slices/aboutContentSlice';
import type { AboutContent } from '@/entities/AboutContent';
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

  useEffect(() => {
    const api = {
      refresh: () => dispatch(apiSlice.endpoints.refresh.initiate()).unwrap(),
      me: () => dispatch(apiSlice.endpoints.me.initiate()).unwrap(),
    };
    void bootstrapSession(dispatch, api);
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    const loadAbout = async () => {
      try {
        const data = await dispatch(apiSlice.endpoints.getAboutContent.initiate()).unwrap();
        if (cancelled || !data) return;
        dispatch(updateAboutContent(data as AboutContent));
      } catch {
        // Design C: keep seed fallback when API is unavailable or empty.
      }
    };
    void loadAbout();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);
  return null;
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
