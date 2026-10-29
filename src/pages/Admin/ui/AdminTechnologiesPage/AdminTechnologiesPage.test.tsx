// ============================================
// AdminTechnologiesPage — page-level modal criteria (technologies-crud WU-4)
// ============================================
//
// The PAGE owns the form modal (A7 Save closes, A8 Cancel/ESC close, A12
// one dialog at a time); TechnologiesList.test.tsx owns the confirm
// modal's internals (D6 guard, persist order). This file wires the REAL
// storeReducers — the technology slice hydrates the 14-entry seed on its
// first reducer call — and mocks only storage (persist control), i18n
// (identity) and toasts.
//
// D6 note: `usedKeys` is derived here from `selectAllProjects`, so the
// page suite also proves the wiring — deleting a key a project references
// is refused, deleting a free key succeeds.

import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderAdminPage } from '@/shared/tests';
import { AdminTechnologiesPage } from './AdminTechnologiesPage';

const { persistSpy, addToast, uploadMocks } = vi.hoisted(() => ({
  persistSpy: vi.fn((_data: unknown[]) => true),
  addToast: vi.fn(),
  // The backend upload seam replaced the File-System-Access write.
  uploadMocks: {
    upload: vi.fn(async (params: { blob: Blob; name: string }) => ({
      ok: true as const,
      file: { key: `/images/technologies/${params.name}`, width: 24, height: 24, variants: [] },
    })),
  },
}));

vi.mock('@/entities/Technology/model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/Technology/model/services/storage')>()),
  persistTechnologies: persistSpy,
}));

// tech-icon-upload A1: the form uploads icons through the backend seam —
// mocked here so page-level flows never touch the network or filesystem.
vi.mock('@/shared/lib/imageUpload', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/imageUpload')>()),
  uploadImage: uploadMocks.upload,
  uploadLegacyImage: uploadMocks.upload,
}));

// Identity t(): raw keys in assertions; known options render as
// `${key}:${values}` (confirm/subtitle copy proves it names the record).
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

const renderPage = () => renderAdminPage(<AdminTechnologiesPage />);

type Store = ReturnType<typeof renderPage>;
type TechState = ReturnType<Store['getState']>['technologies'];

const catalogOf = (store: Store): TechState => store.getState().technologies;

const openDialog = async () => screen.findByRole('dialog');

const keyInput = () => screen.getByLabelText('adminTechKeyLabel');
const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

/** Drive the raw-SVG FileUpload pipeline against the mocked backend upload. */
const uploadSvg = async (fileName = 'tech-logo.svg') => {
  fireEvent.change(fileInput(), {
    target: { files: [new File(['<svg/>'], fileName, { type: 'image/svg+xml' })] },
  });
  await screen.findByText('adminTechIconUploadSelected');
};

/**
 * Default page size is 5 (owner directive 2026-10-17) — page 1 shows only
 * react/nextjs/typescript/javascript/tailwind. Any assertion on a seed key
 * beyond the first five must widen the window to 20 first.
 */
const showAllRows = () => {
  const group = screen.getByRole('group', { name: 'perPageLabel' });
  fireEvent.click(within(group).getByRole('button', { name: '20' }));
};

beforeEach(() => {
  localStorage.clear();
  persistSpy.mockClear();
  addToast.mockClear();
  // URL.createObjectURL is missing in jsdom — patch the REAL URL class
  // (Object.create(URL) breaks `new URL()` inside zod v4 — ProjectForm gotcha).
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = vi.fn(() => 'blob:preview');
      static revokeObjectURL = vi.fn();
    }
  );
  uploadMocks.upload.mockImplementation(async (params: { blob: Blob; name: string }) => ({
    ok: true as const,
    file: { name: params.name, path: `/images/technologies/${params.name}` },
  }));
});

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('AdminTechnologiesPage — rendering', () => {
  it('renders the seed catalog rows (14 entries)', () => {
    renderPage();
    // Default size 5 shows the first five rows only — widen to 20 to see
    // the WHOLE 14-entry seed; each row carries its key testid.
    showAllRows();
    for (const key of ['react', 'nextjs', 'python', 'postgresql']) {
      expect(screen.getByTestId(`tech-row-${key}`)).toBeInTheDocument();
    }
    expect(screen.getAllByTestId(/^tech-row-/)).toHaveLength(14);
  });

  it('shows the EmptyState only when the catalog is empty', () => {
    renderPage();
    expect(screen.queryByText('adminTechnologiesEmpty')).not.toBeInTheDocument();
  });
});

describe('AdminTechnologiesPage — form modal (A7/A8/A12)', () => {
  it('«Add» opens ONE dialog with an empty create form', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'adminTechnologiesAdd' }));

    const dialog = await openDialog();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(within(dialog).getByTestId('technology-form')).toBeInTheDocument();
    expect(keyInput()).toHaveValue('');
  });

  it('A7: a valid Save closes the modal, updates the store and persists FIRST', async () => {
    const store = renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'adminTechnologiesAdd' }));
    await openDialog();

    await uploadSvg('svelte.svg');
    fireEvent.change(keyInput(), { target: { value: 'svelte' } });
    fireEvent.click(screen.getByRole('button', { name: 'adminTechSave' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(catalogOf(store).some((tech) => tech.key === 'svelte')).toBe(true);
    expect(catalogOf(store).find((tech) => tech.key === 'svelte')?.url).toBe(
      '/images/technologies/svelte.svg'
    );
    expect(persistSpy).toHaveBeenCalledTimes(1);
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'adminTechSaved', type: 'success' })
    );
  });

  it('A8: Cancel closes the dialog without touching the store', async () => {
    const store = renderPage();
    const before = catalogOf(store).length;
    fireEvent.click(screen.getByRole('button', { name: 'adminTechnologiesAdd' }));
    await openDialog();

    fireEvent.click(screen.getByRole('button', { name: 'adminTechCancel' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(catalogOf(store)).toHaveLength(before);
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('ESC closes the dialog', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'adminTechnologiesAdd' }));
    await openDialog();

    // Kit Modal listens on document (layerManager / useModalRoot M7).
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('A12: opening Edit while the form is open still yields ONE dialog', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'adminTechnologiesAdd' }));
    await openDialog();

    // jsdom ignores overlays — target the FIRST row's Edit (seed order
    // starts at `react`) so the query stays unambiguous.
    fireEvent.click(
      screen.getAllByRole('button', { name: 'adminTechnologiesEdit' })[0] as HTMLElement
    );
    await waitFor(() => {
      expect(screen.getAllByRole('dialog')).toHaveLength(1);
    });
  });
});

describe('AdminTechnologiesPage — edit mode (D7)', () => {
  it('Edit prefills the record, DISABLES the key and subtitles the modal with it', async () => {
    renderPage();
    fireEvent.click(
      screen.getAllByRole('button', { name: 'adminTechnologiesEdit' })[0] as HTMLElement
    );
    const dialog = await openDialog();

    expect(keyInput()).toBeDisabled();
    // tech-icon-upload: no URL input anymore — the icon block is a FileUpload.
    expect(within(dialog).getByTestId('technology-form')).toBeInTheDocument();
    expect(within(dialog).getByText('adminTechFormSubtitle:react')).toBeInTheDocument();
  });

  it('edit Save with a new upload replaces the url, keyed by the ORIGINAL key (D7)', async () => {
    const store = renderPage();
    fireEvent.click(
      screen.getAllByRole('button', { name: 'adminTechnologiesEdit' })[0] as HTMLElement
    );
    await openDialog();

    await uploadSvg('react-19.svg');
    fireEvent.click(screen.getByRole('button', { name: 'adminTechSave' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    const react = catalogOf(store).find((tech) => tech.key === 'react');
    expect(react?.url).toBe('/images/technologies/react-19.svg');
    // No duplicate record was created under a new key.
    expect(catalogOf(store).filter((tech) => tech.key === 'react')).toHaveLength(1);
  });
});

describe('AdminTechnologiesPage — D6 usedKeys wiring', () => {
  it('deleting a key referenced by a project is REFUSED — error inside the open modal, store untouched', async () => {
    const store = renderPage();
    const before = catalogOf(store);

    // `react` is referenced by seed projects' techIcons.
    fireEvent.click(
      screen.getAllByRole('button', { name: 'adminTechnologiesDelete' })[0] as HTMLElement
    );
    const confirm = await openDialog();
    fireEvent.click(within(confirm).getByRole('button', { name: 'adminTechnologiesDelete' }));

    const error = await screen.findByRole('alert');
    expect(error).toHaveTextContent('adminTechDeleteInUse');
    // Modal stays open (the error renders INSIDE it).
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(catalogOf(store)).toEqual(before);
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('deleting a FREE key succeeds — persist, row gone, modal closed', async () => {
    const store = renderPage();
    // `python` is NOT referenced by any seed project's techIcons — but it
    // sits at position 10, off the default 5-row page, so widen first.
    showAllRows();
    const pythonRow = screen.getByTestId('tech-actions-python');
    fireEvent.click(within(pythonRow).getByRole('button', { name: 'adminTechnologiesDelete' }));
    const confirm = await openDialog();
    fireEvent.click(within(confirm).getByRole('button', { name: 'adminTechnologiesDelete' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.queryByTestId('tech-row-python')).not.toBeInTheDocument();
    expect(catalogOf(store).some((tech) => tech.key === 'python')).toBe(false);
    expect(persistSpy).toHaveBeenCalledTimes(1);
  });
});
