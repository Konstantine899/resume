// ============================================
// Admin area — Contact editor page (Contact CRUD plan §10 WU-3)
// ============================================
//
// Child route `/admin/contact` rendered through AdminLayout's <Outlet/>.
// Thin page: section wrapper + error boundary around the feature form —
// all editing logic lives in features/AdminContact (FSD pages compose).
// Own module so react-refresh/only-export-components keeps the route-table
// constants, the layout shell and page components separate (AdminAboutPage
// pattern).
import { ContactEditorForm } from '@/features/AdminContact';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Section } from '@/shared/ui/Section';
import React from 'react';

export const AdminContactPage: React.FC = () => {
  return (
    <Section size="md" data-testid="admin-contact">
      <ErrorBoundary>
        <ContactEditorForm />
      </ErrorBoundary>
    </Section>
  );
};

AdminContactPage.displayName = 'AdminContactPage';
