// ============================================
// ProjectForm tests (admin-mywork-refactor WU-6; rev.4 image flow)
// ============================================
//
// RED-first contract: render in both modes, §7 validation mapped to i18n
// keys (i18n-first — zod carries no messages), persist BEFORE dispatch
// (§3), Toast feedback. WU-6 (SPEC R-6): the form is DATA-ONLY —
// reset/delete and their confirms live in the vitrina (list rows +
// header); this file no longer covers them. Storage and action creators
// are spied at the module boundary; selectors run REAL against a
// seed-shaped state.
//
// rev.4 (owner directive 2026-10-10): there is NO URL input — the image
// value only ever comes from the FileUpload flow, so every test that needs
// a valid image drives the file input against the mocked BACKEND upload
// seam (`uploadImage` → `/images/projects/<name>` after the cutover).

import { PROJECT_CATEGORIES, type Project } from '@/entities/Project';
import { TECHNOLOGIES_SEED } from '@/entities/Technology';
import type { ImageUploadOutcome } from '@/shared/lib/imageUpload';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProjectsSeed } from '../../model/services/seed';
import { ProjectForm } from './ProjectForm';

const { persistSpy, addSpy, updateSpy, addToast, uploadMocks } = vi.hoisted(() => ({
  persistSpy: vi.fn((_projects: unknown[]) => true),
  addSpy: vi.fn((project: unknown) => ({ type: 'myWork/addProject', payload: project })),
  updateSpy: vi.fn((payload: unknown) => ({ type: 'myWork/updateProject', payload })),
  addToast: vi.fn(),
  uploadMocks: {
    upload: vi.fn(async (params: { blob: Blob; name: string }): Promise<ImageUploadOutcome> => ({
      ok: true,
      file: { key: `/images/projects/${params.name}`, width: 1200, height: 900, variants: [] },
    })),
  },
}));

vi.mock('../../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/services/storage')>()),
  persistProjects: persistSpy,
}));

// The backend upload seam replaced the File-System-Access write.
vi.mock('@/shared/lib/imageUpload', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/imageUpload')>()),
  uploadImage: uploadMocks.upload,
}));

vi.mock('../../model/slices/myWorkSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/myWorkSlice')>()),
  addProject: addSpy,
  updateProject: updateSpy,
}));

// Deterministic labels: t(key) => key — assertions target raw i18n keys.
// Interpolation is rendered as `key:value` so the delete-confirm subtitle
// can prove it NAMES the project (adminJobConfirmDeleteName pattern).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string, options?: { name?: string }) =>
      options?.name !== undefined ? `${key}:${options.name}` : key,
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
  const { createProjectsSeed: seed } = await import('../../model/services/seed');
  const state = { myWork: seed() };
  return {
    ...actual,
    useSelector: (selector: (s: typeof state) => unknown) => selector(state),
    useDispatch: () => (_action: unknown) => undefined,
  };
});

const seedProjects = createProjectsSeed();

/** jsdom never decodes images or rasterises canvas — minimal stand-ins. */
class FakeUploadImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 100;
  naturalHeight = 100;
  set src(_value: string) {
    setTimeout(() => this.onload?.(), 0);
  }
}

const renderCreate = () => render(<ProjectForm />);
const renderEdit = (project: Project, onExitEdit = vi.fn()) => ({
  onExitEdit,
  ...render(<ProjectForm project={project} onExitEdit={onExitEdit} />),
});

const titleInput = () => screen.getByLabelText('projectFieldTitle');
const saveButton = () => screen.getByRole('button', { name: 'projectSave' });
const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

/** Drive the FileUpload pipeline against the mocked backend upload. */
const uploadImageFile = async (fileName = 'photo.png') => {
  // Await a NEW upload call — a plain toHaveBeenCalled() passes instantly on
  // the second upload (the first call is still recorded).
  const uploadsBefore = uploadMocks.upload.mock.calls.length;
  fireEvent.change(fileInput(), {
    target: { files: [new File(['x'], fileName, { type: 'image/png' })] },
  });
  await waitFor(() => expect(uploadMocks.upload.mock.calls.length).toBeGreaterThan(uploadsBefore));
};

/** Fill the minimal valid create-mode payload around the required title/image. */
const fillMinimalValid = async () => {
  fireEvent.change(titleInput(), { target: { value: 'Test Project' } });
  await uploadImageFile();
  fireEvent.change(screen.getByLabelText('projectFieldDescription · EN'), {
    target: { value: 'English description' },
  });
  fireEvent.change(screen.getByLabelText('projectFieldDescription · RU'), {
    target: { value: 'Описание' },
  });
  // techIcons: pick the first toggle (create mode starts empty).
  fireEvent.click(
    screen.getAllByRole('button', { name: TECHNOLOGIES_SEED[0]?.key })[0] as HTMLElement
  );
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  persistSpy.mockReturnValue(true);
  // FileUpload pipeline stubs (jsdom has neither decoding nor canvas).
  vi.stubGlobal('Image', FakeUploadImage);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: vi.fn(),
  } as unknown as ReturnType<HTMLCanvasElement['getContext']>);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
    callback: BlobCallback,
    type?: string
  ) {
    callback(
      new Blob(['compressed'], { type: type === 'image/webp' ? 'image/webp' : 'image/jpeg' })
    );
  });
  // URL.createObjectURL is missing in jsdom — patch the REAL URL class.
  // NEVER replace the class (Object.create(URL) breaks `new URL()` inside
  // zod v4's url() check → edit-mode link validation throws TypeError and
  // handleSubmit never reaches the callback).
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = vi.fn(() => 'blob:preview');
      static revokeObjectURL = vi.fn();
    }
  );
});

afterEach(() => {
  vi.clearAllMocks();
  // Restore spies and globals so they never leak into the next test.
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ProjectForm: render (WU-4)', () => {
  it('create mode: §7 fields, enum selects, tech toggles, Save disabled until dirty', () => {
    renderCreate();

    expect(titleInput()).toHaveValue('');
    expect(document.querySelectorAll('textarea')).toHaveLength(4); // desc×2, role×2 (metrics = bullet rows)
    // imageSubdir + category + status are kit Selects.
    const selects = document.querySelectorAll('select');
    expect(selects).toHaveLength(3);
    expect([...(selects[1] as HTMLSelectElement).options].map((option) => option.value)).toEqual(
      PROJECT_CATEGORIES
    );

    // One toggle per catalog key — the seed mirrors the live store (D4 fallback).
    const toggles = screen.getByRole('group', { name: 'projectFieldTech' });
    expect(toggles.querySelectorAll('button')).toHaveLength(TECHNOLOGIES_SEED.length);

    // rev.4: the image control is the file picker — no URL input exists.
    expect(fileInput()).toBeInTheDocument();
    expect(screen.queryByLabelText('projectFieldImage')).not.toBeInTheDocument();

    // §9 idle: Save disabled until dirty. WU-6 (R-6): the form is
    // data-only — no Reset/Delete/Cancel in create mode.
    expect(saveButton()).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'projectReset' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'projectDelete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'projectCancel' })).not.toBeInTheDocument();
  });

  it('edit mode: fields prefilled from the project, image path shown read-only, Cancel appears', () => {
    const project = seedProjects[0] as Project;
    renderEdit(project);

    expect(titleInput()).toHaveValue(project.title);
    // rev.4: the stored path renders as the current-value row, not an input.
    expect(screen.getByText(project.image)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'projectCancel' })).toBeInTheDocument();
    // WU-6 (R-6): delete moved to the list rows — the form keeps Save/Cancel only.
    expect(screen.queryByRole('button', { name: 'projectDelete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'projectReset' })).not.toBeInTheDocument();
    // Pristine edit form → Save disabled (nothing changed yet).
    expect(saveButton()).toBeDisabled();
  });
});

describe('ProjectForm: validation (§7, i18n-first)', () => {
  it('blocks a 1-char title and maps the error to projectTitleRequired (rev.4 keeps min 2 for NON-empty)', async () => {
    renderCreate();

    // Make the form dirty FIRST (Save is disabled until dirty, §9), then
    // break ONLY the title — exactly one alert so findByRole stays single.
    await fillMinimalValid();
    fireEvent.change(titleInput(), { target: { value: 'x' } });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('projectTitleRequired');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('accepts an empty title as a valid create (rev.4 — "" is the CLEAR value)', async () => {
    renderCreate();

    await fillMinimalValid();
    fireEvent.change(titleInput(), { target: { value: '' } });
    fireEvent.click(saveButton());

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    const record = persisted[persisted.length - 1] as Project;
    expect(record.title).toBe('');
    expect(addToast).toHaveBeenCalledWith({ message: 'projectSaved', type: 'success' });
  });

  it('accepts a create with NO image (rev.4 — "" is in the union)', async () => {
    renderCreate();

    // Everything valid EXCEPT the image — since rev.4 that is a legal record.
    fireEvent.change(titleInput(), { target: { value: 'Test Project' } });
    fireEvent.change(screen.getByLabelText('projectFieldDescription · EN'), {
      target: { value: 'English description' },
    });
    fireEvent.change(screen.getByLabelText('projectFieldDescription · RU'), {
      target: { value: 'Описание' },
    });
    fireEvent.click(
      screen.getAllByRole('button', { name: TECHNOLOGIES_SEED[0]?.key })[0] as HTMLElement
    );
    fireEvent.click(saveButton());

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    const record = persisted[persisted.length - 1] as Project;
    expect(record.image).toBe('');
    expect(addToast).toHaveBeenCalledWith({ message: 'projectSaved', type: 'success' });
  });

  it('accepts a create while techIcons is empty (rev.4 — [] is valid)', async () => {
    renderCreate();

    fireEvent.change(titleInput(), { target: { value: 'No tech yet' } });
    await uploadImageFile();
    fireEvent.change(screen.getByLabelText('projectFieldDescription · EN'), {
      target: { value: 'English' },
    });
    fireEvent.change(screen.getByLabelText('projectFieldDescription · RU'), {
      target: { value: 'Описание' },
    });
    fireEvent.click(saveButton());

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    const record = persisted[persisted.length - 1] as Project;
    expect(record.techIcons).toEqual([]);
  });

  it('rejects a category outside the enum (projectEnumInvalid)', async () => {
    renderCreate();

    await fillMinimalValid();
    // selects[0] = imageSubdir, [1] = category, [2] = status.
    const selects = document.querySelectorAll('select');
    fireEvent.change(selects[1] as HTMLSelectElement, {
      target: { value: 'definitely-not-a-category' },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('projectEnumInvalid');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('requires both role locales when one is set (projectRoleLocaleRequired)', async () => {
    renderCreate();

    await fillMinimalValid();
    fireEvent.change(screen.getByLabelText('projectFieldRole · EN'), {
      target: { value: 'Frontend Developer' },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('projectRoleLocaleRequired');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('rejects an out-of-range year (projectYearInvalid)', async () => {
    renderCreate();

    await fillMinimalValid();
    fireEvent.change(screen.getByLabelText('projectFieldYear'), {
      target: { value: '1999' },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('projectYearInvalid');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('rejects a metric line over 40 chars (projectMetricInvalid)', async () => {
    renderCreate();

    await fillMinimalValid();
    // Metrics is a bullet-row list now (mywork-metrics-bullet-rows) —
    // row 1 of the editor; programmatic change bypasses the DOM maxLength.
    fireEvent.change(screen.getByLabelText('projectFieldMetrics-1'), {
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

    await fillMinimalValid();
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
    expect(record).toMatchObject({
      title: 'Test Project',
      year: 2025,
      featured: false,
      image: '/images/projects/photo.webp',
    });
    expect(record.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(addSpy.mock.calls[0]?.[0]).toBe(record);
    expect(addToast).toHaveBeenCalledWith({ message: 'projectSaved', type: 'success' });

    // Create mode returns to a blank pristine form (§9 saved → idle).
    await waitFor(() => expect(saveButton()).toBeDisabled());
    expect(titleInput()).toHaveValue('');
  });

  it('persists the uploaded /images/projects path verbatim (rev.4 replaces the WU-3 typed-path test)', async () => {
    uploadMocks.upload.mockResolvedValueOnce({
      ok: true,
      file: { key: '/images/projects/dragonfly.webp', width: 1200, height: 900, variants: [] },
    });
    renderCreate();

    await fillMinimalValid();
    fireEvent.change(screen.getByLabelText('projectFieldYear'), {
      target: { value: '2025' },
    });
    fireEvent.click(saveButton());

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    const record = persisted[persisted.length - 1] as Project;
    expect(record.image).toBe('/images/projects/dragonfly.webp');
    expect(addSpy).toHaveBeenCalledTimes(1);
    expect(addToast).toHaveBeenCalledWith({ message: 'projectSaved', type: 'success' });
  });

  it('keeps the form filled, skips dispatch and toasts projectSaveError when persist fails', async () => {
    renderCreate();

    persistSpy.mockReturnValueOnce(false);
    await fillMinimalValid();
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

// ============================================
// FileUpload → save-to-directory (plan_project_images rev.4)
// ============================================

describe('ProjectForm: FileUpload → save-to-directory (rev.4)', () => {
  it('writes the file into the project directory, stores the path and revalidates (OPEN-7)', async () => {
    renderCreate();
    // rev.4: no Save-first alert dance — '' is a valid image now, so we
    // fill everything, upload, and assert the PATH reaches the record.
    fireEvent.change(titleInput(), { target: { value: 'Test Project' } });
    fireEvent.change(screen.getByLabelText('projectFieldDescription · EN'), {
      target: { value: 'English description' },
    });
    fireEvent.change(screen.getByLabelText('projectFieldDescription · RU'), {
      target: { value: 'Описание' },
    });
    fireEvent.click(
      screen.getAllByRole('button', { name: TECHNOLOGIES_SEED[0]?.key })[0] as HTMLElement
    );

    await uploadImageFile();

    // OPEN-7: setValue(..., { shouldDirty: true, shouldValidate: true })
    // runs zod — the returned path passes the union.
    expect(await screen.findByText('/images/projects/photo.webp')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // SPEC criterion: the uploaded PATH reaches the persisted record.
    fireEvent.click(saveButton());
    await waitFor(() => expect(addSpy).toHaveBeenCalled());
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({ image: '/images/projects/photo.webp' })
    );
    expect(persistSpy).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ image: '/images/projects/photo.webp' })])
    );
  });

  it('passes blob and name to the backend upload (second upload included)', async () => {
    renderCreate();

    await uploadImageFile('first.png');
    expect(uploadMocks.upload).toHaveBeenCalledTimes(1);

    await uploadImageFile('second.png');

    // The root pick/remember logic is gone — the form only owns the
    // (blob, name) contract of the backend upload.
    expect(uploadMocks.upload).toHaveBeenCalledTimes(2);
    expect(uploadMocks.upload).toHaveBeenLastCalledWith({
      blob: expect.any(Blob),
      name: 'second.webp',
    });
  });

  it('shows projectFileUploadSaveError when the backend upload fails', async () => {
    uploadMocks.upload.mockResolvedValueOnce({ ok: false, reason: 'write-failed' });
    renderCreate();

    fireEvent.change(fileInput(), {
      target: { files: [new File(['x'], 'photo.png', { type: 'image/png' })] },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent('projectFileUploadSaveError');
    expect(screen.queryByText(/^\/images\/projects\//)).not.toBeInTheDocument();
  });
});

// ============================================
// metrics bullet rows (mywork-metrics-bullet-rows, SPEC R-1/R-2)
// ============================================
//
// The Textarea is replaced by the JobForm bullet-row editor: one input row
// per metric, IconButtons ↑/↓/X, an Add button. RED-first — these pin the
// new editor contract before the component changes.

describe('ProjectForm: metrics bullet rows (mywork-metrics-bullet-rows)', () => {
  const metricBlock = () => screen.getByTestId('project-metrics');
  const metricRows = () => within(metricBlock()).getAllByRole('textbox');
  const metricButtons = (name: string) => within(metricBlock()).getAllByRole('button', { name });

  it('edit mode renders one input row per metric from defaultValues (R-1)', () => {
    const project: Project = {
      ...(seedProjects[0] as Project),
      metrics: ['1M+ users', '99.9% uptime'],
    };
    renderEdit(project);

    const rows = metricRows();
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveValue('1M+ users');
    expect(rows[1]).toHaveValue('99.9% uptime');
    // Row labels follow the JobForm `blockLabel-<N>` pattern.
    expect(rows[0]).toHaveAttribute('aria-label', 'projectFieldMetrics-1');
  });

  it('create mode starts with exactly ONE empty metric row (R-1)', () => {
    renderCreate();

    const rows = metricRows();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveValue('');
  });

  it('Add metric appends an empty row (R-2)', () => {
    renderCreate();

    fireEvent.click(screen.getByRole('button', { name: 'projectMetricAdd' }));

    const rows = metricRows();
    expect(rows).toHaveLength(2);
    expect(rows[1]).toHaveValue('');
  });

  it('remove deletes its row and the action matrix collapses at one row (R-1/R-2)', () => {
    const project: Project = { ...(seedProjects[0] as Project), metrics: ['Alpha', 'Beta'] };
    renderEdit(project);

    const removes = metricButtons('projectMetricRemove');
    expect(removes).toHaveLength(2);
    fireEvent.click(removes[0] as HTMLElement);

    const after = metricRows();
    expect(after).toHaveLength(1);
    expect(after[0]).toHaveValue('Beta');
    // JobForm disabled matrix: ↑ first, ↓ last, × length<=1.
    expect(metricButtons('projectMetricUp')[0]).toBeDisabled();
    expect(metricButtons('projectMetricDown')[0]).toBeDisabled();
    expect(metricButtons('projectMetricRemove')[0]).toBeDisabled();
  });

  it('move down/up reorders the rows via the IconButtons (R-2)', () => {
    const project: Project = { ...(seedProjects[0] as Project), metrics: ['First', 'Second'] };
    renderEdit(project);

    fireEvent.click(metricButtons('projectMetricDown')[0] as HTMLElement);
    let rows = metricRows();
    expect(rows[0]).toHaveValue('Second');
    expect(rows[1]).toHaveValue('First');

    fireEvent.click(metricButtons('projectMetricUp')[1] as HTMLElement);
    rows = metricRows();
    expect(rows[0]).toHaveValue('First');
    expect(rows[1]).toHaveValue('Second');
  });

  it('round-trip: rows reach the record and blank rows are dropped (R-3/R-4)', async () => {
    renderCreate();

    await fillMinimalValid();
    fireEvent.change(metricRows()[0] as HTMLElement, { target: { value: 'One metric' } });
    fireEvent.click(screen.getByRole('button', { name: 'projectMetricAdd' }));
    fireEvent.change(metricRows()[1] as HTMLElement, { target: { value: 'Two metric' } });
    fireEvent.click(screen.getByRole('button', { name: 'projectMetricAdd' })); // trailing blank
    fireEvent.click(saveButton());

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    const record = persisted[persisted.length - 1] as Project;
    expect(record.metrics).toEqual(['One metric', 'Two metric']);
  });
});
