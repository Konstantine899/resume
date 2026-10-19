// ============================================
// AboutEditorList tests (admin-about-table WU-2/WU-3, SPEC R-1/R-3/R-7)
// ============================================
//
// RED-first contract for the kit-Table vitrina:
// - R-1: 8 fixed rows (3 descriptions + 4 stats + ctaLabel), columns
//   [Поле | EN | RU | Действия], exactly ONE Pencil per row in the
//   nowrap `.cellActions`, no add/remove affordances (fixed contract);
// - R-3/WU-2+WU-4: the merged save path — row Pencil → field-scoped modal
//   → snapshot → toMergedDocument → persist → dispatch(full document) —
//   with the persist-fail branch (error toast, NO dispatch, modal open);
// - R-4: Reset keeps the admin-about-refactor kit-Modal-confirm (never
//   window.confirm, subtitle names the entity, focus starts on «Отмена»).
// Storage and action creators are spied at the module boundary; the
// reducer stays real (spread actual) so the store hydrates normally.

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AboutContent } from '@/entities/AboutContent';
import { createAboutSeed } from '../../model/services/seed';
import { AboutEditorList } from './AboutEditorList';

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
  const state = { aboutContent: createAboutSeed() };
  return {
    ...actual,
    useSelector: (selector: (s: typeof state) => unknown) => selector(state),
    useDispatch: () => (_action: unknown) => undefined,
  };
});

const confirmSpy = vi.spyOn(window, 'confirm');

const seed = createAboutSeed();

const renderList = () => render(<AboutEditorList />);

/** The vitrina body rows (the header row is excluded). */
const dataRows = () => document.querySelectorAll<HTMLTableRowElement>('tbody tr');

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  persistSpy.mockReturnValue(true);
  confirmSpy.mockReturnValue(false);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AboutEditorList: vitrina render (WU-3, R-1)', () => {
  it('renders the header (h2 + hint + Reset) and the 4-column table', () => {
    renderList();

    expect(screen.getByRole('heading', { level: 2, name: 'adminAboutTitle' })).toBeInTheDocument();
    expect(screen.getByText('adminAboutHint')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'aboutReset' })).toBeInTheDocument();

    expect(screen.getAllByRole('columnheader')).toHaveLength(4);
    expect(screen.getByRole('columnheader', { name: 'adminAboutTableField' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'EN' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'RU' })).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'adminAboutTableActions' })
    ).toBeInTheDocument();
  });

  it('renders exactly 8 rows in document order with seed values in both locales', () => {
    renderList();

    const rows = dataRows();
    expect(rows).toHaveLength(8);

    // Row order: description 1..3 → 4 stats → ctaLabel; labels are key lookups.
    const labels = Array.from(rows).map((row) => row.cells[0]?.textContent);
    expect(labels).toEqual([
      'aboutFieldDescriptions 1',
      'aboutFieldDescriptions 2',
      'aboutFieldDescriptions 3',
      'aboutStatYears',
      'aboutStatProjects',
      'aboutStatUsers',
      'aboutStatRemote',
      'aboutFieldCta',
    ]);

    // EN/RU cells carry the seed locale values (row 1 and the CTA).
    expect(rows[0]?.cells[1]?.textContent).toBe(seed.descriptions[0]?.en);
    expect(rows[0]?.cells[2]?.textContent).toBe(seed.descriptions[0]?.ru);
    expect(rows[7]?.cells[1]?.textContent).toBe(seed.ctaLabel.en);
    expect(rows[7]?.cells[2]?.textContent).toBe(seed.ctaLabel.ru);
  });

  it('renders exactly one Pencil per row and NO add/remove affordance', () => {
    renderList();

    expect(screen.getAllByRole('button', { name: 'adminAboutEditRow' })).toHaveLength(8);
    expect(screen.queryByRole('button', { name: 'adminAboutAddRow' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'adminAboutDeleteRow' })).not.toBeInTheDocument();
    // fullName has no row yet (WU-5 scalar block) and no inline inputs.
    expect(document.querySelector('input')).toBeNull();
    expect(document.querySelector('textarea')).toBeNull();
  });
});

describe('AboutEditorList: merged save path (WU-2/WU-4, R-3 persist → dispatch)', () => {
  it('persists the FULL merged document BEFORE dispatching and toasts aboutSaved', async () => {
    renderList();

    // WU-4: the Pencil opens the field modal — the seam runs on its Save.
    fireEvent.click(screen.getByTestId('admin-about-edit-stat-1'));
    const modal = await screen.findByRole('dialog');
    fireEvent.change(within(modal).getByLabelText('aboutStatProjects · EN'), {
      target: { value: '42 projects' },
    });
    fireEvent.click(within(modal).getByRole('button', { name: 'aboutSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(updateSpy).toHaveBeenCalledTimes(1);
    // Hard order: persist must run before the store changes (§4).
    // `?? NaN`: an impossible undefined would FAIL the comparison, not pass it.
    expect(persistSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      updateSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );
    // FULL document — the other 7 fields ride through untouched, the edited
    // one carries the FORM value.
    expect(persistSpy.mock.calls[0]?.[0]).toMatchObject({
      fullName: seed.fullName,
      descriptions: seed.descriptions,
      ctaLabel: seed.ctaLabel,
      stats: {
        aboutStatProjects: { en: '42 projects', ru: seed.stats.aboutStatProjects.ru },
      },
    });
    expect(addToast).toHaveBeenCalledWith({ message: 'aboutSaved', type: 'success' });
    // A successful save closes the modal (onExitEdit).
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('persist-fail: toasts aboutSaveError, skips dispatch and KEEPS the modal open', async () => {
    renderList();

    persistSpy.mockReturnValueOnce(false);
    fireEvent.click(screen.getByTestId('admin-about-edit-ctaLabel'));
    const modal = await screen.findByRole('dialog');
    fireEvent.change(within(modal).getByLabelText('aboutFieldCta · EN'), {
      target: { value: 'Go!' },
    });
    fireEvent.click(within(modal).getByRole('button', { name: 'aboutSave' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'aboutSaveError', type: 'error' })
    );
    expect(updateSpy).not.toHaveBeenCalled();
    // The dialog keeps the user's values for a retry (R-3).
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(within(modal).getByLabelText('aboutFieldCta · EN')).toHaveValue('Go!');
  });
});

describe('AboutEditorList: field edit modal (WU-4, R-3)', () => {
  it('a description Pencil opens the modal with TWO textareas and the field-named title', async () => {
    renderList();

    fireEvent.click(screen.getByTestId('admin-about-edit-description-0'));
    const modal = await screen.findByRole('dialog');

    expect(within(modal).queryAllByRole('textbox')).toHaveLength(2);
    expect(modal.querySelectorAll('textarea')).toHaveLength(2);
    expect(modal.querySelectorAll('input')).toHaveLength(0);
    // aria-dialog-name: the modal header names the field (identity t mock
    // renders the raw key — the {{field}} option carries the row label).
    expect(
      within(modal).getByRole('heading', { level: 2, name: 'adminAboutEditFieldTitle' })
    ).toBeInTheDocument();
  });

  it('a stat Pencil opens the modal with Inputs (never textareas), cap 60', async () => {
    renderList();

    fireEvent.click(screen.getByTestId('admin-about-edit-stat-0'));
    const modal = await screen.findByRole('dialog');

    expect(modal.querySelectorAll('textarea')).toHaveLength(0);
    expect(modal.querySelectorAll('input')).toHaveLength(2);
    expect(within(modal).getByLabelText('aboutStatYears · EN')).toHaveAttribute('maxlength', '60');
  });

  it('a ctaLabel Pencil opens the modal with Inputs, cap 40', async () => {
    renderList();

    fireEvent.click(screen.getByTestId('admin-about-edit-ctaLabel'));
    const modal = await screen.findByRole('dialog');

    expect(within(modal).getByLabelText('aboutFieldCta · RU')).toHaveValue(seed.ctaLabel.ru);
    expect(within(modal).getByLabelText('aboutFieldCta · RU')).toHaveAttribute('maxlength', '40');
  });

  it('the form Save is pristine-disabled and the modal owns the only dialog', async () => {
    renderList();

    fireEvent.click(screen.getByTestId('admin-about-edit-description-1'));
    const modal = await screen.findByRole('dialog');

    expect(within(modal).getByRole('button', { name: 'aboutSave' })).toBeDisabled();
    // Exactly ONE dialog on the page (at-most-one-dialog invariant).
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('a cap violation surfaces the keyed error and never persists', async () => {
    renderList();

    fireEvent.click(screen.getByTestId('admin-about-edit-description-2'));
    const modal = await screen.findByRole('dialog');
    fireEvent.change(within(modal).getByLabelText('aboutFieldDescriptions · EN'), {
      target: { value: '' },
    });
    fireEvent.click(within(modal).getByRole('button', { name: 'aboutSave' }));

    expect(await within(modal).findByRole('alert')).toHaveTextContent('aboutParagraphEmpty');
    expect(persistSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('ESC closes the modal and clears the editing state (reopening works)', async () => {
    renderList();

    fireEvent.click(screen.getByTestId('admin-about-edit-stat-2'));
    await screen.findByRole('dialog');
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // The selection state is CLEARED — a reopen mounts a fresh form.
    fireEvent.click(screen.getByTestId('admin-about-edit-stat-2'));
    const reopened = await screen.findByRole('dialog');
    expect(within(reopened).getByLabelText('aboutStatUsers · EN')).toHaveValue(
      seed.stats.aboutStatUsers.en
    );
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('Cancel closes the modal without saving', async () => {
    renderList();

    fireEvent.click(screen.getByTestId('admin-about-edit-description-0'));
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'aboutCancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(persistSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });
});

describe('AboutEditorList: reset confirm (R-4, kit Modal)', () => {
  /** Open the destructive confirm; returns the dialog element. */
  const openConfirm = async () => {
    fireEvent.click(screen.getByRole('button', { name: 'aboutReset' }));
    return screen.findByRole('dialog');
  };

  it('«aboutReset» opens a confirm Modal and never calls window.confirm', async () => {
    renderList();

    const modal = await openConfirm();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(
      within(modal).getByRole('heading', { level: 2, name: 'aboutReset' })
    ).toBeInTheDocument();
    // Opening is not acting: nothing removed or dispatched yet.
    expect(removeSpy).not.toHaveBeenCalled();
    expect(resetSpy).not.toHaveBeenCalled();
  });

  it('subtitle names the current fullName ({{name}} interpolation)', async () => {
    renderList();

    const modal = await openConfirm();

    expect(within(modal).getByText(`aboutResetConfirm:${seed.fullName}`)).toBeInTheDocument();
  });

  it('moves focus to «Отмена» when the confirm opens (initialFocusRef)', async () => {
    renderList();

    const modal = await openConfirm();
    const cancel = within(modal).getByRole('button', { name: 'aboutCancel' });
    await waitFor(() => expect(document.activeElement).toBe(cancel));
  });

  it('ESC closes the confirm without any action', async () => {
    renderList();

    await openConfirm();
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(removeSpy).not.toHaveBeenCalled();
    expect(resetSpy).not.toHaveBeenCalled();
  });

  it('overlay pointer-down closes the confirm without any action', async () => {
    renderList();

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
    renderList();

    const modal = await openConfirm();
    fireEvent.click(within(modal).getByRole('button', { name: 'aboutCancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(removeSpy).not.toHaveBeenCalled();
    expect(resetSpy).not.toHaveBeenCalled();
  });

  it('confirm removes storage BEFORE dispatching reset and closes the dialog', async () => {
    renderList();

    const modal = await openConfirm();
    fireEvent.click(within(modal).getByRole('button', { name: 'aboutReset' }));

    await waitFor(() => expect(removeSpy).toHaveBeenCalledTimes(1));
    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      resetSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    // The vitrina still renders the 8 fixed rows (the contract has no rows
    // to remove — reset restores the SEED document).
    expect(dataRows()).toHaveLength(8);
  });
});
