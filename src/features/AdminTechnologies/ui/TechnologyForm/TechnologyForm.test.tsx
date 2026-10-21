// ============================================
// TechnologyForm tests (technologies-crud SPEC, WU-3)
// + tech-icon-upload (issue #261, WU-1)
// ============================================
//
// RED-first contract (gold standard: AdminSkills TechnologyForm):
// - create/edit inside the flat catalog; §validation mapped to i18n keys
//   (bad slug → adminTechKeyInvalid, duplicate → adminTechKeyExists,
//   create without a file → adminTechIconRequired);
// - tech-icon-upload A1: the iconUrl Input is GONE — the value only ever
//   comes from the FileUpload flow (pending selection in component state,
//   the REAL `/images/technologies/<name>` path is resolved at SAVE time
//   against a mocked imageDir service); create requires a file, edit with
//   no new file KEEPS the stored url;
// - D7: the key is IMMUTABLE in edit mode — the Input is disabled AND the
//   edit zod schema rejects a changed key, so even a forced DOM change
//   cannot rename the record (update stays keyed by the original);
// - persist BEFORE dispatch (§3), Toast feedback, exit-edit on success.

import type { Technology } from '@/entities/Technology';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TechnologyForm } from './TechnologyForm';

const { persistSpy, addSpy, updateSpy, addToast, holder, dirMocks } = vi.hoisted(() => ({
  persistSpy: vi.fn((_data: unknown[]) => true),
  addSpy: vi.fn((payload: unknown) => ({ type: 'technologies/addTechnology', payload })),
  updateSpy: vi.fn((payload: unknown) => ({ type: 'technologies/updateTechnology', payload })),
  addToast: vi.fn(),
  holder: {
    state: {
      technologies: [
        {
          key: 'react',
          url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        },
      ] as Technology[],
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

vi.mock('@/entities/Technology', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/Technology')>()),
  persistTechnologies: persistSpy,
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
// hop; the REAL selectors run against whatever state the test installs.
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: typeof holder.state) => unknown) => selector(holder.state),
    useDispatch: () => (_action: unknown) => undefined,
  };
});

const keyInput = () => screen.getByLabelText('adminTechKeyLabel');
const invertSelect = () => screen.getByLabelText('adminTechInvertLabel');
const submitButton = () => screen.getByRole('button', { name: 'adminTechSave' });
const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

/**
 * Drive the raw-SVG FileUpload pipeline against the mocked imageDir.
 * Exactly ONE upload per render — the aria-live `selected` announcement
 * (already rendered from a previous upload) would not re-appear otherwise.
 */
const uploadSvg = async (fileName = 'tech-logo.svg') => {
  fireEvent.change(fileInput(), {
    target: { files: [new File(['<svg/>'], fileName, { type: 'image/svg+xml' })] },
  });
  await screen.findByText('adminTechIconUploadSelected');
};

describe('TechnologyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    holder.state.technologies = [
      {
        key: 'react',
        url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
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
    render(<TechnologyForm />);

    expect(submitButton()).toBeDisabled();
    fireEvent.change(keyInput(), { target: { value: 'vue' } });
    expect(submitButton()).toBeEnabled();
  });

  it('create mode: Save without a file is blocked with adminTechIconRequired', async () => {
    render(<TechnologyForm />);
    fireEvent.change(keyInput(), { target: { value: 'vue' } });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('adminTechIconRequired');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('create mode: shows adminTechKeyInvalid for a non-slug key and persists nothing', async () => {
    render(<TechnologyForm />);
    await uploadSvg();
    fireEvent.change(keyInput(), { target: { value: 'React 19' } });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('adminTechKeyInvalid');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('create mode: shows adminTechKeyExists for a duplicate key', async () => {
    render(<TechnologyForm />);
    await uploadSvg();
    fireEvent.change(keyInput(), { target: { value: 'react' } });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('adminTechKeyExists');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('create mode: an uploaded SVG lands as the /images/technologies path — persist BEFORE dispatch', async () => {
    const calls: string[] = [];
    persistSpy.mockImplementation(() => {
      calls.push('persist');
      return true;
    });
    addSpy.mockImplementation((payload: unknown) => {
      calls.push('dispatch');
      return { type: 'technologies/addTechnology', payload };
    });
    const onExitEdit = vi.fn();

    render(<TechnologyForm onExitEdit={onExitEdit} />);
    await uploadSvg('vue-logo.svg');
    fireEvent.change(keyInput(), { target: { value: 'vue' } });
    fireEvent.change(invertSelect(), { target: { value: 'true' } });

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'adminTechSaved' }))
    );
    expect(calls).toEqual(['persist', 'dispatch']);
    expect(dirMocks.save).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'vue-logo.svg', subdir: 'technologies' })
    );
    expect(persistSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ key: 'react' }),
        expect.objectContaining({
          key: 'vue',
          url: '/images/technologies/vue-logo.svg',
          invertInDark: true,
        }),
      ])
    );
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'vue', url: '/images/technologies/vue-logo.svg' })
    );
    expect(onExitEdit).toHaveBeenCalled();
  });

  it('create mode: persist failure shows adminTechPersistError and skips dispatch', async () => {
    persistSpy.mockReturnValue(false);

    render(<TechnologyForm />);
    await uploadSvg();
    fireEvent.change(keyInput(), { target: { value: 'vue' } });

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'adminTechPersistError', type: 'error' })
      )
    );
    expect(addSpy).not.toHaveBeenCalled();
    // The form keeps the typed values for a retry (§7).
    expect(keyInput()).toHaveValue('vue');
  });

  it('create mode: a failed file write toasts and keeps the form open (no persist/dispatch)', async () => {
    const onExitEdit = vi.fn();
    dirMocks.save.mockRejectedValue(new Error('disk full'));

    render(<TechnologyForm onExitEdit={onExitEdit} />);
    await uploadSvg();
    fireEvent.change(keyInput(), { target: { value: 'vue' } });

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'adminTechIconUploadSaveError', type: 'error' })
      )
    );
    expect(persistSpy).not.toHaveBeenCalled();
    expect(addSpy).not.toHaveBeenCalled();
    expect(onExitEdit).not.toHaveBeenCalled();
    // The form is still there with its values for a retry (§7).
    expect(keyInput()).toHaveValue('vue');
  });

  it('create mode: an unsupported browser toasts and persists nothing', async () => {
    dirMocks.supported.mockReturnValue(false);

    render(<TechnologyForm />);
    await uploadSvg();
    fireEvent.change(keyInput(), { target: { value: 'vue' } });

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'adminTechIconUploadUnsupported', type: 'error' })
      )
    );
    expect(persistSpy).not.toHaveBeenCalled();
    expect(addSpy).not.toHaveBeenCalled();
  });

  it('edit mode: prefills the record and DISABLES the key input (D7)', () => {
    render(
      <TechnologyForm
        technology={{
          key: 'react',
          url: 'https://cdn.example.com/react.svg',
          invertInDark: true,
        }}
      />
    );

    expect(keyInput()).toHaveValue('react');
    expect(keyInput()).toBeDisabled();
    expect(invertSelect()).toHaveValue('true');
  });

  it('edit mode: previews the CURRENT stored icon above the uploader (A2)', () => {
    render(
      <TechnologyForm
        technology={{
          key: 'react',
          url: '/images/technologies/react-19.svg',
        }}
      />
    );

    const preview = screen.getByAltText('');
    expect(preview).toHaveAttribute('src', '/images/technologies/react-19.svg');
    expect(screen.getByText('adminTechIconCurrent')).toBeInTheDocument();
  });

  it('create mode: shows NO current-icon preview', () => {
    render(<TechnologyForm />);

    expect(screen.queryByText('adminTechIconCurrent')).not.toBeInTheDocument();
  });

  it('edit mode: a forced key change is rejected by the schema — nothing persists', async () => {
    render(
      <TechnologyForm technology={{ key: 'react', url: 'https://cdn.example.com/react.svg' }} />
    );
    // jsdom does not enforce the disabled attribute on synthetic events —
    // exactly why D7 needs the schema rule in ADDITION to the disabled Input.
    fireEvent.change(keyInput(), { target: { value: 'hacked' } });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('adminTechKeyInvalid');
    expect(persistSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('edit mode: Save without a new file KEEPS the stored url (keep-current)', async () => {
    const onExitEdit = vi.fn();

    render(
      <TechnologyForm
        technology={{
          key: 'react',
          url: 'https://cdn.example.com/react.svg',
        }}
        onExitEdit={onExitEdit}
      />
    );
    fireEvent.change(invertSelect(), { target: { value: 'true' } });

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'adminTechSaved' }))
    );
    expect(dirMocks.save).not.toHaveBeenCalled();
    expect(persistSpy).toHaveBeenCalledWith([
      {
        key: 'react',
        url: 'https://cdn.example.com/react.svg',
        invertInDark: true,
      },
    ]);
    expect(updateSpy).toHaveBeenCalledWith({
      key: 'react',
      patch: { url: 'https://cdn.example.com/react.svg', invertInDark: true },
    });
    expect(onExitEdit).toHaveBeenCalled();
  });

  it('edit mode: an uploaded SVG replaces the stored url with the new path', async () => {
    render(
      <TechnologyForm
        technology={{
          key: 'react',
          url: 'https://cdn.example.com/react.svg',
        }}
      />
    );
    await uploadSvg('react-19.svg');

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'adminTechSaved' }))
    );
    expect(persistSpy).toHaveBeenCalledWith([
      {
        key: 'react',
        url: '/images/technologies/react-19.svg',
        invertInDark: false,
      },
    ]);
    expect(updateSpy).toHaveBeenCalledWith({
      key: 'react',
      patch: { url: '/images/technologies/react-19.svg', invertInDark: false },
    });
  });

  it('Cancel calls onExitEdit without persisting', () => {
    const onExitEdit = vi.fn();
    render(<TechnologyForm onExitEdit={onExitEdit} />);

    fireEvent.change(keyInput(), { target: { value: 'vue' } });
    fireEvent.click(screen.getByRole('button', { name: 'adminTechCancel' }));

    expect(onExitEdit).toHaveBeenCalled();
    expect(persistSpy).not.toHaveBeenCalled();
    expect(addToast).not.toHaveBeenCalled();
  });
});
