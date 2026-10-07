// ============================================
// Admin area — Projects editor page (Projects CRUD plan §10 WU-4)
// ============================================
//
// Child route `/admin/mywork` rendered through AdminLayout's <Outlet/>.
// Thin page: list + form with the edit-selection state — all CRUD logic
// lives in features/AdminMyWork (FSD pages compose).
//
// Design C key-remount: the form instance is keyed by the edited record
// (`key={id ?? 'create'}`), so switching Edit ↔ create remounts it with
// fresh defaultValues instead of patching RHF state in place. The record
// itself is resolved through the feature's public selector; `onDeleted`
// clears a stale editingId (list delete while the form is open).
import { MyWorkEditorList, ProjectForm, selectAllProjects } from '@/features/AdminMyWork';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Section } from '@/shared/ui/Section';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

export const AdminMyWorkPage: React.FC = () => {
  const projects = useSelector(selectAllProjects);
  const [editingId, setEditingId] = useState<string | null>(null);

  // editingId without a live record (deleted elsewhere) falls back to
  // create mode — never render a form for a record that no longer exists.
  const editing = editingId ? projects.find((project) => project.id === editingId) : undefined;

  const handleExitEdit = () => setEditingId(null);

  const handleDeleted = (id: string) => {
    if (editingId === id) setEditingId(null);
  };

  return (
    <Section size="md" data-testid="admin-mywork">
      <ErrorBoundary>
        <MyWorkEditorList onEdit={setEditingId} onDeleted={handleDeleted} />
        <ProjectForm key={editing?.id ?? 'create'} project={editing} onExitEdit={handleExitEdit} />
      </ErrorBoundary>
    </Section>
  );
};

AdminMyWorkPage.displayName = 'AdminMyWorkPage';
