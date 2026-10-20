// ============================================
// AboutEditorList tests (admin-about-table WU-2/WU-3 + WU-12 amendment,
// SPEC R-1/R-2/R-3/R-4/R-7)
// ============================================
//
// RED-first contract for the kit-Table vitrina:
// - R-1 (v2): rows are built from the ACTUAL document (all descriptions,
//   every stats record entry addressed BY KEY, cta while it is not null);
//   columns [Поле | EN | RU | Действия], a Pencil + a Trash2 per row in the
//   nowrap `.cellActions`;
// - R-2/WU-12: «Добавить строку» in the header next to «Сбросить» → kit
//   Modal + kit Select of the row kind → per-kind form → persist-THEN-
//   dispatch (fail keeps the modal open); the slug key + custom label land
//   in `stats`/`statLabels`;
// - R-3/WU-12: Trash2 → confirm Modal (subtitle names the row, focus on
//   «Отмена», persist-fail keeps it open) → description/stat/cta removed;
// - R-3/WU-2+WU-4: row Pencil → field-scoped modal (merged save seam);
// - R-2/WU-5: the fullName scalar block (Contact email D6 parity);
// - R-4: Reset keeps the useConfirmAction kit-Modal-confirm.
// Storage and action creators are spied at the module boundary; the store
// holder is MUTATED by the mocked dispatch so add/delete tests can assert
// the vitrina reacting to the new document (resume-projects-crud lesson:
// a frozen holder makes «row appeared/disappeared» assertions vacuous).

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AboutContent } from '@/entities/AboutContent';
import { createAboutSeed } from '../../model/services/seed';
import { AboutEditorList } from './AboutEditorList';

const { holder, persistSpy, removeSpy, updateSpy, resetSpy, addToast } = vi.hoisted(() => ({
  // Live store stand-in: the mocked dispatch writes through to it.
  holder: { content: null as AboutContent | null },
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
// render as `${key}:${value}` (confirm subtitles name the entity).
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
// the holder, and the mocked dispatch APPLIES the full-replace actions so
// add/delete round-trips are observable (WU-12).
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  const state: { aboutContent: AboutContent } = {
    get aboutContent() {
      return holder.content ?? createAboutSeed();
    },
  };
  return {
    ...actual,
    useSelector: (selector: (s: typeof state) => unknown) => selector(state),
    useDispatch: () => (action: { type?: string; payload?: AboutContent } | undefined) => {
      if (action?.type === 'aboutContent/update' && action.payload !== undefined) {
        holder.content = action.payload;
      }
      if (action?.type === 'aboutContent/reset') {
        holder.content = createAboutSeed();
      }
      return action;
    },
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
  holder.content = createAboutSeed();
  persistSpy.mockReturnValue(true);
  confirmSpy.mockReturnValue(false);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AboutEditorList: vitrina render (WU-3, R-1 v2)', () => {
  it('renders the header (h2 + hint + «Добавить строку» + Reset) and the 4-column table', () => {
    renderList();

    expect(screen.getByRole('heading', { level: 2, name: 'adminAboutTitle' })).toBeInTheDocument();
    expect(screen.getByText('adminAboutHint')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'adminAboutAddRow' })).toBeInTheDocument();
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

    // Row order: description 1..3 → stats in record insertion order → cta.
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
    expect(rows[7]?.cells[1]?.textContent).toBe(seed.ctaLabel?.en);
    expect(rows[7]?.cells[2]?.textContent).toBe(seed.ctaLabel?.ru);
  });

  it('every row carries a Pencil AND a Trash2 in the nowrap actions cell', () => {
    renderList();

    expect(screen.getAllByRole('button', { name: 'adminAboutEditRow' })).toHaveLength(8);
    expect(screen.getAllByRole('button', { name: 'adminAboutDeleteRow' })).toHaveLength(8);
    // No inline inputs INSIDE the rows; the only Input on the page is the
    // fullName scalar block ABOVE the table (WU-5, R-2).
    expect(document.querySelector('tbody input')).toBeNull();
    expect(document.querySelector('tbody textarea')).toBeNull();
    expect(screen.getByLabelText('aboutFieldFullName')).toBeInTheDocument();
  });

  it('stat rows are addressed BY KEY and custom stats show their own label', () => {
    holder.content = {
      ...seed,
      stats: { ...seed.stats, 'full-stack': { en: '10 years', ru: '10 лет' } },
      statLabels: { 'full-stack': { en: 'Full Stack', ru: 'Фулл-стек' } },
    };

    renderList();

    expect(screen.getByTestId('admin-about-edit-stat-aboutStatYears')).toBeInTheDocument();
    expect(screen.getByTestId('admin-about-edit-stat-full-stack')).toBeInTheDocument();
    // The custom row label is the STORED label (language 'en' in this suite).
    expect(screen.getByText('Full Stack')).toBeInTheDocument();
    // Rows come from the record — 4 known + 1 custom + 3 descriptions + cta.
    expect(dataRows()).toHaveLength(9);
  });
});

describe('AboutEditorList: merged save path (WU-2/WU-4, R-3 persist → dispatch)', () => {
  it('persists the FULL merged document BEFORE dispatching and toasts aboutSaved', async () => {
    renderList();

    // WU-4: the Pencil opens the field modal — the seam runs on its Save.
    fireEvent.click(screen.getByTestId('admin-about-edit-stat-aboutStatProjects'));
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
    // FULL document — the other fields ride through untouched, the edited
    // one carries the FORM value.
    expect(persistSpy.mock.calls[0]?.[0]).toMatchObject({
      fullName: seed.fullName,
      descriptions: seed.descriptions,
      ctaLabel: seed.ctaLabel,
      stats: {
        aboutStatProjects: { en: '42 projects', ru: seed.stats.aboutStatProjects?.ru },
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

    fireEvent.click(screen.getByTestId('admin-about-edit-stat-aboutStatYears'));
    const modal = await screen.findByRole('dialog');

    expect(modal.querySelectorAll('textarea')).toHaveLength(0);
    expect(modal.querySelectorAll('input')).toHaveLength(2);
    expect(within(modal).getByLabelText('aboutStatYears · EN')).toHaveAttribute('maxlength', '60');
  });

  it('a ctaLabel Pencil opens the modal with Inputs, cap 40', async () => {
    renderList();

    fireEvent.click(screen.getByTestId('admin-about-edit-ctaLabel'));
    const modal = await screen.findByRole('dialog');

    expect(within(modal).getByLabelText('aboutFieldCta · RU')).toHaveValue(seed.ctaLabel?.ru);
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

    fireEvent.click(screen.getByTestId('admin-about-edit-stat-aboutStatUsers'));
    await screen.findByRole('dialog');
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // The selection state is CLEARED — a reopen mounts a fresh form.
    fireEvent.click(screen.getByTestId('admin-about-edit-stat-aboutStatUsers'));
    const reopened = await screen.findByRole('dialog');
    expect(within(reopened).getByLabelText('aboutStatUsers · EN')).toHaveValue(
      seed.stats.aboutStatUsers?.en
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

describe('AboutEditorList: add row (WU-12, R-2)', () => {
  /** Open the add modal (the header trigger). */
  const openAdd = async () => {
    fireEvent.click(screen.getByRole('button', { name: 'adminAboutAddRow' }));
    return screen.findByRole('dialog');
  };

  it('the «Добавить строку» trigger lives in the header, never in a table cell', () => {
    renderList();

    const add = screen.getByRole('button', { name: 'adminAboutAddRow' });
    const reset = screen.getByRole('button', { name: 'aboutReset' });
    expect(add.closest('td')).toBeNull();
    expect(reset.closest('td')).toBeNull();
    // Document order: the add trigger comes BEFORE Reset in the header.
    expect((add.compareDocumentPosition(reset) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0).toBe(
      true
    );
  });

  it('the add modal names the dialog and offers description+stat (no cta while it exists)', async () => {
    renderList();

    const modal = await openAdd();

    expect(
      within(modal).getByRole('heading', { level: 2, name: 'adminAboutAddRowTitle' })
    ).toBeInTheDocument();
    const options = within(modal).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      'adminAboutRowKindDescription',
      'adminAboutRowKindStat',
    ]);
  });

  it('pristine Save is disabled', async () => {
    renderList();

    const modal = await openAdd();

    expect(within(modal).getByRole('button', { name: 'aboutSave' })).toBeDisabled();
  });

  it('adding a description appends the row, persists BEFORE dispatch and toasts', async () => {
    renderList();

    const modal = await openAdd();
    // The auto-label carries the 1-based index (N = length + 1).
    fireEvent.change(within(modal).getByLabelText('aboutFieldDescriptions 4 · EN'), {
      target: { value: 'Fourth pitch' },
    });
    fireEvent.change(within(modal).getByLabelText('aboutFieldDescriptions 4 · RU'), {
      target: { value: 'Четвёртый питч' },
    });
    fireEvent.click(within(modal).getByRole('button', { name: 'aboutSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0];
    expect(persisted?.descriptions).toHaveLength(4);
    expect(persisted?.descriptions[3]).toEqual({ en: 'Fourth pitch', ru: 'Четвёртый питч' });
    expect(persistSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      updateSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );
    expect(addToast).toHaveBeenCalledWith({ message: 'adminAboutRowAdded', type: 'success' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    // The row APPEARED in the vitrina (write-through holder = real store).
    expect(dataRows()).toHaveLength(9);
    expect(screen.getByText('aboutFieldDescriptions 4')).toBeInTheDocument();
    expect(screen.getByText('Fourth pitch')).toBeInTheDocument();
  });

  it('persist-fail: error toast, NO dispatch, modal stays open with the values', async () => {
    renderList();
    persistSpy.mockReturnValueOnce(false);

    const modal = await openAdd();
    fireEvent.change(within(modal).getByLabelText('aboutFieldDescriptions 4 · EN'), {
      target: { value: 'Not saved' },
    });
    fireEvent.change(within(modal).getByLabelText('aboutFieldDescriptions 4 · RU'), {
      target: { value: 'Не сохранится' },
    });
    fireEvent.click(within(modal).getByRole('button', { name: 'aboutSave' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'aboutSaveError', type: 'error' })
    );
    expect(updateSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(within(modal).getByLabelText('aboutFieldDescriptions 4 · EN')).toHaveValue('Not saved');
    expect(dataRows()).toHaveLength(8); // the store did NOT move
  });

  it('a stat add writes stats[key] + statLabels[key] (slug from the EN label)', async () => {
    renderList();

    const modal = await openAdd();
    fireEvent.change(within(modal).getByLabelText('adminAboutRowKindLabel'), {
      target: { value: 'stat' },
    });
    fireEvent.change(within(modal).getByLabelText('adminAboutStatLabelEn'), {
      target: { value: 'Full Stack' },
    });
    fireEvent.change(within(modal).getByLabelText('adminAboutStatLabelRu'), {
      target: { value: 'Фулл-стек' },
    });
    fireEvent.change(within(modal).getByLabelText('adminAboutStatValueEn'), {
      target: { value: '10 years' },
    });
    fireEvent.change(within(modal).getByLabelText('adminAboutStatValueRu'), {
      target: { value: '10 лет' },
    });
    fireEvent.click(within(modal).getByRole('button', { name: 'aboutSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0];
    expect(persisted?.stats['full-stack']).toEqual({ en: '10 years', ru: '10 лет' });
    expect(persisted?.statLabels?.['full-stack']).toEqual({ en: 'Full Stack', ru: 'Фулл-стек' });
    expect(addToast).toHaveBeenCalledWith({ message: 'adminAboutRowAdded', type: 'success' });
    // The new row renders with its STORED custom label (language 'en').
    await waitFor(() => expect(screen.getByText('Full Stack')).toBeInTheDocument());
    expect(screen.getByText('10 years')).toBeInTheDocument();
  });

  it('a colliding stat slug surfaces adminAboutKeyExists and never persists', async () => {
    renderList();

    // Seed the collision: add «Full Stack» once (slug `full-stack`).
    const first = await openAdd();
    fireEvent.change(within(first).getByLabelText('adminAboutRowKindLabel'), {
      target: { value: 'stat' },
    });
    fireEvent.change(within(first).getByLabelText('adminAboutStatLabelEn'), {
      target: { value: 'Full Stack' },
    });
    fireEvent.change(within(first).getByLabelText('adminAboutStatLabelRu'), {
      target: { value: 'Фулл-стек' },
    });
    fireEvent.change(within(first).getByLabelText('adminAboutStatValueEn'), {
      target: { value: '10 years' },
    });
    fireEvent.change(within(first).getByLabelText('adminAboutStatValueRu'), {
      target: { value: '10 лет' },
    });
    fireEvent.click(within(first).getByRole('button', { name: 'aboutSave' }));
    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));

    // Reopen: the same EN label must now collide with the stored key.
    const second = await openAdd();
    fireEvent.change(within(second).getByLabelText('adminAboutRowKindLabel'), {
      target: { value: 'stat' },
    });
    fireEvent.change(within(second).getByLabelText('adminAboutStatLabelEn'), {
      target: { value: 'Full Stack' },
    });
    fireEvent.change(within(second).getByLabelText('adminAboutStatLabelRu'), {
      target: { value: 'Другая метка' },
    });
    fireEvent.change(within(second).getByLabelText('adminAboutStatValueEn'), {
      target: { value: '5 years' },
    });
    fireEvent.change(within(second).getByLabelText('adminAboutStatValueRu'), {
      target: { value: '5 лет' },
    });
    fireEvent.click(within(second).getByRole('button', { name: 'aboutSave' }));

    expect(await within(second).findByRole('alert')).toHaveTextContent('adminAboutKeyExists');
    expect(persistSpy).toHaveBeenCalledTimes(1); // only the first add
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('the cta option appears once the CTA row was deleted', async () => {
    renderList();

    // Delete the CTA row first (WU-12 delete path).
    fireEvent.click(screen.getByTestId('admin-about-delete-ctaLabel'));
    const confirm = await screen.findByRole('dialog');
    fireEvent.click(within(confirm).getByRole('button', { name: 'adminAboutDeleteRow' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    const modal = await openAdd();
    const options = within(modal).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toContain('adminAboutRowKindCta');
  });
});

describe('AboutEditorList: delete row (WU-12, R-3)', () => {
  /** Open the Trash2 confirm for a row; returns the dialog element. */
  const openDelete = async (field: string) => {
    fireEvent.click(screen.getByTestId(`admin-about-delete-${field}`));
    return screen.findByRole('dialog');
  };

  it('deleting a description: subtitle names the row, focus on «Отмена», row removed', async () => {
    renderList();

    const modal = await openDelete('description-0');
    expect(
      within(modal).getByText('adminAboutDeleteRowName:aboutFieldDescriptions 1')
    ).toBeInTheDocument();
    // Opening is not acting yet.
    expect(persistSpy).not.toHaveBeenCalled();
    const cancel = within(modal).getByRole('button', { name: 'aboutCancel' });
    await waitFor(() => expect(document.activeElement).toBe(cancel));

    fireEvent.click(within(modal).getByRole('button', { name: 'adminAboutDeleteRow' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0];
    expect(persisted?.descriptions).toHaveLength(2);
    expect(persisted?.descriptions[0]).toEqual(seed.descriptions[1]);
    expect(persistSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      updateSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );
    expect(addToast).toHaveBeenCalledWith({ message: 'adminAboutRowDeleted', type: 'success' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    // The row is GONE from the vitrina (7 rows left).
    expect(dataRows()).toHaveLength(7);
  });

  it('deleting a stat removes stats[key] (addressed by key, not position)', async () => {
    renderList();

    const modal = await openDelete('stat-aboutStatYears');
    fireEvent.click(within(modal).getByRole('button', { name: 'adminAboutDeleteRow' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0];
    expect(persisted?.stats['aboutStatYears']).toBeUndefined();
    expect(Object.keys(persisted?.stats ?? {})).toHaveLength(3);
    // The other stats keep their values.
    expect(persisted?.stats.aboutStatProjects).toEqual(seed.stats.aboutStatProjects);
    await waitFor(() => expect(dataRows()).toHaveLength(7));
    expect(screen.queryByText('aboutStatYears')).not.toBeInTheDocument();
  });

  it('deleting the CTA row sets ctaLabel to null and removes the row', async () => {
    renderList();

    const modal = await openDelete('ctaLabel');
    fireEvent.click(within(modal).getByRole('button', { name: 'adminAboutDeleteRow' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(persistSpy.mock.calls[0]?.[0]?.ctaLabel).toBeNull();
    await waitFor(() => expect(dataRows()).toHaveLength(7));
    expect(screen.queryByText('aboutFieldCta')).not.toBeInTheDocument();
  });

  it('persist-fail: error toast, the confirm stays OPEN, document unchanged', async () => {
    renderList();
    persistSpy.mockReturnValueOnce(false);

    const modal = await openDelete('description-0');
    fireEvent.click(within(modal).getByRole('button', { name: 'adminAboutDeleteRow' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'aboutSaveError', type: 'error' })
    );
    expect(updateSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(dataRows()).toHaveLength(8);
  });

  it('«Отмена» closes the confirm without any action', async () => {
    renderList();

    const modal = await openDelete('description-1');
    fireEvent.click(within(modal).getByRole('button', { name: 'aboutCancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(persistSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(dataRows()).toHaveLength(8);
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
    // Reset restores the SEED document — the 8 default rows render again.
    expect(dataRows()).toHaveLength(8);
  });
});

describe('AboutEditorList: fullName scalar block (WU-5, R-2)', () => {
  it('renders ABOVE the table with the seed value, cap 80 and a pristine-disabled Save', () => {
    renderList();

    const input = screen.getByLabelText('aboutFieldFullName');
    expect(input).toHaveValue(seed.fullName);
    expect(input).toHaveAttribute('maxlength', '80');
    // Document order: the scalar block sits BEFORE the vitrina.
    const table = screen.getByRole('table');
    const followsTable =
      (input.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    expect(followsTable).toBe(true);
    expect(screen.getByRole('button', { name: 'aboutSave' })).toBeDisabled();
  });

  it('persists the merged document BEFORE dispatching and toasts aboutSaved', async () => {
    renderList();

    fireEvent.change(screen.getByLabelText('aboutFieldFullName'), {
      target: { value: 'New Name' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'aboutSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(persistSpy.mock.calls[0]?.[0]).toMatchObject({
      fullName: 'New Name',
      descriptions: seed.descriptions, // the other fields ride through
    });
    expect(persistSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      updateSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(addToast).toHaveBeenCalledWith({ message: 'aboutSaved', type: 'success' });
  });

  it('a 1-char draft surfaces aboutNameRequired and blocks the save', () => {
    renderList();

    fireEvent.change(screen.getByLabelText('aboutFieldFullName'), { target: { value: 'K' } });
    expect(screen.getByRole('alert')).toHaveTextContent('aboutNameRequired');

    fireEvent.click(screen.getByRole('button', { name: 'aboutSave' }));
    expect(persistSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('persist-fail: error toast, store untouched, the draft survives for a retry', async () => {
    renderList();

    persistSpy.mockReturnValueOnce(false);
    fireEvent.change(screen.getByLabelText('aboutFieldFullName'), {
      target: { value: 'Retry Me' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'aboutSave' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'aboutSaveError', type: 'error' })
    );
    expect(updateSpy).not.toHaveBeenCalled();
    expect(screen.getByLabelText('aboutFieldFullName')).toHaveValue('Retry Me');
  });
});
