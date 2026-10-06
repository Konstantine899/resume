// ============================================
// ProjectForm tests (plan_projects_crud §10 WU-4, §7)
// ============================================
//
// RED-first contract: render in both modes, §7 validation mapped to i18n
// keys (i18n-first — zod carries no messages), persist BEFORE dispatch
// (§3), Toast feedback, and the Modal confirms for Reset/Delete (§6 —
// Modal, not window.confirm). Storage and action creators are spied at
// the module boundary; selectors run REAL against a seed-shaped state.

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PROJECT_CATEGORIES, TECH_ICONS, type Project } from '@/entities/Project';
import { createProjectsSeed } from '../model/seed';
import { ProjectForm } from './ProjectForm';

const { persistSpy, removeSpy, addSpy, updateSpy, deleteSpy, resetSpy, addToast } = vi.hoisted(
  () => ({
    persistSpy: vi.fn((_projects: unknown[]) => true),
    removeSpy: vi.fn(),
    addSpy: vi.fn((project: unknown) => ({ type: 'myWork/addProject', payload: project })),
    updateSpy: vi.fn((payload: unknown) => ({ type: 'myWork/updateProject', payload })),
    deleteSpy: vi.fn((id: string) => ({ type: 'myWork/deleteProject', payload: id })),
    resetSpy: vi.fn(() => ({ type: 'myWork/resetToDefaults' })),
    addToast: vi.fn(),
  })
);

vi.mock('../model/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/storage')>()),
  persistProjects: persistSpy,
  removeProjects: removeSpy,
}));

vi.mock('../model/myWorkSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/myWorkSlice')>()),
  addProject: addSpy,
  updateProject: updateSpy,
  deleteProject: deleteSpy,
  resetToDefaults: resetSpy,
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

// react-redux mocked instead of StoreProvider: `features → app` is a banned
// FSD hop; the REAL selectors run against a seed-shaped state (About pattern).
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  const { createProjectsSeed: seed } = await import('../model/seed');
  const state = { myWork: seed() };
  return {
    ...actual,
    useSelector: (selector: (s: typeof state) => unknown) => selector(state),
    useDispatch: () => (_action: unknown) => undefined,
  };
});

const seedProjects = createProjectsSeed();

const renderCreate = () => render(<ProjectForm />);
const renderEdit = (project: Project, onExitEdit = vi.fn()) => ({
  onExitEdit,
  ...render(<ProjectForm project={project} onExitEdit={onExitEdit} />),
});

const titleInput = () => screen.getByLabelText('projectFieldTitle');
const imageInput = () => screen.getByLabelText('projectFieldImage');
const saveButton = () => screen.getByRole('button', { name: 'projectSave' });

/** Fill the minimal valid create-mode payload around the required title/image. */
const fillMinimalValid = () => {
  fireEvent.change(titleInput(), { target: { value: 'Test Project' } });
  fireEvent.change(imageInput(), { target: { value: 'https://example.com/p.png' } });
  fireEvent.change(screen.getByLabelText('projectFieldDescription · EN'), {
    target: { value: 'English description' },
  });
  fireEvent.change(screen.getByLabelText('projectFieldDescription · RU'), {
    target: { value: 'Описание' },
  });
  // techIcons: pick the first toggle (create mode starts empty).
  fireEvent.click(
    screen.getAllByRole('button', { name: Object.keys(TECH_ICONS)[0] })[0] as HTMLElement
  );
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  persistSpy.mockReturnValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ProjectForm: render (WU-4)', () => {
  it('create mode: §7 fields, enum selects, tech toggles, Save disabled until dirty', () => {
    renderCreate();

    expect(screen.getByRole('heading', { level: 2, name: 'adminMyWorkTitle' })).toBeInTheDocument();
    expect(screen.getByText('adminMyWorkHint')).toBeInTheDocument();

    expect(titleInput()).toHaveValue('');
    expect(document.querySelectorAll('textarea')).toHaveLength(5); // desc×2, role×2, metrics
    // category + status are NATIVE selects (Select is absent from the kit).
    const selects = document.querySelectorAll('select');
    expect(selects).toHaveLength(2);
    expect([...(selects[0] as HTMLSelectElement).options].map((option) => option.value)).toEqual(
      PROJECT_CATEGORIES
    );

    // One toggle per TECH_ICONS key — the dictionary IS the option list.
    const toggles = screen.getByRole('group', { name: 'projectFieldTech' });
    expect(toggles.querySelectorAll('button')).toHaveLength(Object.keys(TECH_ICONS).length);

    // §9 idle: Save disabled until dirty; Cancel/Delete are edit-only.
    expect(saveButton()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'projectReset' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'projectDelete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'projectCancel' })).not.toBeInTheDocument();
  });

  it('edit mode: fields prefilled from the project, Cancel + Delete appear', () => {
    const project = seedProjects[0] as Project;
    renderEdit(project);

    expect(titleInput()).toHaveValue(project.title);
    expect(imageInput()).toHaveValue(project.image);
    expect(screen.getByRole('button', { name: 'projectCancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'projectDelete' })).toBeInTheDocument();
    // Pristine edit form → Save disabled (nothing changed yet).
    expect(saveButton()).toBeDisabled();
  });
});

describe('ProjectForm: validation (§7, i18n-first)', () => {
  it('blocks an empty title and maps the error to projectTitleRequired', async () => {
    renderCreate();

    // Make the form dirty FIRST (Save is disabled until dirty, §9), then
    // break ONLY the title — exactly one alert so findByRole stays single.
    fillMinimalValid();
    fireEvent.change(titleInput(), { target: { value: '' } });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('projectTitleRequired');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('maps an invalid image URL to projectImageInvalid', async () => {
    renderCreate();

    fillMinimalValid();
    fireEvent.change(imageInput(), { target: { value: 'not-a-url' } });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('projectImageInvalid');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('blocks submit while techIcons is empty (projectTechRequired)', async () => {
    renderCreate();

    fireEvent.change(titleInput(), { target: { value: 'No tech yet' } });
    fireEvent.change(imageInput(), { target: { value: 'https://example.com/p.png' } });
    fireEvent.change(screen.getByLabelText('projectFieldDescription · EN'), {
      target: { value: 'English' },
    });
    fireEvent.change(screen.getByLabelText('projectFieldDescription · RU'), {
      target: { value: 'Описание' },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('projectTechRequired');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('rejects a category outside the enum (projectEnumInvalid)', async () => {
    renderCreate();

    fillMinimalValid();
    const selects = document.querySelectorAll('select');
    fireEvent.change(selects[0] as HTMLSelectElement, {
      target: { value: 'definitely-not-a-category' },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('projectEnumInvalid');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('requires both role locales when one is set (projectRoleLocaleRequired)', async () => {
    renderCreate();

    fillMinimalValid();
    fireEvent.change(screen.getByLabelText('projectFieldRole · EN'), {
      target: { value: 'Frontend Developer' },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('projectRoleLocaleRequired');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('rejects an out-of-range year (projectYearInvalid)', async () => {
    renderCreate();

    fillMinimalValid();
    fireEvent.change(screen.getByLabelText('projectFieldYear'), {
      target: { value: '1999' },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('projectYearInvalid');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('rejects a metric line over 40 chars (projectMetricInvalid)', async () => {
    renderCreate();

    fillMinimalValid();
    fireEvent.change(screen.getByLabelText('projectFieldMetrics'), {
      target: { value: 'x'.repeat(41) },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('projectMetricInvalid');
    expect(persistSpy).not.toHaveBeenCalled();
  });
});

describe('ProjectForm: create save (§3 persist → dispatch)', () => {
  it('persists the collection with the new record BEFORE dispatching addProject', async () => {
    renderCreate();

    fillMinimalValid();
    fireEvent.change(screen.getByLabelText('projectFieldYear'), {
      target: { value: '2025' },
    });
    fireEvent.click(saveButton());

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(addSpy).toHaveBeenCalledTimes(1);
    // Hard order: persist must run before the store changes (§3).
    expect(persistSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      addSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );

    // Persist got [...all, record]; the dispatched record is the SAME object.
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    const record = persisted[persisted.length - 1] as Project;
    expect(persisted).toHaveLength(seedProjects.length + 1);
    expect(record).toMatchObject({ title: 'Test Project', year: 2025, featured: false });
    expect(record.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(addSpy.mock.calls[0]?.[0]).toBe(record);
    expect(addToast).toHaveBeenCalledWith({ message: 'projectSaved', type: 'success' });

    // Create mode returns to a blank pristine form (§9 saved → idle).
    await waitFor(() => expect(saveButton()).toBeDisabled());
    expect(titleInput()).toHaveValue('');
  });

  it('keeps the form filled, skips dispatch and toasts projectSaveError when persist fails', async () => {
    renderCreate();

    persistSpy.mockReturnValueOnce(false);
    fillMinimalValid();
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'projectSaveError', type: 'error' })
    );
    expect(addSpy).not.toHaveBeenCalled();
    expect(titleInput()).toHaveValue('Test Project');
    expect(saveButton()).toBeEnabled();
  });
});

describe('ProjectForm: edit save (§3, byte-identical patch)', () => {
  it('persists the merged collection BEFORE dispatching updateProject with the same patch', async () => {
    const project = seedProjects[0] as Project;
    renderEdit(project);

    fireEvent.change(titleInput(), { target: { value: 'Renamed Title' } });
    fireEvent.click(saveButton());

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(persistSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      updateSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );

    const patch = updateSpy.mock.calls[0]?.[0] as { id: string; patch: { title: string } };
    expect(patch.id).toBe(project.id);
    expect(patch.patch.title).toBe('Renamed Title');

    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    const updated = persisted.find((item) => item.id === project.id) as Project;
    expect(updated.title).toBe('Renamed Title');
    expect(addToast).toHaveBeenCalledWith({ message: 'projectSaved', type: 'success' });

    // Pristine again after save → Save disabled.
    await waitFor(() => expect(saveButton()).toBeDisabled());
  });
});

describe('ProjectForm: reset (Modal confirm → remove → dispatch)', () => {
  it('does nothing when the reset confirm is declined', async () => {
    renderCreate();

    fireEvent.click(screen.getByRole('button', { name: 'projectReset' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'projectCancel' }));

    expect(removeSpy).not.toHaveBeenCalled();
    expect(resetSpy).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('removes storage, dispatches reset and blanks the form on confirm', async () => {
    renderCreate();

    fireEvent.change(titleInput(), { target: { value: 'Dirty Title' } });
    fireEvent.click(screen.getByRole('button', { name: 'projectReset' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('projectResetConfirm')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'projectReset' }));

    await waitFor(() => expect(removeSpy).toHaveBeenCalledTimes(1));
    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      resetSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );
    await waitFor(() => expect(titleInput()).toHaveValue(''));
    expect(saveButton()).toBeDisabled();
  });
});

describe('ProjectForm: delete (Modal confirm, edit mode)', () => {
  it('persists the collection without the record BEFORE dispatching deleteProject', async () => {
    const project = seedProjects[1] as Project;
    const { onExitEdit } = renderEdit(project);

    fireEvent.click(screen.getByRole('button', { name: 'projectDelete' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('projectDeleteConfirm')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'projectDelete' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(deleteSpy).toHaveBeenCalledWith(project.id);
    expect(persistSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      deleteSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    expect(persisted).toHaveLength(seedProjects.length - 1);
    expect(persisted.some((item) => item.id === project.id)).toBe(false);
    expect(addToast).toHaveBeenCalledWith({ message: 'projectDeleted', type: 'success' });
    expect(onExitEdit).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the delete confirm is declined', async () => {
    const project = seedProjects[1] as Project;
    renderEdit(project);

    fireEvent.click(screen.getByRole('button', { name: 'projectDelete' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'projectCancel' }));

    expect(persistSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
