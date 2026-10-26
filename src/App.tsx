// ============================================
// Updated App Component with FSD Structure
// ============================================

import { I18nProvider, StoreProvider, ThemeProvider } from '@/app/providers';
import { AppRouter } from '@/pages/AppRouter';
import './app/styles/globals/index.scss';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { apiSlice } from '@/shared/api/apiSlice';
import { bootstrapSession } from '@/features/Auth';
import { ToastProvider } from './shared/lib/contexts/ToastContext';
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
  return null;
};

const App: React.FC = () => {
  return (
    <StoreProvider reducers={storeReducers}>
      <SessionBootstrap />
      <ToastProvider>
        <I18nProvider>
          <ThemeProvider>
            <AppRouter />
          </ThemeProvider>
        </I18nProvider>
      </ToastProvider>
    </StoreProvider>
  );
};

export default App;
