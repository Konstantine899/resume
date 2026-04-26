import '@/shared/lib/i18n/config/i18n';
import React from 'react';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default I18nProvider;
