// ============================================
// Updated App Component with FSD Structure
// ============================================

import { I18nProvider, StoreProvider, ThemeProvider } from '@/app/providers';
import { AppRouter } from '@/pages/AppRouter';
import '@/shared/styles/globals/index.scss';

import React from 'react';
import { ToastProvider } from './shared/lib/contexts/ToastContext';
import { storeReducers } from './storeReducers';

/**
 * Main App Component
 *
 * Provider stack + global router (wiki/plan/admin-panel.md §2.1-A):
 * Toast → I18n → Theme → Store → AppRouter (routes `/` showcase,
 * `/admin` lazy page module).
 */
const App: React.FC = () => {
  return (
    <ToastProvider>
      <I18nProvider>
        <ThemeProvider>
          <StoreProvider reducers={storeReducers}>
            <AppRouter />
          </StoreProvider>
        </ThemeProvider>
      </I18nProvider>
    </ToastProvider>
  );
};

export default App;
