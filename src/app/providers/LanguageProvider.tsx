import { LanguageProvider as SharedLanguageProvider } from '@/shared/lib/contexts';
import React from 'react';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SharedLanguageProvider>
      {children}
    </SharedLanguageProvider>
  );
};

export default LanguageProvider;
