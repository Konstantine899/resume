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

// WU-14 (R-7): BOTH seams are spied at the module boundary — the mutation
// (the file's react-redux mock has no api middleware, so `initiate` is
// faked and `.unwrap()` is the branch under test) and the file write (the
// real File-System-Access root must never run in tests).
const { initiateSpy, updateAboutContentInitiate, uploadImage, directoryPickerSupported } =
  vi.hoisted(() => ({
    initiateSpy: vi.fn<
      (arg: { content: AboutContent; persist: (doc: unknown) => boolean }) => {
        unwrap: () => Promise<{ document: unknown }>;
      }
    >(),
    updateAboutContentInitiate: vi.fn((doc: unknown) => ({
      unwrap: async () => {
        if (!persistSpy(doc as AboutContent)) throw new Error('persist-failed');
        return doc;
      },
    })),
    uploadImage: vi.fn(async () => ({
      ok: true,
      file: { key: 'portrait-key', width: 1200, height: 900, variants: [] },
    })),
    directoryPickerSupported: vi.fn(() => true),
  }));

vi.mock('@/shared/api', () => ({
  apiSlice: {
    endpoints: {
      updateAboutContent: { initiate: updateAboutContentInitiate },
      updateAboutPortrait: { initiate: initiateSpy },
    },
  },
}));

vi.mock('@/shared/lib/imageDir', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/imageDir')>()),
  isDirectoryPickerSupported: directoryPickerSupported,
}));

vi.mock('@/shared/lib/imageUpload', () => ({
  uploadImage,
}));

// The Avatar preview is asserted by SRC — the real kit Image keeps it out
// of the DOM (About.test WU-13 recipe).
vi.mock('@/shared/ui/Image', () => ({
  Image: ({ src }: { src?: string }) => <div data-testid="mock-image" data-src={src ?? ''} />,
}));

const confirmSpy = vi.spyOn(window, 'confirm');

const seed = createAboutSeed();

/**
 * WU-19 (R-11): the vitrina Card is COLLAPSED by default — the legacy
 * suites that look at the table OR the fullName block open it first
 * (amend 3 moved `.nameRow` inside; resume-skills-card-collapse helper
 * pattern); the WU-19 suite below renders RAW instead.
 */
const expandTable = () => {
  fireEvent.click(screen.getByTestId('admin-about-table-expand'));
};

/**
 * WU-18 (R-10): legacy suites assert the FULL document (8 rows, tail rows
 * like the CTA, whole-row button counts) — the default 5-row window would
 * hide half of it. Pick size 20 to take pagination out of their way; the
 * pagination suite below renders the card EXPANDED at the default size.
 */
const showAllRows = () => {
  fireEvent.click(
    within(screen.getByRole('group', { name: 'perPageLabel' })).getByRole('button', {
      name: '20',
    })
  );
};

const renderList = () => {
  render(<AboutEditorList />);
  expandTable();
  showAllRows();
};

/** The vitrina body rows (the header row is excluded). */
const dataRows = () => document.querySelectorAll<HTMLTableRowElement>('tbody tr');

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  holder.content = createAboutSeed();
  persistSpy.mockReturnValue(true);
  confirmSpy.mockReturnValue(false);
  global.fetch = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ fullName: 'Seed Name' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  ) as unknown as typeof fetch;
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
    // fullName scalar block ABOVE the table, INSIDE the card (WU-5, R-2;
    // amend 3 — renderList expanded it first).
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

// ============================================
// WU-18 vitrina pagination (SPEC R-10 / D18)
// ============================================
//
// Container contract (TechnologiesList #272 parity): the LIST owns
// {page, pageSize} (sizes 5/10/20, DEFAULT 5) and windows the rows as a
// RENDER-TIME derivation (no setState-in-effect — react-hooks v7); kit
// PageSizeGroup sits ABOVE the table, kit Pagination BELOW it; picking a
// size resets the window to page 1; a shrinking document clamps back
// into range during render (no effect).
//
// These tests render the card EXPANDED at the default size (WU-19
// collapses it); the legacy suites below go through `renderList`, which
// takes pagination out of their way (size 20 = the full document).

describe('AboutEditorList: vitrina pagination (WU-18, R-10/D18)', () => {
  const root = () => screen.getByTestId('about-editor-list');
  const sizeGroup = () => within(root()).getByRole('group', { name: 'perPageLabel' });
  const pagination = () => within(root()).getByRole('navigation', { name: 'paginationNav' });
  const table = () => within(root()).getByRole('table');
  const currentPage = () => pagination().querySelector('[aria-current="page"]');

  /** Expanded card at the DEFAULT size 5 — the window under test. */
  const renderExpanded = () => {
    render(<AboutEditorList />);
    fireEvent.click(screen.getByTestId('admin-about-table-expand'));
  };

  it('windows the 8-row seed to 5 rows by default with exactly 2 pages', () => {
    renderExpanded();

    // Default size 5 → page 1 = the 3 descriptions + the first 2 stats.
    expect(dataRows()).toHaveLength(5);
    const labels = Array.from(dataRows()).map((row) => row.cells[0]?.textContent);
    expect(labels).toEqual([
      'aboutFieldDescriptions 1',
      'aboutFieldDescriptions 2',
      'aboutFieldDescriptions 3',
      'aboutStatYears',
      'aboutStatProjects',
    ]);

    // 8 rows / 5 per page → exactly TWO pages: «1» is current, «2» exists,
    // «3» does not; the next edge stays enabled (more pages ahead).
    expect(currentPage()).toHaveTextContent('1');
    expect(within(pagination()).getByText('2')).toBeInTheDocument();
    expect(within(pagination()).queryByText('3')).not.toBeInTheDocument();
    expect(within(pagination()).getByLabelText('paginationNext')).toBeEnabled();
    expect(within(sizeGroup()).getByRole('button', { name: '5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('clicking page «2» shows the remaining 3 rows', () => {
    renderExpanded();

    fireEvent.click(within(pagination()).getByText('2'));

    expect(currentPage()).toHaveTextContent('2');
    // Page 2 = the tail of the document: stats 3..4 + the CTA row.
    expect(dataRows()).toHaveLength(3);
    const labels = Array.from(dataRows()).map((row) => row.cells[0]?.textContent);
    expect(labels).toEqual(['aboutStatUsers', 'aboutStatRemote', 'aboutFieldCta']);
    expect(within(pagination()).getByLabelText('paginationNext')).toBeDisabled();
  });

  it('size 20 shows ALL 8 rows and resets a page-2 window back to page 1', () => {
    renderExpanded();

    fireEvent.click(within(pagination()).getByText('2'));
    expect(currentPage()).toHaveTextContent('2');

    fireEvent.click(within(sizeGroup()).getByRole('button', { name: '20' }));

    expect(dataRows()).toHaveLength(8);
    expect(currentPage()).toHaveTextContent('1');
    expect(within(sizeGroup()).getByRole('button', { name: '20' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(within(pagination()).getByLabelText('paginationNext')).toBeDisabled();
  });

  it('renders the size group ABOVE the table and the pagination BELOW it', () => {
    renderExpanded();

    // DOM order: page-size control → table → Pagination (FOLLOWING bit).
    const FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
    expect(sizeGroup().compareDocumentPosition(table()) & FOLLOWING).toBe(FOLLOWING);
    expect(table().compareDocumentPosition(pagination()) & FOLLOWING).toBe(FOLLOWING);
  });

  it('deleting the only row of the last page clamps back into range at render', async () => {
    // 6 descriptions → 11 rows = pages 5 + 5 + 1; the CTA row is ALONE on
    // page 3, so removing it shrinks the document below the current page.
    holder.content = {
      ...seed,
      descriptions: [
        ...seed.descriptions,
        { en: 'Fourth pitch', ru: 'Четвёртый питч' },
        { en: 'Fifth pitch', ru: 'Пятый питч' },
        { en: 'Sixth pitch', ru: 'Шестой питч' },
      ],
    };

    renderExpanded();
    fireEvent.click(within(pagination()).getByText('3'));
    expect(currentPage()).toHaveTextContent('3');
    expect(dataRows()).toHaveLength(1);

    // Delete the ONLY row of the last page through the real confirm flow.
    fireEvent.click(screen.getByTestId('admin-about-delete-ctaLabel'));
    const confirm = await screen.findByRole('dialog');
    fireEvent.click(within(confirm).getByRole('button', { name: 'adminAboutDeleteRow' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // 10 rows fit TWO pages — the view derives back into range at render
    // (clamp = pure derivation, no setState-in-effect).
    expect(currentPage()).toHaveTextContent('2');
    expect(dataRows()).toHaveLength(5);
    expect(within(pagination()).queryByText('3')).not.toBeInTheDocument();
  });
});

// ============================================
// WU-19 table card collapsed by default (SPEC R-11 / D19, amend 3)
// ============================================
//
// Controls + table + pagination + the fullName scalar block live in a kit
// Card (Skills collapse geometry) that is COLLAPSED by default: the card
// body is the expand strip; the header and the modals stay OUTSIDE the
// card and are always available, while the fullName block is INSIDE and
// hidden with the table (owner amendment 2026-10-20 — SPEC D19/R-11
// правка 3). ARIA per SPEC D19 (APG disclosure semantics): the strip
// (collapsed) carries aria-expanded="false" + aria-controls on the
// STABLE content id (the target div stays mounted so the idref never
// dangles — axe 4.1.3 lesson resume-skills-card-collapse); the Minus
// control (expanded) carries aria-expanded="true" WITHOUT aria-controls.
// These tests render the RAW component — the legacy suites below go
// through `renderList`, which expands the card first.

describe('AboutEditorList: table card collapsed by default (WU-19, R-11/D19)', () => {
  const root = () => screen.getByTestId('about-editor-list');
  const pagination = () => within(root()).getByRole('navigation', { name: 'paginationNav' });
  const sizeGroup = () => within(root()).getByRole('group', { name: 'perPageLabel' });

  it('hides the table AND the fullName block by default; the header stays outside the card', () => {
    render(<AboutEditorList />);

    // Collapsed: NO table, NO pagination controls, NO fullName block…
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'paginationNav' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'perPageLabel' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('aboutFieldFullName')).not.toBeInTheDocument();

    // …but the strip IS there, correctly wired (aria-controls target
    // resolves even while collapsed — no dangling idref).
    const expand = screen.getByTestId('admin-about-table-expand');
    expect(screen.getByTestId('admin-about-table-card')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'adminAboutExpandTable' })).toBe(expand);
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    expect(expand).toHaveAttribute('aria-controls', 'about-editor-table-content');
    expect(document.getElementById('about-editor-table-content')).not.toBeNull();

    // Header (h2 + add/reset) stays OUTSIDE the card and available while
    // it is collapsed (R-11); the fullName block moved INSIDE (amend 3).
    expect(screen.getByRole('heading', { level: 2, name: 'adminAboutTitle' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'adminAboutAddRow' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'aboutReset' })).toBeInTheDocument();
  });

  it('expand shows table + size group + pagination; collapse removes them again', () => {
    render(<AboutEditorList />);

    fireEvent.click(screen.getByTestId('admin-about-table-expand'));

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(sizeGroup()).toBeInTheDocument();
    expect(pagination()).toBeInTheDocument();
    const collapse = screen.getByTestId('admin-about-table-collapse');
    expect(screen.getByRole('button', { name: 'adminAboutCollapseTable' })).toBe(collapse);
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
    expect(collapse).not.toHaveAttribute('aria-controls');
    expect(screen.queryByTestId('admin-about-table-expand')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('admin-about-table-collapse'));

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    const expandAgain = screen.getByTestId('admin-about-table-expand');
    expect(expandAgain).toHaveAttribute('aria-expanded', 'false');
    expect(expandAgain).toHaveAttribute('aria-controls', 'about-editor-table-content');
  });

  // Amend 3 (owner 2026-10-20, SPEC D19/R-11): the fullName scalar block
  // moved INSIDE the card, ABOVE the table — it is hidden with the table
  // and its Save arms exactly as before (dirty + valid).
  it('shows the fullName block INSIDE the card above the table on expand; collapse hides it again', () => {
    render(<AboutEditorList />);

    // Collapsed: the block is not in the DOM at all.
    expect(screen.queryByLabelText('aboutFieldFullName')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('admin-about-table-expand'));

    const input = screen.getByLabelText('aboutFieldFullName');
    expect(input).toHaveValue(seed.fullName);
    // Document order INSIDE the card: fullName comes BEFORE the table.
    const table = screen.getByRole('table');
    expect(input.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    // The block lives inside the aria-controls content region itself.
    expect(document.getElementById('about-editor-table-content')?.contains(input)).toBe(true);

    // Save behaves as before: pristine → disabled, dirty → enabled.
    const save = screen.getByRole('button', { name: 'aboutSave' });
    expect(save).toBeDisabled();
    fireEvent.change(input, { target: { value: 'New Name' } });
    expect(save).toBeEnabled();

    fireEvent.click(screen.getByTestId('admin-about-table-collapse'));

    expect(screen.queryByLabelText('aboutFieldFullName')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('the pagination window survives the collapse roundtrip (D18: state lives in the container)', () => {
    render(<AboutEditorList />);

    fireEvent.click(screen.getByTestId('admin-about-table-expand'));
    fireEvent.click(within(pagination()).getByText('2'));
    expect(pagination().querySelector('[aria-current="page"]')).toHaveTextContent('2');

    // The content unmounts on collapse…
    fireEvent.click(screen.getByTestId('admin-about-table-collapse'));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    // …but {page, pageSize} are container state — the window is restored.
    fireEvent.click(screen.getByTestId('admin-about-table-expand'));
    expect(pagination().querySelector('[aria-current="page"]')).toHaveTextContent('2');
    expect(within(sizeGroup()).getByRole('button', { name: '5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(dataRows()).toHaveLength(3);
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

// ============================================
// WU-20 portrait modal (SPEC R-12 / D20; WU-14 contract inside)
// ============================================
//
// The inline `.portraitRow` block is GONE (D20): the header trigger
// (`admin-about-portrait-button`, between «Добавить строку» and
// «Сбросить», OUTSIDE the collapsed card) opens a kit Modal whose TITLE
// is its accessible name (`adminAboutPortraitTitle`). Inside, top→bottom:
// the SAME WU-14 upload contract (FileUpload .jpg/.png + error branches +
// staged Save/Cancel) and the SAVED portrait preview as the vitrina figure
// box (D20 amend 4 — 3:4 aspect, 320px tall, centered; the D14 portrait
// variant is size-less, the consumer class owns the box; the staged pick
// previews inside FileUpload itself).
//
// Two phases are pinned separately: the FILE write (abstract
// `uploadPortrait` op → { name, path }, subdir `about`) and the DOCUMENT
// mutation (RTK Query `updateAboutPortrait` only — the storage seam rides
// the arg, persist-THEN-dispatch). The REAL kit FileUpload runs, so the
// jsdom pipeline gets the FileUpload.test stubs (no image decoding, canvas
// backend or object URLs in jsdom); URL is stubbed via `class extends URL`
// — `Object.create(URL)` breaks zod v4's `new URL` (resume-*)).
describe('AboutEditorList: portrait modal (WU-20, R-12/D20)', () => {
  /** jsdom never decodes pixels — controllable Image stand-in. */
  class FakeImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    naturalWidth = 1200;
    naturalHeight = 1600;
    set src(_value: string) {
      setTimeout(() => this.onload?.(), 0);
    }
  }

  /** Object URLs are absent in jsdom; subclassing keeps `new URL()` alive. */
  class FakeURL extends URL {
    static createObjectURL = () => 'blob:preview';
    static revokeObjectURL = () => undefined;
  }

  /** The dialog's accessible NAME is its title (aria-dialog-name, D20). */
  const portraitDialog = () => screen.getByRole('dialog', { name: 'adminAboutPortraitTitle' });

  const openPortraitModal = () => {
    fireEvent.click(screen.getByTestId('admin-about-portrait-button'));
    return portraitDialog();
  };

  const savePortraitButton = () =>
    within(portraitDialog()).getByRole('button', { name: 'adminAboutPortraitSave' });
  const fileInput = () => portraitDialog().querySelector('input[type="file"]') as HTMLInputElement;
  const stageFile = (file: File) => {
    fireEvent.change(fileInput(), { target: { files: [file] } });
  };

  /**
   * Raw render (the card stays collapsed — the trigger lives in the header,
   * R-12) + the modal opened, which is where the WU-14 contract now lives.
   */
  const renderWithPortraitModal = () => {
    render(<AboutEditorList />);
    return openPortraitModal();
  };

  beforeEach(() => {
    vi.stubGlobal('Image', FakeImage);
    vi.stubGlobal('URL', FakeURL);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as ReturnType<HTMLCanvasElement['getContext']>);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (
      callback: BlobCallback
    ) {
      callback(new Blob(['compressed'], { type: 'image/webp' }));
    });
    // Defaults for the two spied seams; tests override per branch.
    initiateSpy.mockImplementation(() => ({ unwrap: () => Promise.resolve({ document: {} }) }));
    uploadImage.mockResolvedValue({
      ok: true,
      file: { key: 'portrait-key', width: 1200, height: 900, variants: [] },
    });
    directoryPickerSupported.mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('has no inline portrait block; the header trigger (visible while collapsed) opens the named dialog with FileUpload + preview inside', () => {
    render(<AboutEditorList />);

    // D20/R-12: the inline block is gone from the page entirely…
    expect(screen.queryByTestId('admin-about-portrait')).not.toBeInTheDocument();
    expect(screen.queryByTestId('admin-about-portrait-preview')).not.toBeInTheDocument();

    // …but the trigger sits in the header, available while the card is
    // collapsed (D19: header stays outside the card).
    const trigger = screen.getByTestId('admin-about-portrait-button');
    expect(trigger).toHaveTextContent('adminAboutPortraitEdit');
    // Document order: «Добавить строку» → avatar trigger → «Сбросить».
    const addRow = screen.getByRole('button', { name: 'adminAboutAddRow' });
    const reset = screen.getByRole('button', { name: 'aboutReset' });
    expect(addRow.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(trigger.compareDocumentPosition(reset) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);

    fireEvent.click(trigger);

    const dialog = portraitDialog();
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole('group', { name: 'adminAboutPortraitLabel' })
    ).toBeInTheDocument();
    expect(within(dialog).getByTestId('admin-about-portrait-preview')).toBeInTheDocument();
  });

  it('ESC closes the portrait dialog', async () => {
    renderWithPortraitModal();

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('wires the native picker to .jpg/.png and rejects other formats with adminAboutPortraitFormat', async () => {
    renderWithPortraitModal();

    expect(fileInput()).toHaveAttribute('accept', '.jpg,.jpeg,.png,.webp');
    stageFile(new File(['x'], 'anim.gif', { type: 'image/gif' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('adminAboutPortraitFormat');
    // Rejected BEFORE any pipeline/storage work — nothing staged.
    expect(uploadImage).not.toHaveBeenCalled();
    expect(initiateSpy).not.toHaveBeenCalled();
    expect(savePortraitButton()).toBeDisabled();
  });

  // The kit gate accepts by BOTH extension and MIME (spec D15) — these three
  // formats must never reach the picker's pipeline.
  it.each([['anim.gif', 'image/gif']])(
    'rejects %s (%s) without staging the file',
    async (name, type) => {
      renderWithPortraitModal();

      stageFile(new File(['x'], name, { type }));

      expect(await screen.findByRole('alert')).toHaveTextContent('adminAboutPortraitFormat');
      expect(uploadImage).not.toHaveBeenCalled();
      expect(savePortraitButton()).toBeDisabled();
    }
  );

  it('rejects a .jpg carrying the legacy image/jpg MIME (no staging)', async () => {
    renderWithPortraitModal();

    stageFile(new File(['x'], 'me.jpg', { type: 'image/png' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('adminAboutPortraitFormat');
    expect(uploadImage).not.toHaveBeenCalled();
    expect(savePortraitButton()).toBeDisabled();
  });

  it('Save runs the RTK Query mutation with the feature persist seam, then dispatches + toasts', async () => {
    renderWithPortraitModal();

    stageFile(new File(['x'], 'me.png', { type: 'image/png' }));
    await waitFor(() => expect(savePortraitButton()).toBeEnabled());

    fireEvent.click(savePortraitButton());

    await waitFor(() => expect(initiateSpy).toHaveBeenCalledTimes(1));
    expect(initiateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ portrait: 'portrait-key' }),
        persist: expect.any(Function),
      })
    );
    // The seam injected into shared IS the feature's storage module.
    const arg = initiateSpy.mock.calls[0]?.[0];
    await expect(arg?.persist(arg.content)).resolves.toBe(true);
    expect(persistSpy).toHaveBeenCalledWith(expect.objectContaining({ portrait: 'portrait-key' }));

    await waitFor(() =>
      expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ portrait: 'portrait-key' }))
    );
    expect(addToast).toHaveBeenCalledWith({ message: 'aboutSaved', type: 'success' });
    expect(holder.content?.portrait).toBe('portrait-key');
    // D16: the modal preview follows the SAVED document.
    expect(within(portraitDialog()).getByTestId('mock-image')).toHaveAttribute(
      'data-src',
      'portrait-key'
    );
    // Staged state cleared — Save disables again.
    expect(savePortraitButton()).toBeDisabled();
  });

  it('persist-fail: the mutation rejects → error toast, store untouched, staged file kept, dialog open', async () => {
    initiateSpy.mockImplementation(() => ({
      unwrap: () => Promise.reject(new Error('persist-failed')),
    }));
    renderWithPortraitModal();

    stageFile(new File(['x'], 'me.png', { type: 'image/png' }));
    await waitFor(() => expect(savePortraitButton()).toBeEnabled());
    fireEvent.click(savePortraitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'aboutSaveError', type: 'error' })
    );
    expect(updateSpy).not.toHaveBeenCalled();
    expect(holder.content?.portrait).toBeUndefined();
    // The staged pick survives for a retry (Save still enabled)…
    expect(savePortraitButton()).toBeEnabled();
    // …and the dialog stays open (R-12 fail-branch parity).
    expect(portraitDialog()).toBeInTheDocument();
  });

  it('a failed file write surfaces adminAboutPortraitSaveError and stages nothing', async () => {
    uploadImage.mockRejectedValueOnce(new Error('disk full'));
    renderWithPortraitModal();

    stageFile(new File(['x'], 'me.png', { type: 'image/png' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('adminAboutPortraitSaveError');
    expect(initiateSpy).not.toHaveBeenCalled();
    expect(savePortraitButton()).toBeDisabled();
  });

  it('previews the SAVED portrait path in the modal (D16)', () => {
    holder.content = { ...createAboutSeed(), portrait: '/images/about/me.png' };
    renderWithPortraitModal();

    expect(within(portraitDialog()).getByTestId('mock-image')).toHaveAttribute(
      'data-src',
      '/images/about/me.png'
    );
  });

  it('falls back to the static bundled asset while the document has no portrait (D16)', () => {
    renderWithPortraitModal();

    const src = within(portraitDialog()).getByTestId('mock-image').getAttribute('data-src') ?? '';
    expect(src).toMatch(/\.webp$/);
  });
});
