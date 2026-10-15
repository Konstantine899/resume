// ============================================
// AboutEditorForm tests (plan About CRUD §10 WU-3)
// ============================================
//
// RED-first contract: form render, §7 validation via i18n keys (R-4, no
// hardcoded messages), persist → dispatch order (R-7), Toast feedback and
// the destructive-Reset confirm — a kit Modal (admin-about-refactor R-1,
// §6 «never window.confirm»), NOT a native dialog. Storage and action
// creators are spied at the module boundary; the reducer itself stays real
// (spread actual) so the store hydrates normally.

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AboutContent } from '@/entities/AboutContent';
import { DEVELOPER_DATA, PROFILE_STACK } from '@/entities/Developer';
import { AboutEditorForm } from './AboutEditorForm';

const { persistSpy, removeSpy, updateSpy, resetSpy, addToast } = vi.hoisted(() => ({
  // Typed arg => mock.calls[0] is [AboutContent], not [].
  persistSpy: vi.fn((_content: AboutContent) => true),
  removeSpy: vi.fn(),
  updateSpy: vi.fn((content: unknown) => ({ type: 'aboutContent/update', payload: content })),
  resetSpy: vi.fn(() => ({ type: 'aboutContent/reset' })),
  addToast: vi.fn(),
}));

vi.mock('../../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/services/storage')>()),
  persistAboutContent: persistSpy,
  removeAboutContent: removeSpy,
}));

vi.mock('../../model/slices/aboutContentSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/aboutContentSlice')>()),
  updateAboutContent: updateSpy,
  resetToDefaults: resetSpy,
}));

// Deterministic labels: t(key) => key (Nav.test pattern) — assertions target
// raw i18n keys, so locale edits never flip the expectations. Known options
// render as `${key}:${value}` (name — R-1 confirm subtitle names the entity).
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

// react-redux is mocked instead of wrapping StoreProvider: `features → app`
// is a banned FSD hop (eslint fsd-imports/layer-dependency), so a feature
// test may not import @/app/providers. The REAL selector still runs against
// a seed-shaped state, so the selector wiring stays covered.
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  const { createAboutSeed } = await import('../../model/services/seed');
  const state = { aboutContent: createAboutSeed() };
  return {
    ...actual,
    useSelector: (selector: (s: typeof state) => unknown) => selector(state),
    useDispatch: () => (_action: unknown) => undefined,
  };
});

const confirmSpy = vi.spyOn(window, 'confirm');

const renderForm = () => render(<AboutEditorForm />);

const fullNameInput = () => screen.getByLabelText('aboutFieldFullName');

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  persistSpy.mockReturnValue(true);
  confirmSpy.mockReturnValue(false);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AboutEditorForm: render (WU-3)', () => {
  it('renders title, hint, all §7 fields prefilled from the store and the read-only stack', () => {
    renderForm();

    expect(screen.getByRole('heading', { level: 2, name: 'adminAboutTitle' })).toBeInTheDocument();
    expect(screen.getByText('adminAboutHint')).toBeInTheDocument();

    // Prefill = seed (empty localStorage → lazy hydration).
    expect(fullNameInput()).toHaveValue(DEVELOPER_DATA.fullName);
    // 3 paragraphs × 2 locales as textareas; inputs: fullName + 4 stats × 2 + 2 cta.
    expect(document.querySelectorAll('textarea')).toHaveLength(6);
    expect(document.querySelectorAll('input')).toHaveLength(11);

    // Read-only stack preview (stack is out of CRUD scope — §5).
    expect(document.querySelectorAll('[data-testid="about-form-stack"] li')).toHaveLength(
      PROFILE_STACK.length
    );

    // Save is disabled until the form is dirty (§9 idle).
    expect(screen.getByRole('button', { name: 'aboutSave' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'aboutReset' })).toBeInTheDocument();
  });
});

describe('AboutEditorForm: validation (§7, R-4)', () => {
  it('blocks submit on an empty fullName and maps the error to an i18n key', async () => {
    renderForm();

    fireEvent.change(fullNameInput(), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'aboutSave' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('aboutNameRequired');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('maps an over-long stat to aboutStatRequired', async () => {
    renderForm();

    const stat = screen.getByLabelText('aboutStatYears · EN');
    fireEvent.change(stat, { target: { value: 'x'.repeat(61) } });
    fireEvent.click(screen.getByRole('button', { name: 'aboutSave' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('aboutStatRequired');
    expect(persistSpy).not.toHaveBeenCalled();
  });
});

describe('AboutEditorForm: save (R-7 persist → dispatch)', () => {
  it('persists BEFORE dispatching, toasts aboutSaved and returns to idle', async () => {
    renderForm();

    fireEvent.change(fullNameInput(), { target: { value: 'New Name' } });
    fireEvent.click(screen.getByRole('button', { name: 'aboutSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(updateSpy).toHaveBeenCalledTimes(1);
    // Hard order: persist must run before the store changes (§4).
    // `?? NaN`: an impossible undefined would FAIL the comparison, not pass it.
    expect(persistSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      updateSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );
    expect(persistSpy.mock.calls[0]?.[0]).toMatchObject({ fullName: 'New Name' });
    expect(addToast).toHaveBeenCalledWith({ message: 'aboutSaved', type: 'success' });

    // reset(values) after save → pristine again → Save disabled (§9 saved→idle).
    await waitFor(() => expect(screen.getByRole('button', { name: 'aboutSave' })).toBeDisabled());
  });

  it('keeps the form filled, skips dispatch and toasts aboutSaveError when persist fails', async () => {
    renderForm();

    persistSpy.mockReturnValueOnce(false);
    fireEvent.change(fullNameInput(), { target: { value: 'Unsaved Name' } });
    fireEvent.click(screen.getByRole('button', { name: 'aboutSave' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({
        message: 'aboutSaveError',
        type: 'error',
      })
    );
    expect(updateSpy).not.toHaveBeenCalled();
    // Data survives in the form (§7 quota/SecurityError row).
    expect(fullNameInput()).toHaveValue('Unsaved Name');
    expect(screen.getByRole('button', { name: 'aboutSave' })).toBeEnabled();
  });
});

describe('AboutEditorForm: reset confirm (R-1, kit Modal)', () => {
  /** Open the destructive confirm; returns the dialog element. */
  const openConfirm = async () => {
    fireEvent.click(screen.getByRole('button', { name: 'aboutReset' }));
    return screen.findByRole('dialog');
  };

  it('«aboutReset» opens a confirm Modal and never calls window.confirm', async () => {
    renderForm();

    fireEvent.change(fullNameInput(), { target: { value: 'Dirty Name' } });
    const modal = await openConfirm();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(
      within(modal).getByRole('heading', { level: 2, name: 'aboutReset' })
    ).toBeInTheDocument();
    // Opening is not acting: nothing removed or dispatched yet.
    expect(removeSpy).not.toHaveBeenCalled();
    expect(resetSpy).not.toHaveBeenCalled();
    expect(fullNameInput()).toHaveValue('Dirty Name');
  });

  it('subtitle names the current fullName ({{name}} interpolation)', async () => {
    renderForm();

    fireEvent.change(fullNameInput(), { target: { value: 'Dirty Name' } });
    const modal = await openConfirm();

    expect(within(modal).getByText('aboutResetConfirm:Dirty Name')).toBeInTheDocument();
  });

  it('moves focus to «Отмена» when the confirm opens (initialFocusRef)', async () => {
    renderForm();

    const modal = await openConfirm();
    const cancel = within(modal).getByRole('button', { name: 'aboutCancel' });
    await waitFor(() => expect(document.activeElement).toBe(cancel));
  });

  it('ESC closes the confirm without any action', async () => {
    renderForm();

    fireEvent.change(fullNameInput(), { target: { value: 'Dirty Name' } });
    await openConfirm();
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(removeSpy).not.toHaveBeenCalled();
    expect(resetSpy).not.toHaveBeenCalled();
    expect(fullNameInput()).toHaveValue('Dirty Name');
  });

  it('overlay pointer-down closes the confirm without any action', async () => {
    renderForm();

    await openConfirm();
    const overlay = document.querySelector('[data-dark]');
    // M14: assert existence instead of silently passing when null.
    expect(overlay).not.toBeNull();
    fireEvent.pointerDown(overlay as HTMLElement);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(removeSpy).not.toHaveBeenCalled();
    expect(resetSpy).not.toHaveBeenCalled();
  });

  it('«Отмена» declines: the dialog closes and nothing is removed or dispatched', async () => {
    renderForm();

    fireEvent.change(fullNameInput(), { target: { value: 'Dirty Name' } });
    const modal = await openConfirm();
    fireEvent.click(within(modal).getByRole('button', { name: 'aboutCancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(removeSpy).not.toHaveBeenCalled();
    expect(resetSpy).not.toHaveBeenCalled();
    // Form untouched.
    expect(fullNameInput()).toHaveValue('Dirty Name');
  });

  it('confirm removes storage, dispatches reset and returns the fields to the seed', async () => {
    renderForm();

    fireEvent.change(fullNameInput(), { target: { value: 'Dirty Name' } });
    const modal = await openConfirm();
    fireEvent.click(within(modal).getByRole('button', { name: 'aboutReset' }));

    await waitFor(() => expect(removeSpy).toHaveBeenCalledTimes(1));
    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      resetSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );
    // Fields show the seed again, not the dirty values (§10 WU-3 reset note).
    await waitFor(() => expect(fullNameInput()).toHaveValue(DEVELOPER_DATA.fullName));
    expect(screen.getByRole('button', { name: 'aboutSave' })).toBeDisabled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
