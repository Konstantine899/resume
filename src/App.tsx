// ============================================
// Updated App Component with FSD Structure
// ============================================

import { LanguageProvider } from '@/app/providers/LanguageProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { HomePage } from '@/pages/Home';
import '@/shared/styles/globals/index.scss';
import React from 'react';
/**
 * Main App Component
 *
 * This component will be replaced by the FSD structure.
 * Currently serves as a bridge during migration.
 */
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <HomePage />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
