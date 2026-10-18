// ============================================
// ContactEditorForm tests (contact-rows-crud R-3..R-6, plan rev.5 §10)
// ============================================
//
// The reworked admin surface: three collapsed-by-default Cards (Skills
// geometry), input-free table rows with Pencil/Trash2 cell actions (Jobs
// parity), add/edit row modal, delete/reset confirms with Cancel-focus and
// the persist-fail-keeps-modal-open parity, and the email's own Save.
// Harness: mocked storage/slice/react-redux, identity `t`, real selector
// against a seed-shaped state (ContactEditorForm old suite pattern).

import type { ContactContent } from '@/entities/ContactContent';
import { SOCIAL_LINKS } from '@/entities/Developer';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactEditorForm } from './ContactEditorForm';
import { createContactSeed } from '../../model/services/seed';

const { persistSpy, updateSpy, upsertSpy, removeRowSpy, resetTableSpy, addToast } = vi.hoisted(
  () => ({
    persistSpy: vi.fn((_content: ContactContent) => true),
    updateSpy: vi.fn((payload: unknown) => ({ type: 'contactContent/update', payload })),
    upsertSpy: vi.fn((payload: unknown) => ({ type: 'contactContent/upsertRow', payload })),
    removeRowSpy: vi.fn((payload: unknown) => ({ type: 'contactContent/removeRow', payload })),
    resetTableSpy: vi.fn((payload: unknown) => ({ type: 'contactContent/resetTable', payload })),
    addToast: vi.fn(),
  })
);

vi.mock('../../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/services/storage')>()),
  persistContactContent: persistSpy,
}));

vi.mock('../../model/slices/contactContentSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/contactContentSlice')>()),
  updateContactContent: updateSpy,
  upsertContactTableRow: upsertSpy,
  removeContactTableRow: removeRowSpy,
  resetContactTable: resetTableSpy,
}));

// Deterministic labels: t(key) => key (Nav.test pattern).
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

// react-redux is mocked instead of StoreProvider (features → app is a
// banned FSD hop). The real selector runs against the seed document.
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  const { createContactSeed: seed } = await import('../../model/services/seed');
  const state = { contactContent: seed() };
  return {
    ...actual,
    useSelector: (selector: (s: typeof state) => unknown) => selector(state),
    useDispatch: () => (_action: unknown) => undefined,
  };
});

const SEED = createContactSeed();

const renderForm = () => render(<ContactEditorForm />);

/** DOM order: texts, formTexts, socials — the identity t drops the name. */
const expandGroup = (index: number) => {
  const strips = screen.getAllByRole('button', { name: 'adminContactExpandGroup' });
  fireEvent.click(strips[index] as HTMLElement);
};

const emailInput = () => screen.getByLabelText('adminFieldEmail') as HTMLInputElement;
const emailSave = () => screen.getByRole('button', { name: 'contactSave' });
const lastPersisted = (): ContactContent =>
  persistSpy.mock.calls[persistSpy.mock.calls.length - 1]?.[0] as ContactContent;

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  persistSpy.mockReturnValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ContactEditorForm: collapsed cards (R-3)', () => {
  it('renders intro + email + three collapsed cards and NO tables', () => {
    renderForm();

    expect(
      screen.getByRole('heading', { level: 2, name: 'adminContactTitle' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('adminFieldEmail')).toBeInTheDocument();
    // One strip per group: texts, formTexts, socials.
    expect(screen.getAllByRole('button', { name: 'adminContactExpandGroup' })).toHaveLength(3);
    // Captions sit OUTSIDE the Cards while collapsed (Skills B1).
    expect(screen.getByTestId('contact-caption-texts')).toBeInTheDocument();
    expect(screen.getByTestId('contact-caption-formTexts')).toBeInTheDocument();
    expect(screen.getByTestId('contact-caption-socials')).toBeInTheDocument();
    expect(screen.queryAllByRole('table')).toHaveLength(0);
  });

  it('expands a group into a table and collapses back (ARA roundtrip)', () => {
    renderForm();

    expandGroup(0); // texts
    expect(screen.getByRole('table')).toBeInTheDocument();
    const collapse = screen.getByRole('button', { name: 'adminContactCollapseGroup' });
    expect(collapse).toHaveAttribute('aria-expanded', 'false');
    expect(collapse).toHaveAttribute('aria-controls', 'contact-group-content-texts');

    fireEvent.click(collapse);
    expect(screen.queryAllByRole('table')).toHaveLength(0);
    // The strip is back with aria-expanded="true" and NO dangling controls.
    const strip = screen.getAllByRole('button', { name: 'adminContactExpandGroup' });
    expect(strip).toHaveLength(3);
  });
});

describe('ContactEditorForm: table rows (R-4)', () => {
  it('texts table renders ten rows as plain strings — zero inputs in cells', () => {
    renderForm();
    expandGroup(0);

    const table = screen.getByRole('table');
    expect(table.querySelectorAll('input, textarea')).toHaveLength(0);
    // 10 data rows + the header row.
    expect(screen.getAllByRole('row')).toHaveLength(11);
    // Field labels are t(key) lookups; values are the store strings.
    expect(screen.getByText('contactDescription')).toBeInTheDocument();
  });

  it('formTexts table renders four rows', () => {
    renderForm();
    expandGroup(1);

    expect(screen.getAllByRole('row')).toHaveLength(5);
  });

  it('every row carries Pencil + Trash2 in the SAME cell (no stacking)', () => {
    renderForm();
    expandGroup(0);

    for (const key of ['sending', 'contactDescription']) {
      expect(screen.getByTestId(`contact-edit-${key}`)).toBeInTheDocument();
      expect(screen.getByTestId(`contact-delete-${key}`)).toBeInTheDocument();
    }
    // Same td = one horizontal actions cell per row (resume-table-cell-actions-row).
    expect(screen.getByTestId('contact-edit-sending').closest('td')).toBe(
      screen.getByTestId('contact-delete-sending').closest('td')
    );
  });
});

describe('ContactEditorForm: row modal (R-5)', () => {
  it('row edit opens the modal prefilled; save persists, dispatches and exits', async () => {
    renderForm();
    expandGroup(0);

    fireEvent.click(screen.getByTestId('contact-edit-sending'));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('adminContactEditRow')).toBeInTheDocument(); // title = dialog name
    expect(within(dialog).getByText('adminFieldTexts')).toBeInTheDocument(); // subtitle = table
    const keyField = within(dialog).getByLabelText('adminContactRowKey') as HTMLInputElement;
    expect(keyField).toHaveValue('sending');
    expect(keyField).toHaveAttribute('readonly');

    fireEvent.change(within(dialog).getByLabelText('adminContactRowEn'), {
      target: { value: 'Updated EN' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'contactSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = lastPersisted();
    expect(persisted.texts['sending']?.en).toBe('Updated EN');
    expect(upsertSpy).toHaveBeenCalledWith({
      table: 'texts',
      key: 'sending',
      value: expect.objectContaining({ en: 'Updated EN' }),
    });
    expect(addToast).toHaveBeenCalledWith({ message: 'contactSaved', type: 'success' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('add row appends a custom row to the target table', async () => {
    renderForm();
    expandGroup(0);

    fireEvent.click(screen.getByTestId('contact-add-texts'));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('adminContactAddRow')).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText('adminContactRowKey'), {
      target: { value: 'customRow' },
    });
    fireEvent.change(within(dialog).getByLabelText('adminContactRowEn'), {
      target: { value: 'Hi' },
    });
    fireEvent.change(within(dialog).getByLabelText('adminContactRowRu'), {
      target: { value: 'Привет' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'contactSave' }));

    await waitFor(() =>
      expect(upsertSpy).toHaveBeenCalledWith({
        table: 'texts',
        key: 'customRow',
        value: { en: 'Hi', ru: 'Привет' },
      })
    );
    const persisted = lastPersisted();
    expect(persisted.texts['customRow']).toEqual({ en: 'Hi', ru: 'Привет' });
    expect(persisted.formTexts).toEqual(SEED.formTexts); // other table untouched
  });

  it('a duplicate key is blocked inside the add modal', async () => {
    renderForm();
    expandGroup(0);

    fireEvent.click(screen.getByTestId('contact-add-texts'));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('adminContactRowKey'), {
      target: { value: 'sending' },
    });
    fireEvent.change(within(dialog).getByLabelText('adminContactRowEn'), {
      target: { value: 'Hi' },
    });
    fireEvent.change(within(dialog).getByLabelText('adminContactRowRu'), {
      target: { value: 'Привет' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'contactSave' }));

    await waitFor(() =>
      expect(within(dialog).getByText('adminContactRowKeyExists')).toBeInTheDocument()
    );
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('add modal for formTexts targets the formTexts table', async () => {
    renderForm();
    expandGroup(1);

    fireEvent.click(screen.getByTestId('contact-add-formTexts'));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('adminFieldFormTexts')).toBeInTheDocument(); // subtitle
    // R-1 (contact-row-textarea): formTexts cap = 120 on the Textareas.
    expect(within(dialog).getByLabelText('adminContactRowEn')).toHaveAttribute('maxlength', '120');
    fireEvent.change(within(dialog).getByLabelText('adminContactRowKey'), {
      target: { value: 'customToast' },
    });
    fireEvent.change(within(dialog).getByLabelText('adminContactRowEn'), {
      target: { value: 'Toast' },
    });
    fireEvent.change(within(dialog).getByLabelText('adminContactRowRu'), {
      target: { value: 'Тост' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'contactSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = lastPersisted();
    expect(persisted.formTexts['customToast']).toEqual({ en: 'Toast', ru: 'Тост' });
    expect(persisted.texts).toEqual(SEED.texts); // texts untouched
  });
});

describe('ContactEditorForm: confirmations (R-6)', () => {
  it('delete opens a named confirm with Cancel focused; Cancel persists nothing', async () => {
    renderForm();
    expandGroup(0);

    fireEvent.click(screen.getByTestId('contact-delete-sending'));
    const dialog = screen.getByRole('dialog');
    // Title === confirm-button label (Skills parity) — assert the HEADING.
    expect(
      within(dialog).getByRole('heading', { name: 'adminContactDeleteRow' })
    ).toBeInTheDocument();
    expect(within(dialog).getByText('adminContactDeleteRowName')).toBeInTheDocument(); // subtitle
    // The focus lands on «Отмена» via initialFocusRef (async — waitFor).
    await waitFor(() =>
      expect(document.activeElement).toBe(
        within(dialog).getByRole('button', { name: 'contactCancel' })
      )
    );

    fireEvent.click(within(dialog).getByRole('button', { name: 'contactCancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('delete confirm removes the row from the table only', async () => {
    renderForm();
    expandGroup(0);

    fireEvent.click(screen.getByTestId('contact-delete-sending'));
    fireEvent.click(within(screen.getByRole('dialog')).getByTestId('contact-delete-confirm'));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = lastPersisted();
    expect(persisted.texts['sending']).toBeUndefined();
    expect(Object.keys(persisted.texts)).toHaveLength(Object.keys(SEED.texts).length - 1);
    expect(persisted.formTexts).toEqual(SEED.formTexts);
    expect(removeRowSpy).toHaveBeenCalledWith({ table: 'texts', key: 'sending' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('persist failure keeps the confirm modal open and toasts the error', async () => {
    persistSpy.mockReturnValue(false);
    renderForm();
    expandGroup(0);

    fireEvent.click(screen.getByTestId('contact-delete-sending'));
    fireEvent.click(within(screen.getByRole('dialog')).getByTestId('contact-delete-confirm'));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'contactSaveError', type: 'error' })
    );
    expect(removeRowSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument(); // still open
  });

  it('reset restores the seed rows of THAT table only', async () => {
    renderForm();
    expandGroup(0);

    // Make the reset observable: add a custom row first.
    fireEvent.click(screen.getByTestId('contact-add-texts'));
    fireEvent.change(within(screen.getByRole('dialog')).getByLabelText('adminContactRowKey'), {
      target: { value: 'customRow' },
    });
    fireEvent.change(within(screen.getByRole('dialog')).getByLabelText('adminContactRowEn'), {
      target: { value: 'Hi' },
    });
    fireEvent.change(within(screen.getByRole('dialog')).getByLabelText('adminContactRowRu'), {
      target: { value: 'Привет' },
    });
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'contactSave' })
    );
    await waitFor(() => expect(upsertSpy).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByTestId('contact-reset-texts'));
    const dialog = screen.getByRole('dialog');
    // Title === confirm-button label (Skills parity) — assert the HEADING.
    expect(
      within(dialog).getByRole('heading', { name: 'adminContactResetRows' })
    ).toBeInTheDocument();
    expect(within(dialog).getByText('adminContactResetRowsConfirm')).toBeInTheDocument(); // subtitle
    fireEvent.click(within(dialog).getByTestId('contact-reset-confirm'));

    await waitFor(() => expect(resetTableSpy).toHaveBeenCalledWith({ table: 'texts' }));
    const persisted = lastPersisted();
    expect(Object.keys(persisted.texts)).toEqual(Object.keys(SEED.texts)); // customRow gone
    expect(persisted.formTexts).toEqual(SEED.formTexts); // other table intact
    expect(persisted.email).toBe(SEED.email);
  });
});

describe('ContactEditorForm: socials card (R-4/D8)', () => {
  it('expands into a read-only table without any actions', () => {
    renderForm();
    expandGroup(2);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(SOCIAL_LINKS.length + 1);
    // Read-only decision B: no row actions, no Add/Reset header buttons.
    expect(screen.queryAllByTestId(/^contact-edit-/)).toHaveLength(0);
    expect(screen.queryAllByTestId(/^contact-delete-/)).toHaveLength(0);
    expect(screen.queryByTestId('contact-actions-socials')).not.toBeInTheDocument();
  });
});

describe('ContactEditorForm: email field (D6)', () => {
  it('Save is disabled while pristine and on an invalid address', () => {
    renderForm();

    expect(emailSave()).toBeDisabled();

    fireEvent.change(emailInput(), { target: { value: 'not-an-email' } });
    expect(screen.getByText('contactEmailInvalid')).toBeInTheDocument();
    expect(emailSave()).toBeDisabled();

    fireEvent.change(emailInput(), { target: { value: 'other@example.com' } });
    expect(screen.queryByText('contactEmailInvalid')).not.toBeInTheDocument();
    expect(emailSave()).toBeEnabled();
  });

  it('valid save persists a merged snapshot through the full-replace action', async () => {
    renderForm();

    fireEvent.change(emailInput(), { target: { value: 'other@example.com' } });
    fireEvent.click(emailSave());

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = lastPersisted();
    expect(persisted.email).toBe('other@example.com');
    expect(persisted.texts).toEqual(SEED.texts); // only the scalar changed
    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ email: 'other@example.com' }));
    expect(addToast).toHaveBeenCalledWith({ message: 'contactSaved', type: 'success' });
  });

  it('persist failure toasts the error and leaves the store action unemitted', async () => {
    persistSpy.mockReturnValue(false);
    renderForm();

    fireEvent.change(emailInput(), { target: { value: 'other@example.com' } });
    fireEvent.click(emailSave());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'contactSaveError', type: 'error' })
    );
    expect(updateSpy).not.toHaveBeenCalled();
    expect(emailInput()).toHaveValue('other@example.com'); // draft kept
  });
});
