// ============================================
// Updated App Component with FSD Structure
// ============================================

import React from 'react';
import { HomePage } from '@/pages/Home';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { LanguageProvider } from '@/app/providers/LanguageProvider';
import '@/shared/styles/globals.scss';

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