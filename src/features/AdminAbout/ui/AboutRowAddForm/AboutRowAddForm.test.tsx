// ============================================
// AboutRowAddForm tests (admin-about-table WU-12, SPEC R-2 / D11)
// ============================================
//
// RED-first contract for the add-row modal form:
// - the kit Select picks the row kind (description | stat | cta — the cta
//   option exists ONLY when `canAddCta`, i.e. the CTA row is currently
//   deleted);
// - every kind renders its D11 fields (description → EN/RU Textarea 600
//   with the auto-label «Описание N», N = length + 1; stat → label EN/RU +
//   value EN/RU ≤60; cta → EN/RU ≤40);
// - validation rides the SHARED slices (caps from the entity contract) plus
//   the slug collision refine (adminAboutKeyExists / adminAboutKeyInvalid);
// - Save is disabled while pristine; a valid submit hands the BUILT PAYLOAD
//   (stat key = slug of the EN label) to `onAdd`; a seam failure (false)
//   keeps the form mounted (the modal stays open — R-2).
// The form owns NO redux/storage — persist-THEN-dispatch lives in the list
// behind `onAdd` (AboutFieldEditForm parity).

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AboutContent } from '@/entities/AboutContent';
import { createAboutSeed } from '../../model/services/seed';
import { AboutRowAddForm } from './AboutRowAddForm';
import type { AboutRowPayload } from '../AboutEditorList/lib/fieldSchemas';

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

const onAdd = vi.fn((_payload: AboutRowPayload) => true);
const onExitAdd = vi.fn();

const seed = createAboutSeed();

/** A document that already owns the `full-stack` custom stat (collision). */
const collisionDoc: AboutContent = {
  ...seed,
  stats: { ...seed.stats, 'full-stack': { en: '10 years', ru: '10 лет' } },
  statLabels: { 'full-stack': { en: 'Full Stack', ru: 'Фулл-стек' } },
};

const renderForm = ({
  document = seed,
  canAddCta = false,
}: { document?: AboutContent; canAddCta?: boolean } = {}) =>
  render(
    <AboutRowAddForm
      document={document}
      canAddCta={canAddCta}
      onAdd={onAdd}
      onExitAdd={onExitAdd}
    />
  );

const saveButton = () => screen.getByRole('button', { name: 'aboutSave' });
const cancelButton = () => screen.getByRole('button', { name: 'aboutCancel' });
const kindSelect = () => screen.getByLabelText('adminAboutRowKindLabel');

beforeEach(() => {
  vi.clearAllMocks();
  onAdd.mockReturnValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('AboutRowAddForm: kind Select (D11)', () => {
  it('offers description+stat by default; cta only when canAddCta', () => {
    const { unmount } = renderForm();
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'adminAboutRowKindDescription',
      'adminAboutRowKindStat',
    ]);

    unmount();
    renderForm({ canAddCta: true });
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'adminAboutRowKindDescription',
      'adminAboutRowKindStat',
      'adminAboutRowKindCta',
    ]);
  });

  it('switching the kind swaps the fields and resets the form to pristine', () => {
    renderForm();

    fireEvent.change(screen.getByLabelText('aboutFieldDescriptions 4 · EN'), {
      target: { value: 'Typed' },
    });
    expect(saveButton()).toBeEnabled();

    fireEvent.change(kindSelect(), { target: { value: 'stat' } });

    // The stat form is mounted, the description value is gone, Save resets.
    expect(screen.getByLabelText('adminAboutStatLabelEn')).toBeInTheDocument();
    expect(screen.queryByLabelText('aboutFieldDescriptions 4 · EN')).not.toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });
});

describe('AboutRowAddForm: description kind (D11)', () => {
  it('renders TWO textareas with the auto-label «Описание N» (N = length + 1), cap 600', () => {
    renderForm();

    const label = 'aboutFieldDescriptions 4'; // seed ships 3 paragraphs
    expect(screen.getByLabelText(`${label} · EN`)).toBeInTheDocument();
    expect(screen.getByLabelText(`${label} · RU`)).toBeInTheDocument();
    expect(screen.getByLabelText(`${label} · EN`)).toHaveAttribute('maxlength', '600');
    expect(document.querySelectorAll('input')).toHaveLength(0); // Select is a native <select>
  });

  it('pristine Save is disabled; a valid submit hands the payload and exits', async () => {
    renderForm();

    expect(saveButton()).toBeDisabled();
    fireEvent.change(screen.getByLabelText('aboutFieldDescriptions 4 · EN'), {
      target: { value: 'Fourth pitch' },
    });
    fireEvent.change(screen.getByLabelText('aboutFieldDescriptions 4 · RU'), {
      target: { value: 'Четвёртый питч' },
    });
    fireEvent.click(saveButton());

    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1));
    expect(onAdd).toHaveBeenCalledWith({
      kind: 'description',
      value: { en: 'Fourth pitch', ru: 'Четвёртый питч' },
    });
    await waitFor(() => expect(onExitAdd).toHaveBeenCalledTimes(1));
  });

  it('an empty locale surfaces aboutParagraphEmpty and never hands the payload', async () => {
    renderForm();

    // RU first (real edit → Save enables), then clear EN: the empty locale
    // must surface the shared-slice message on submit.
    fireEvent.change(screen.getByLabelText('aboutFieldDescriptions 4 · RU'), {
      target: { value: 'Заполнено' },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('aboutParagraphEmpty');
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('a seam failure (onAdd → false) keeps the form mounted with the values', async () => {
    onAdd.mockReturnValue(false);
    renderForm();

    fireEvent.change(screen.getByLabelText('aboutFieldDescriptions 4 · EN'), {
      target: { value: 'Retry me' },
    });
    fireEvent.change(screen.getByLabelText('aboutFieldDescriptions 4 · RU'), {
      target: { value: 'Ещё раз' },
    });
    fireEvent.click(saveButton());

    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1));
    expect(onExitAdd).not.toHaveBeenCalled();
    expect(screen.getByLabelText('aboutFieldDescriptions 4 · EN')).toHaveValue('Retry me');
  });
});

describe('AboutRowAddForm: stat kind (D11 — label + value, slug key)', () => {
  const fillStat = (labelEn: string) => {
    fireEvent.change(kindSelect(), { target: { value: 'stat' } });
    fireEvent.change(screen.getByLabelText('adminAboutStatLabelEn'), {
      target: { value: labelEn },
    });
    fireEvent.change(screen.getByLabelText('adminAboutStatLabelRu'), {
      target: { value: 'Фулл-стек' },
    });
    fireEvent.change(screen.getByLabelText('adminAboutStatValueEn'), {
      target: { value: '10 years' },
    });
    fireEvent.change(screen.getByLabelText('adminAboutStatValueRu'), {
      target: { value: '10 лет' },
    });
  };

  it('renders label EN/RU + value EN/RU inputs, cap 60', () => {
    renderForm();

    fireEvent.change(kindSelect(), { target: { value: 'stat' } });

    expect(screen.getByLabelText('adminAboutStatLabelEn')).toHaveAttribute('maxlength', '60');
    expect(screen.getByLabelText('adminAboutStatLabelRu')).toHaveAttribute('maxlength', '60');
    expect(screen.getByLabelText('adminAboutStatValueEn')).toHaveAttribute('maxlength', '60');
    expect(screen.getByLabelText('adminAboutStatValueRu')).toHaveAttribute('maxlength', '60');
    expect(document.querySelectorAll('textarea')).toHaveLength(0);
  });

  it('hands the payload with the SLUG key derived from the EN label', async () => {
    renderForm();

    fillStat('Full Stack Developer');
    fireEvent.click(saveButton());

    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1));
    expect(onAdd).toHaveBeenCalledWith({
      kind: 'stat',
      key: 'full-stack-developer',
      label: { en: 'Full Stack Developer', ru: 'Фулл-стек' },
      value: { en: '10 years', ru: '10 лет' },
    });
    await waitFor(() => expect(onExitAdd).toHaveBeenCalledTimes(1));
  });

  it('a slug colliding with an existing key surfaces adminAboutKeyExists', async () => {
    renderForm({ document: collisionDoc });

    fillStat('Full Stack'); // slugs to `full-stack` — already taken
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('adminAboutKeyExists');
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('a non-latin label yields an empty slug → adminAboutKeyInvalid', async () => {
    renderForm();

    fillStat('Опыт'); // no [a-z0-9] characters
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('adminAboutKeyInvalid');
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('an empty value locale surfaces aboutStatRequired', async () => {
    renderForm();

    fillStat('React');
    fireEvent.change(screen.getByLabelText('adminAboutStatValueRu'), { target: { value: '' } });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('aboutStatRequired');
    expect(onAdd).not.toHaveBeenCalled();
  });
});

describe('AboutRowAddForm: cta kind (D11)', () => {
  it('renders EN/RU inputs, cap 40 and hands the payload on submit', async () => {
    renderForm({ canAddCta: true });

    fireEvent.change(kindSelect(), { target: { value: 'cta' } });
    expect(screen.getByLabelText('aboutFieldCta · EN')).toHaveAttribute('maxlength', '40');

    fireEvent.change(screen.getByLabelText('aboutFieldCta · EN'), { target: { value: 'Hire me' } });
    fireEvent.change(screen.getByLabelText('aboutFieldCta · RU'), { target: { value: 'Нанять' } });
    fireEvent.click(saveButton());

    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1));
    expect(onAdd).toHaveBeenCalledWith({
      kind: 'cta',
      value: { en: 'Hire me', ru: 'Нанять' },
    });
    await waitFor(() => expect(onExitAdd).toHaveBeenCalledTimes(1));
  });

  it('an empty CTA locale surfaces aboutCtaRequired', async () => {
    renderForm({ canAddCta: true });

    fireEvent.change(kindSelect(), { target: { value: 'cta' } });
    fireEvent.change(screen.getByLabelText('aboutFieldCta · EN'), {
      target: { value: 'Hire me' },
    });
    fireEvent.click(saveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('aboutCtaRequired');
    expect(onAdd).not.toHaveBeenCalled();
  });
});

describe('AboutRowAddForm: cancel (R-2)', () => {
  it('Cancel exits without handing any payload', () => {
    renderForm();

    fireEvent.click(cancelButton());

    expect(onExitAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).not.toHaveBeenCalled();
  });
});
