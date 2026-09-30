// ============================================
// Updated App Component with FSD Structure
// ============================================

import { I18nProvider, ThemeProvider } from '@/app/providers';
import { AppRouter } from '@/pages/AppRouter';
import '@/shared/styles/globals/index.scss';

import React from 'react';
import { ToastProvider } from './shared/lib/contexts/ToastContext';
/**
 * Main App Component
 *
 * Provider stack + global router (wiki/plan/admin-panel.md §2.1-A):
 * Toast → I18n → Theme → AppRouter (routes `/` showcase, `/admin` placeholder).
 */
const App: React.FC = () => {
  return (
    <ToastProvider>
      <I18nProvider>
        <ThemeProvider>
          <AppRouter />
        </ThemeProvider>
      </I18nProvider>
    </ToastProvider>
  );
};

export default App;
