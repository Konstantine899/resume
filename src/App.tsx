// ============================================
// Updated App Component with FSD Structure
// ============================================

import { I18nProvider, StoreProvider, ThemeProvider } from '@/app/providers';
import { AppRouter } from '@/pages/AppRouter';
import './app/styles/globals/index.scss';

import React from 'react';
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
const App: React.FC = () => {
  return (
    <StoreProvider reducers={storeReducers}>
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
