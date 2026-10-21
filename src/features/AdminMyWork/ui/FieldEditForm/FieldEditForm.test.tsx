// ============================================
// FieldEditForm tests (mywork-field-actions WU-5 — SPEC R-B2/R-B6)
// ============================================
//
// RED-first contract: one field at a time (no foreign inputs leak in),
// per-field zod from the SHARED lib slices (schemaFor), Save disabled
// while pristine, persist BEFORE dispatch of a ONE-field partial (§3),
// persist failure keeps the form open with an error toast, year '' →
// undefined, metric-N splices the indexed entry.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '@/entities/Project';
import { FieldEditForm } from './FieldEditForm';

const { persistSpy, updateProjectSpy, addToast, holder, dirMocks } = vi.hoisted(() => ({
  persistSpy: vi.fn((_projects: unknown[]) => true),
  updateProjectSpy: vi.fn((payload: unknown) => ({ type: 'myWork/updateProject', payload })),
  addToast: vi.fn(),
  holder: { projects: [] as Project[] },
  dirMocks: {
    supported: vi.fn(() => true),
    save: vi.fn(
      async (params: { blob: Blob; name: string; subdir: string }) =>
        `/images/${params.subdir}/${params.name}`
    ),
  },
}));

vi.mock('../../model/services/storage', () => ({
  persistProjects: persistSpy,
}));

// Issue #273: the image field now routes through the shared save-to-directory
// flow (ProjectForm parity) — mock the imageDir service at the module boundary.
vi.mock('@/shared/lib/imageDir', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/imageDir')>()),
  isDirectoryPickerSupported: dirMocks.supported,
  saveUploadedImage: dirMocks.save,
}));

vi.mock('../../model/slices/myWorkSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/myWorkSlice')>()),
  updateProject: updateProjectSpy,
}));

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
    isTransitioning: false,
  }),
}));

vi.mock('@/shared/lib/contexts/ToastContext', () => ({
  useToast: () => ({ addToast, removeToast: vi.fn() }),
}));

vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: { myWork: Project[] }) => unknown) =>
      selector({ myWork: holder.projects }),
    useDispatch: () => (action: unknown) => action,
  };
});

const PROJECT: Project = {
  id: 'p1',
  title: 'Shop',
  description: { en: 'An ecommerce platform', ru: 'Интернет-магазин' },
  techIcons: ['react', 'nextjs'],
  link: 'https://shop.example',
  image: '/images/projects/shop.png',
  category: 'ecommerce',
  status: 'completed',
  featured: true,
  role: { en: 'Lead', ru: 'Тимлид' },
  metrics: ['1M+ users', 'p95 120ms'],
  year: 2024,
};

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

describe('FieldEditForm (mywork)', () => {
  beforeEach(() => {
    holder.projects = [PROJECT];
    persistSpy.mockClear();
    persistSpy.mockImplementation(() => true);
    updateProjectSpy.mockClear();
    addToast.mockClear();
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
    // zod v4's url() check).
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL = vi.fn(() => 'blob:preview');
        static revokeObjectURL = vi.fn();
      }
    );
    // imageDir defaults — some tests override per-case.
    dirMocks.supported.mockReturnValue(true);
    dirMocks.save.mockReset();
    dirMocks.save.mockImplementation(
      async (params: { blob: Blob; name: string; subdir: string }) =>
        `/images/${params.subdir}/${params.name}`
    );
  });

  afterEach(() => {
    // Restore the canvas spies and unstub globals so they never leak into
    // the next test (standalone vi.fn mocks like persistSpy are unaffected).
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const renderForm = (
    field: Parameters<typeof FieldEditForm>[0]['field'],
    props: Partial<React.ComponentProps<typeof FieldEditForm>> = {}
  ) => {
    const onExitEdit = vi.fn();
    render(<FieldEditForm project={PROJECT} field={field} onExitEdit={onExitEdit} {...props} />);
    return { onExitEdit };
  };

  const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

  /** Drive the FileUpload pipeline against the mocked canvas + imageDir. */
  const uploadImageFile = async (fileName = 'photo.png') => {
    // Await a NEW save call — a plain toHaveBeenCalled() passes instantly on
    // the second upload (the first call is still recorded).
    const savesBefore = dirMocks.save.mock.calls.length;
    fireEvent.change(fileInput(), {
      target: { files: [new File(['x'], fileName, { type: 'image/png' })] },
    });
    await waitFor(() => expect(dirMocks.save.mock.calls.length).toBeGreaterThan(savesBefore));
  };

  it('renders ONLY the active field inputs', () => {
    renderForm('title');
    expect(screen.getByLabelText('projectFieldTitle')).toBeInTheDocument();
    expect(screen.queryByLabelText('projectFieldLink')).toBeNull();
    expect(screen.queryByLabelText('projectFieldYear')).toBeNull();
  });

  it('keeps Save disabled while pristine', () => {
    renderForm('title');
    expect(screen.getByRole('button', { name: 'projectSave' })).toBeDisabled();
  });

  it('saves a one-field partial: persist FIRST, then dispatch, then exit', async () => {
    const { onExitEdit } = renderForm('title');
    fireEvent.change(screen.getByLabelText('projectFieldTitle'), {
      target: { value: 'Shop v2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'projectSave' }));

    await waitFor(() => expect(onExitEdit).toHaveBeenCalledTimes(1));
    expect(persistSpy).toHaveBeenCalledTimes(1);
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    expect(persisted[0]?.title).toBe('Shop v2');
    expect(persisted[0]?.year).toBe(2024); // untouched siblings stay
    expect(updateProjectSpy).toHaveBeenCalledTimes(1);
    const payload = updateProjectSpy.mock.calls[0]?.[0] as {
      id: string;
      patch: { title: string; updatedAt: string };
    };
    expect(payload.id).toBe('p1');
    expect(payload.patch.title).toBe('Shop v2');
    expect(typeof payload.patch.updatedAt).toBe('string');
    expect(addToast).toHaveBeenCalledWith({ message: 'projectSaved', type: 'success' });
  });

  it('persist failure keeps the form open with projectSaveError and no exit', async () => {
    persistSpy.mockImplementation(() => false);
    const { onExitEdit } = renderForm('title');
    fireEvent.change(screen.getByLabelText('projectFieldTitle'), {
      target: { value: 'Nope' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'projectSave' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'projectSaveError', type: 'error' })
    );
    expect(updateProjectSpy).not.toHaveBeenCalled();
    expect(onExitEdit).not.toHaveBeenCalled();
  });

  it('maps invalid title to the projectTitleRequired alert', async () => {
    renderForm('title');
    fireEvent.change(screen.getByLabelText('projectFieldTitle'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'projectSave' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('projectTitleRequired');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it("year '' saves as year: undefined", async () => {
    renderForm('year');
    fireEvent.change(screen.getByLabelText('projectFieldYear'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'projectSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    expect(persisted[0]?.year).toBeUndefined();
  });

  it('metric-N splices the indexed entry into the metrics array', async () => {
    renderForm('metric-1');
    fireEvent.change(screen.getByLabelText('projectFieldMetrics'), {
      target: { value: 'p95 90ms' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'projectSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    expect(persisted[0]?.metrics).toEqual(['1M+ users', 'p95 90ms']);
  });

  it('category Select persists the picked enum value', async () => {
    renderForm('category');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'portfolio' } });
    fireEvent.click(screen.getByRole('button', { name: 'projectSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    expect(persisted[0]?.category).toBe('portfolio');
  });

  // ============================================
  // Image field via FileUpload (issue #273) — ProjectForm parity
  // ============================================

  describe('image field via FileUpload (issue #273)', () => {
    it('renders FileUpload for the image field — no text input remains', () => {
      renderForm('image');
      expect(fileInput()).toBeInTheDocument();
      // The old kit text Input (label + placeholder) is GONE.
      expect(screen.queryByLabelText('projectFieldImage')).not.toBeInTheDocument();
    });

    it('picking a file writes /images/projects/<name>, enables Save, and persists it', async () => {
      const { onExitEdit } = renderForm('image');
      expect(screen.getByRole('button', { name: 'projectSave' })).toBeDisabled();

      await uploadImageFile('photo.png');

      // saveUploadedImage called with subdir 'projects'; the value becomes the path.
      expect(dirMocks.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'photo.webp', subdir: 'projects' })
      );
      // The current-image path row now shows the stored path.
      expect(await screen.findByText('/images/projects/photo.webp')).toBeInTheDocument();

      // Save is now enabled (form dirty) and persists the one-field partial.
      expect(screen.getByRole('button', { name: 'projectSave' })).toBeEnabled();
      fireEvent.click(screen.getByRole('button', { name: 'projectSave' }));

      await waitFor(() => expect(onExitEdit).toHaveBeenCalledTimes(1));
      const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
      expect(persisted[0]?.image).toBe('/images/projects/photo.webp');
      expect(updateProjectSpy).toHaveBeenCalledTimes(1);
      const payload = updateProjectSpy.mock.calls[0]?.[0] as {
        id: string;
        patch: { image: string };
      };
      expect(payload.id).toBe('p1');
      expect(payload.patch.image).toBe('/images/projects/photo.webp');
      expect(addToast).toHaveBeenCalledWith({ message: 'projectSaved', type: 'success' });
    });

    it('shows projectFileUploadUnsupported when the File System Access API is missing (modal stays open)', async () => {
      dirMocks.supported.mockReturnValue(false);
      const { onExitEdit } = renderForm('image');

      fireEvent.change(fileInput(), {
        target: { files: [new File(['x'], 'photo.png', { type: 'image/png' })] },
      });

      expect(await screen.findByRole('alert')).toHaveTextContent('projectFileUploadUnsupported');
      expect(dirMocks.save).not.toHaveBeenCalled();
      // Save stays disabled (pristine) and the modal did not exit.
      expect(screen.getByRole('button', { name: 'projectSave' })).toBeDisabled();
      expect(onExitEdit).not.toHaveBeenCalled();
    });

    it('shows projectFileUploadSaveError when the directory write fails (modal stays open)', async () => {
      dirMocks.save.mockRejectedValueOnce(new DOMException('quota', 'QuotaExceededError'));
      const { onExitEdit } = renderForm('image');

      fireEvent.change(fileInput(), {
        target: { files: [new File(['x'], 'photo.png', { type: 'image/png' })] },
      });

      expect(await screen.findByRole('alert')).toHaveTextContent('projectFileUploadSaveError');
      // The value never changed to the new upload (the record's original
      // /images/projects/shop.png preview may still show — that's fine).
      expect(screen.queryByText('/images/projects/photo.webp')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'projectSave' })).toBeDisabled();
      expect(onExitEdit).not.toHaveBeenCalled();
    });

    it('stays silent when the user cancels the picker (AbortError)', async () => {
      dirMocks.save.mockRejectedValueOnce(new DOMException('cancelled', 'AbortError'));
      renderForm('image');

      fireEvent.change(fileInput(), {
        target: { files: [new File(['x'], 'photo.png', { type: 'image/png' })] },
      });

      await waitFor(() => expect(dirMocks.save).toHaveBeenCalledTimes(1));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'projectSave' })).toBeDisabled();
    });
  });
});
