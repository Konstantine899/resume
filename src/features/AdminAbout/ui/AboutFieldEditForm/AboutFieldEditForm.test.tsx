// ============================================
// AboutFieldEditForm tests (admin-about-table WU-4, SPEC R-3/R-7)
// ============================================
//
// RED-first contract for the per-field modal form (AdminJobs FieldEditForm
// parity): the rendered CONTROL matches the field kind (Textarea for the
// description rows, Input for stats/ctaLabel/fullName), the resolver is the
// SHARED `aboutFieldSchema(field)` slice (caps/min re-issued under the
// about* i18n keys), Save is disabled while pristine, a successful submit
// hands the PARSED values to the vitrina's save seam (`onSave`) and a seam
// failure (false) keeps the form mounted. The form owns NO redux/storage —
// persist-THEN-dispatch lives in the list behind `onSave` (WU-2 seam).
//
// The RHF prefill reaches the DOM because every control passes an explicit
// `value` over `register` (resume-contact-rows-crud: register-prefill alone
// leaves jsdom inputs empty).

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAboutSeed } from '../../model/services/seed';
import { AboutFieldEditForm } from './AboutFieldEditForm';
import type { EditAboutField } from '../AboutEditorList/lib/fieldSchemas';

// Identity t(): raw keys in assertions (Nav.test pattern).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
    isTransitioning: false,
  }),
}));

const onSave = vi.fn((_field: EditAboutField, _value: unknown) => true);
const onExitEdit = vi.fn();

const seed = createAboutSeed();

const renderForm = (field: EditAboutField) =>
  render(
    <AboutFieldEditForm field={field} document={seed} onSave={onSave} onExitEdit={onExitEdit} />
  );

/** The form's Save/Cancel pair (footer-less — the form renders its own). */
const saveButton = () => screen.getByRole('button', { name: 'aboutSave' });
const cancelButton = () => screen.getByRole('button', { name: 'aboutCancel' });

beforeEach(() => {
  vi.clearAllMocks();
  onSave.mockReturnValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AboutFieldEditForm: per-field control (WU-4, R-3)', () => {
  it('a description row renders TWO textareas (EN/RU) with the paragraph label', () => {
    renderForm('description-0');

    const textareas = document.querySelectorAll('textarea');
    expect(textareas).toHaveLength(2);
    expect(document.querySelectorAll('input')).toHaveLength(0);
    expect(screen.getByLabelText('aboutFieldDescriptions · EN')).toBeInTheDocument();
    expect(screen.getByLabelText('aboutFieldDescriptions · RU')).toBeInTheDocument();
    // Prefill = the seed paragraph (explicit value over register).
    expect(screen.getByLabelText('aboutFieldDescriptions · EN')).toHaveValue(
      seed.descriptions[0]?.en
    );
    expect(screen.getByLabelText('aboutFieldDescriptions · EN')).toHaveAttribute(
      'maxlength',
      '600'
    );
  });

  it('a stat row renders TWO inputs with the STAT KEY label and cap 60', () => {
    renderForm('stat-1');

    expect(document.querySelectorAll('textarea')).toHaveLength(0);
    expect(document.querySelectorAll('input')).toHaveLength(2);
    expect(screen.getByLabelText('aboutStatProjects · EN')).toBeInTheDocument();
    expect(screen.getByLabelText('aboutStatProjects · RU')).toHaveValue(
      seed.stats.aboutStatProjects.ru
    );
    expect(screen.getByLabelText('aboutStatProjects · EN')).toHaveAttribute('maxlength', '60');
  });

  it('ctaLabel renders TWO inputs with the CTA label and cap 40', () => {
    renderForm('ctaLabel');

    expect(screen.getByLabelText('aboutFieldCta · EN')).toBeInTheDocument();
    expect(screen.getByLabelText('aboutFieldCta · RU')).toHaveValue(seed.ctaLabel.ru);
    expect(screen.getByLabelText('aboutFieldCta · EN')).toHaveAttribute('maxlength', '40');
  });

  it('fullName renders ONE scalar input (cap 80) prefilled from the document', () => {
    renderForm('fullName');

    expect(document.querySelectorAll('input')).toHaveLength(1);
    expect(screen.getByLabelText('aboutFieldFullName')).toHaveValue(seed.fullName);
    expect(screen.getByLabelText('aboutFieldFullName')).toHaveAttribute('maxlength', '80');
  });
});

describe('AboutFieldEditForm: pristine gate + cancel (WU-4)', () => {
  it('Save is disabled while pristine and enables on the first edit', () => {
    renderForm('stat-0');

    expect(saveButton()).toBeDisabled();
    fireEvent.change(screen.getByLabelText('aboutStatYears · EN'), {
      target: { value: '10+ years' },
    });
    expect(saveButton()).toBeEnabled();
  });

  it('Cancel exits without calling onSave', () => {
    renderForm('description-1');

    fireEvent.click(cancelButton());

    expect(onExitEdit).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe('AboutFieldEditForm: validation through the shared slices (WU-4)', () => {
  it('an empty description locale surfaces aboutParagraphEmpty and never saves', async () => {
    renderForm('description-2');

    fireEvent.change(screen.getByLabelText('aboutFieldDescriptions · EN'), {
      target: { value: '' },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('aboutParagraphEmpty');
    expect(onSave).not.toHaveBeenCalled();
    expect(onExitEdit).not.toHaveBeenCalled();
  });

  it('a 601-char description (over the entity cap) surfaces aboutParagraphEmpty', async () => {
    renderForm('description-0');

    fireEvent.change(screen.getByLabelText('aboutFieldDescriptions · EN'), {
      target: { value: 'x'.repeat(601) },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('aboutParagraphEmpty');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('an empty stat locale surfaces aboutStatRequired', async () => {
    renderForm('stat-2');

    fireEvent.change(screen.getByLabelText('aboutStatUsers · RU'), {
      target: { value: '' },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('aboutStatRequired');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('an empty CTA locale surfaces aboutCtaRequired', async () => {
    renderForm('ctaLabel');

    fireEvent.change(screen.getByLabelText('aboutFieldCta · RU'), {
      target: { value: '' },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('aboutCtaRequired');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('a 1-char fullName surfaces aboutNameRequired (min 2)', async () => {
    renderForm('fullName');

    fireEvent.change(screen.getByLabelText('aboutFieldFullName'), { target: { value: 'K' } });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('aboutNameRequired');
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe('AboutFieldEditForm: submit → save seam (WU-4, R-3)', () => {
  it('a valid description submit hands the PARSED values to onSave and exits', async () => {
    renderForm('description-0');

    fireEvent.change(screen.getByLabelText('aboutFieldDescriptions · EN'), {
      target: { value: 'Fresh paragraph' },
    });
    fireEvent.click(saveButton());

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith('description-0', {
      en: 'Fresh paragraph',
      ru: seed.descriptions[0]?.ru,
    });
    await waitFor(() => expect(onExitEdit).toHaveBeenCalledTimes(1));
  });

  it('a valid stat submit passes the LocalizedText slice', async () => {
    renderForm('stat-3');

    fireEvent.change(screen.getByLabelText('aboutStatRemote · EN'), {
      target: { value: '100% remote' },
    });
    fireEvent.click(saveButton());

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith('stat-3', {
      en: '100% remote',
      ru: seed.stats.aboutStatRemote.ru,
    });
  });

  it('a valid fullName submit passes the trimmed scalar', async () => {
    renderForm('fullName');

    fireEvent.change(screen.getByLabelText('aboutFieldFullName'), {
      target: { value: '  New Name  ' },
    });
    fireEvent.click(saveButton());

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith('fullName', 'New Name');
  });

  it('a seam failure (onSave → false) keeps the form mounted (modal stays open)', async () => {
    onSave.mockReturnValue(false);
    renderForm('ctaLabel');

    fireEvent.change(screen.getByLabelText('aboutFieldCta · EN'), { target: { value: 'Go!' } });
    fireEvent.click(saveButton());

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    // The parent did NOT close us — the dialog keeps the user's values.
    expect(onExitEdit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('aboutFieldCta · EN')).toHaveValue('Go!');
  });
});
