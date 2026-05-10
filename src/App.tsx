// ============================================
// Updated App Component with FSD Structure
// ============================================

import { I18nProvider } from '@/app/providers/I18nProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { HomePage } from '@/pages/Home';
import '@/shared/styles/globals/index.scss';

import React from 'react';
import { ToastProvider } from './shared/lib/contexts/ToastContext';
/**
 * Main App Component
 *
 * This component will be replaced by the FSD structure.
 * Currently serves as a bridge during migration.
 */
const App: React.FC = () => {
  return (
    <ToastProvider>
      <I18nProvider>
        <ThemeProvider>
          <HomePage />
        </ThemeProvider>
      </I18nProvider>
    </ToastProvider>
  );
};

export default App;
