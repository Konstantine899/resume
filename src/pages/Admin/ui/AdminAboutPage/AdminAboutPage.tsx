// ============================================
// Admin area — About editor page (About CRUD plan §10 WU-3)
// ============================================
//
// Child route `/admin/about` rendered through AdminLayout's <Outlet/>.
// Thin page: section wrapper + error boundary around the feature form —
// all editing logic lives in features/AdminAbout (FSD pages compose).
// Own module so react-refresh/only-export-components keeps the route-table
// constants, the layout shell and page components separate (AdminSettings
// pattern).
import { AboutEditorForm } from '@/features/AdminAbout';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Section } from '@/shared/ui/Section';
import React from 'react';

export const AdminAboutPage: React.FC = () => {
  return (
    <Section size="md" data-testid="admin-about">
      <ErrorBoundary>
        <AboutEditorForm />
      </ErrorBoundary>
    </Section>
  );
};

AdminAboutPage.displayName = 'AdminAboutPage';
