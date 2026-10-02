// ============================================
// Updated App Component with FSD Structure
// ============================================

import { I18nProvider, StoreProvider, ThemeProvider } from '@/app/providers';
import { adminAuthReducer } from '@/features/AdminAuth';
import { AppRouter } from '@/pages/AppRouter';
import '@/shared/styles/globals/index.scss';

import React from 'react';
import { ToastProvider } from './shared/lib/contexts/ToastContext';

// Stable reducer-map reference (StoreProvider useMemo contract): keep it at
// module level — an inline object literal would rebuild the store on every
// render (admin-panel plan WU-2). App.tsx is the composition root, outside
// FSD slices, which is why it may inject features/AdminAuth here.
const storeReducers = { adminAuth: adminAuthReducer };

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
