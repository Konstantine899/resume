// ============================================
// TechnologyForm tests (WU-5, plan_skills_crud §7)
// + skills-icon-upload rev.2 (WU-3)
// ============================================
//
// RED-first contract: create/edit inside a category, §7 validation
// mapped to i18n keys (duplicate name → skillsErrTechExists, icon →
// skillsErrIcon, filter → skillsErrFilter), persist BEFORE dispatch (§3),
// Toast feedback, exit-edit on success.
//
// rev.2: the icon Select is GONE — the value only ever comes from the
// FileUpload → save-to-directory flow (subdir `skills`), so every test
// that needs a valid create-mode icon drives the file input against a
// mocked imageDir service (path `/images/skills/<name>`). Edit mode
// allows '' (keep the stored record: key or path).

import type { SkillCategoryData } from '@/entities/Skill';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TechnologyForm } from './TechnologyForm';

const { persistSpy, addSpy, updateSpy, addToast, holder, dirMocks } = vi.hoisted(() => ({
  persistSpy: vi.fn((_data: unknown[]) => true),
  addSpy: vi.fn((payload: unknown) => ({ type: 'adminSkills/addTechnology', payload })),
  updateSpy: vi.fn((payload: unknown) => ({ type: 'adminSkills/updateTechnology', payload })),
  addToast: vi.fn(),
  holder: {
    state: {
      adminSkills: [
        {
          category: 'frontend',
          categoryName: 'Frontend',
          technologies: [{ name: 'React', iconSvg: 'react' }],
        },
      ] as SkillCategoryData[],
    },
  },
  dirMocks: {
    supported: vi.fn(() => true),
    save: vi.fn(
      async (params: { blob: Blob; name: string; subdir: string }) =>
        `/images/${params.subdir}/${params.name}`
    ),
  },
}));

vi.mock('../../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/services/storage')>()),
  persistSkills: persistSpy,
}));

vi.mock('../../model/slices/skillsSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/skillsSlice')>()),
  addTechnology: addSpy,
  updateTechnology: updateSpy,
}));

vi.mock('@/shared/lib/imageDir', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/imageDir')>()),
  isDirectoryPickerSupported: dirMocks.supported,
  saveUploadedImage: dirMocks.save,
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
// hop; REAL selectors run against whatever state the test installs.
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: typeof holder.state) => unknown) => selector(holder.state),
    useDispatch: () => (_action: unknown) => undefined,
  };
});

const nameInput = () => screen.getByLabelText('skillsTechnologyName');
const filterInput = () => screen.getByLabelText('skillsIconFilter');
const invertToggle = () => screen.getByLabelText('skillsInvertInDark');
const submitButton = () => screen.getByRole('button', { name: 'skillsSave' });
const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

/** Drive the raw-SVG FileUpload pipeline against the mocked imageDir. */
const uploadSvg = async (fileName = 'react-logo.svg') => {
  // Await a NEW save call — a plain toHaveBeenCalled() passes instantly on
  // the second upload (the first call is still recorded).
  const savesBefore = dirMocks.save.mock.calls.length;
  fireEvent.change(fileInput(), {
    target: { files: [new File(['<svg/>'], fileName, { type: 'image/svg+xml' })] },
  });
  await waitFor(() => expect(dirMocks.save.mock.calls.length).toBeGreaterThan(savesBefore));
};

describe('TechnologyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    holder.state.adminSkills = [
      {
        category: 'frontend',
        categoryName: 'Frontend',
        technologies: [{ name: 'React', iconSvg: 'react' }],
      },
    ];
    // URL.createObjectURL is missing in jsdom — patch the REAL URL class
    // (Object.create(URL) breaks `new URL()` inside zod v4 — ProjectForm gotcha).
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL = vi.fn(() => 'blob:preview');
        static revokeObjectURL = vi.fn();
      }
    );
    // imageDir defaults — some tests override per-case.
    dirMocks.supported.mockReturnValue(true);
    dirMocks.save.mockImplementation(
      async (params: { blob: Blob; name: string; subdir: string }) =>
        `/images/${params.subdir}/${params.name}`
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('create mode: Save starts disabled and enables when dirty', () => {
    render(<TechnologyForm categoryId="frontend" />);

    expect(submitButton()).toBeDisabled();
    fireEvent.change(nameInput(), { target: { value: 'Vue' } });
    expect(submitButton()).toBeEnabled();
  });

  it('create mode: Save without an icon file shows skillsErrIcon and persists nothing', async () => {
    render(<TechnologyForm categoryId="frontend" />);
    fireEvent.change(nameInput(), { target: { value: 'Vue' } });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('skillsErrIcon');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('create mode: shows skillsErrTechName for a short name', async () => {
    render(<TechnologyForm categoryId="frontend" />);
    await uploadSvg();
    fireEvent.change(nameInput(), { target: { value: 'V' } });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('skillsErrTechName');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('create mode: shows skillsErrTechExists for a duplicate inside the category', async () => {
    render(<TechnologyForm categoryId="frontend" />);
    await uploadSvg();
    fireEvent.change(nameInput(), { target: { value: 'React' } });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('skillsErrTechExists');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('create mode: shows skillsErrFilter for a filter without brightness(/invert(', async () => {
    render(<TechnologyForm categoryId="frontend" />);
    await uploadSvg();
    fireEvent.change(nameInput(), { target: { value: 'Vue' } });
    fireEvent.change(filterInput(), { target: { value: 'blur(2px)' } });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('skillsErrFilter');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('create mode: an uploaded SVG lands as the /images/skills path — persist BEFORE dispatch', async () => {
    const calls: string[] = [];
    persistSpy.mockImplementation(() => {
      calls.push('persist');
      return true;
    });
    addSpy.mockImplementation((payload: unknown) => {
      calls.push('dispatch');
      return { type: 'adminSkills/addTechnology', payload };
    });

    render(<TechnologyForm categoryId="frontend" />);
    fireEvent.change(nameInput(), { target: { value: 'Vue' } });
    await uploadSvg('vue-logo.svg');
    fireEvent.click(invertToggle());

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'skillsSaved' }))
    );
    expect(calls).toEqual(['persist', 'dispatch']);
    expect(addSpy).toHaveBeenCalledWith({
      categoryId: 'frontend',
      technology: expect.objectContaining({
        name: 'Vue',
        iconSvg: '/images/skills/vue-logo.svg',
        invertInDark: true,
      }),
    });
    // The subdir is always `skills` — the plan contract.
    expect(dirMocks.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'vue-logo.svg', subdir: 'skills' })
    );
  });

  it('create mode: persist failure shows skillsPersistError and skips dispatch', async () => {
    persistSpy.mockReturnValue(false);

    render(<TechnologyForm categoryId="frontend" />);
    await uploadSvg();
    fireEvent.change(nameInput(), { target: { value: 'Vue' } });
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'skillsPersistError', type: 'error' })
      )
    );
    expect(addSpy).not.toHaveBeenCalled();
    expect(nameInput()).toHaveValue('Vue');
  });

  it('edit mode: pre-fills the record and dispatches an update keyed by the ORIGINAL name', async () => {
    const onExitEdit = vi.fn();
    render(
      <TechnologyForm
        categoryId="frontend"
        technology={{ name: 'React', iconSvg: 'react' }}
        onExitEdit={onExitEdit}
      />
    );

    expect(nameInput()).toHaveValue('React');
    expect(submitButton()).toBeDisabled();

    fireEvent.change(nameInput(), { target: { value: 'React 19' } });
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(updateSpy).toHaveBeenCalledWith({
        categoryId: 'frontend',
        techName: 'React',
        patch: expect.objectContaining({ name: 'React 19' }),
      })
    );
    await waitFor(() => expect(onExitEdit).toHaveBeenCalled());
  });

  it('edit mode: Save without a new upload KEEPS the stored icon (legacy key)', async () => {
    render(
      <TechnologyForm
        categoryId="frontend"
        technology={{ name: 'React', iconSvg: 'react' }}
        onExitEdit={vi.fn()}
      />
    );

    fireEvent.change(nameInput(), { target: { value: 'React 19' } });
    fireEvent.click(submitButton());

    await waitFor(() => expect(updateSpy).toHaveBeenCalled());
    const patch = updateSpy.mock.calls[0]?.[0] as { patch: { iconSvg: string } };
    expect(patch.patch.iconSvg).toBe('react');
  });

  it('edit mode: an uploaded SVG replaces the stored icon with the new path', async () => {
    render(
      <TechnologyForm
        categoryId="frontend"
        technology={{ name: 'React', iconSvg: 'react' }}
        onExitEdit={vi.fn()}
      />
    );

    await uploadSvg('react-19.svg');
    fireEvent.change(nameInput(), { target: { value: 'React 19' } });
    fireEvent.click(submitButton());

    await waitFor(() => expect(updateSpy).toHaveBeenCalled());
    const patch = updateSpy.mock.calls[0]?.[0] as { patch: { iconSvg: string } };
    expect(patch.patch.iconSvg).toBe('/images/skills/react-19.svg');
  });

  it('edit mode: allows keeping the record’s own name (not a duplicate)', async () => {
    render(
      <TechnologyForm
        categoryId="frontend"
        technology={{ name: 'React', iconSvg: 'react' }}
        onExitEdit={vi.fn()}
      />
    );

    fireEvent.change(nameInput(), { target: { value: 'React ' } }); // trim → same key
    fireEvent.click(submitButton());

    await waitFor(() => expect(updateSpy).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows skillsIconUploadUnsupported when the File System Access API is missing', async () => {
    dirMocks.supported.mockReturnValue(false);

    render(<TechnologyForm categoryId="frontend" />);
    fireEvent.change(fileInput(), {
      target: { files: [new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' })] },
    });

    expect(await screen.findByText('skillsIconUploadUnsupported')).toBeInTheDocument();
    expect(dirMocks.save).not.toHaveBeenCalled();
  });

  it('shows skillsIconUploadSaveError when the directory write fails', async () => {
    dirMocks.save.mockRejectedValueOnce(new DOMException('quota', 'QuotaExceededError'));

    render(<TechnologyForm categoryId="frontend" />);
    fireEvent.change(fileInput(), {
      target: { files: [new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' })] },
    });

    expect(await screen.findByText('skillsIconUploadSaveError')).toBeInTheDocument();
  });

  it('swallows AbortError from the picker silently (user cancelled)', async () => {
    dirMocks.save.mockRejectedValueOnce(new DOMException('cancelled', 'AbortError'));

    render(<TechnologyForm categoryId="frontend" />);
    fireEvent.change(fileInput(), {
      target: { files: [new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' })] },
    });

    await waitFor(() => expect(dirMocks.save).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('skillsIconUploadSaveError')).not.toBeInTheDocument();
    expect(screen.queryByText('skillsIconUploadUnsupported')).not.toBeInTheDocument();
  });
});
