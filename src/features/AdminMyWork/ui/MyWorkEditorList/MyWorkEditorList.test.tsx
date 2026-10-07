// ============================================
// MyWorkEditorList tests (plan_projects_crud §10 WU-4, §6)
// ============================================
//
// RED-first contract: one row per stored project (title, featured/status
// badges, Edit/Delete), Edit emits onEdit(id), Delete goes through a kit
// Modal confirm with persist BEFORE dispatch (§3) and Toast feedback (§6).
// The react-redux store is a mutable holder so the empty state can be
// rendered without a second mock.

import type { Project } from '@/entities/Project';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProjectsSeed } from '../../model/services/seed';
import { MyWorkEditorList } from './MyWorkEditorList';

const { persistSpy, deleteSpy, addToast, holder } = vi.hoisted(() => ({
  persistSpy: vi.fn((_projects: unknown[]) => true),
  deleteSpy: vi.fn((id: string) => ({ type: 'myWork/deleteProject', payload: id })),
  addToast: vi.fn(),
  holder: { state: { myWork: [] as Project[] } },
}));

vi.mock('../../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/services/storage')>()),
  persistProjects: persistSpy,
}));

vi.mock('../../model/slices/myWorkSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/myWorkSlice')>()),
  deleteProject: deleteSpy,
}));

// Deterministic labels: t(key) => key — assertions target raw i18n keys.
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
    isTransitioning: false,
  }),
}));

vi.mock('@/shared/lib/contexts/ToastContext', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/contexts/ToastContext')>()),
  useToast: () => ({ addToast, removeToast: vi.fn() }),
}));

// Store holder instead of StoreProvider: `features → app` is a banned FSD
// hop; the REAL selectors run against whatever state the test installs.
// Dispatch simulates the delete reducer so §6's "row disappears" is real:
// without it the holder never changes and rows would stay stale.
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: { myWork: Project[] }) => unknown) => selector(holder.state),
    useDispatch: () => (action: { type?: string; payload?: string }) => {
      if (action?.type === 'myWork/deleteProject' && typeof action.payload === 'string') {
        holder.state = { myWork: holder.state.myWork.filter((p) => p.id !== action.payload) };
      }
      return action;
    },
  };
});

const seedProjects = createProjectsSeed();

const renderList = (onEdit = vi.fn(), onDeleted = vi.fn()) => ({
  onEdit,
  onDeleted,
  ...render(<MyWorkEditorList onEdit={onEdit} onDeleted={onDeleted} />),
});

const rows = () => screen.getAllByRole('listitem');

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  persistSpy.mockReturnValue(true);
  holder.state = { myWork: seedProjects };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('MyWorkEditorList: render (§6 rows + badges)', () => {
  it('renders one row per project with title, status and Edit/Delete', () => {
    renderList();

    expect(rows()).toHaveLength(seedProjects.length);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((node) => node.textContent)).toEqual(
      seedProjects.map((project) => project.title)
    );
    // Status badge shows the enum value of the first row.
    expect(rows()[0]).toHaveTextContent(seedProjects[0]?.status ?? '');
    // Every row offers both actions.
    for (const row of rows()) {
      expect(within(row).getByRole('button', { name: 'projectEdit' })).toBeInTheDocument();
      expect(within(row).getByRole('button', { name: 'projectDelete' })).toBeInTheDocument();
    }
    // Featured badge count matches the seed's featured flags.
    expect(screen.getAllByText('projectFieldFeatured')).toHaveLength(
      seedProjects.filter((project) => project.featured).length
    );
  });

  it('shows the shared empty state when nothing is stored', () => {
    holder.state = { myWork: [] };
    renderList();

    expect(screen.getByText('noProjectsYet')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'projectEdit' })).not.toBeInTheDocument();
  });
});

describe('MyWorkEditorList: edit (§6 onEdit wiring)', () => {
  it('emits onEdit with the row project id', () => {
    const { onEdit, onDeleted } = renderList();

    fireEvent.click(within(rows()[0] as HTMLElement).getByRole('button', { name: 'projectEdit' }));

    expect(onEdit).toHaveBeenCalledWith(seedProjects[0]?.id);
    expect(onDeleted).not.toHaveBeenCalled();
    expect(persistSpy).not.toHaveBeenCalled();
  });
});

describe('MyWorkEditorList: delete (Modal confirm → persist → dispatch)', () => {
  it('does nothing when the confirm is declined', async () => {
    renderList();

    fireEvent.click(
      within(rows()[0] as HTMLElement).getByRole('button', { name: 'projectDelete' })
    );
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('projectDeleteConfirm')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'projectCancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(persistSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(addToast).not.toHaveBeenCalled();
    expect(rows()).toHaveLength(seedProjects.length);
  });

  it('persists the collection WITHOUT the record BEFORE dispatching deleteProject', async () => {
    const target = seedProjects[0] as Project;
    const { onDeleted } = renderList();

    fireEvent.click(
      within(rows()[0] as HTMLElement).getByRole('button', { name: 'projectDelete' })
    );
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'projectDelete' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(deleteSpy).toHaveBeenCalledWith(target.id);
    // Hard order: persist must run before the store changes (§3).
    expect(persistSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      deleteSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );

    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    expect(persisted).toHaveLength(seedProjects.length - 1);
    expect(persisted.some((project) => project.id === target.id)).toBe(false);
    expect(addToast).toHaveBeenCalledWith({ message: 'projectDeleted', type: 'success' });
    expect(onDeleted).toHaveBeenCalledWith(target.id);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(rows()).toHaveLength(seedProjects.length - 1);
  });

  it('keeps the row and toasts projectSaveError when persist fails', async () => {
    const target = seedProjects[0] as Project;
    renderList();

    persistSpy.mockReturnValueOnce(false);
    fireEvent.click(
      within(rows()[0] as HTMLElement).getByRole('button', { name: 'projectDelete' })
    );
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'projectDelete' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'projectSaveError', type: 'error' })
    );
    expect(deleteSpy).not.toHaveBeenCalled();
    expect(rows()).toHaveLength(seedProjects.length);
    expect(screen.getByText(target.title)).toBeInTheDocument();
  });
});
