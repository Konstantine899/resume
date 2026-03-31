// ============================================
// useLanguage Hook
// ============================================

import { LanguageContext } from '@/shared/lib/contexts';
import { useContext } from 'react';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default useLanguage;
