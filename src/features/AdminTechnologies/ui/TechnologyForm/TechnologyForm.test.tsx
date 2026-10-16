// ============================================
// TechnologyForm tests (technologies-crud SPEC, WU-3)
// ============================================
//
// RED-first contract (gold standard: AdminSkills TechnologyForm):
// - create/edit inside the flat catalog; §validation mapped to i18n keys
//   (bad slug → adminTechKeyInvalid, duplicate → adminTechKeyExists,
//   non-https url → adminTechUrlInvalid);
// - D7: the key is IMMUTABLE in edit mode — the Input is disabled AND the
//   edit zod schema is `z.literal(originalKey)`, so even a forced DOM
//   change cannot rename the record (update stays keyed by the original);
// - persist BEFORE dispatch (§3), Toast feedback, exit-edit on success.

import type { Technology } from '@/entities/Technology';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TechnologyForm } from './TechnologyForm';

const { persistSpy, addSpy, updateSpy, addToast, holder } = vi.hoisted(() => ({
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
}));

vi.mock('@/entities/Technology', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/Technology')>()),
  persistTechnologies: persistSpy,
  addTechnology: addSpy,
  updateTechnology: updateSpy,
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
const urlInput = () => screen.getByLabelText('adminTechIconUrlLabel');
const invertSelect = () => screen.getByLabelText('adminTechInvertLabel');
const submitButton = () => screen.getByRole('button', { name: 'adminTechSave' });

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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('create mode: Save starts disabled and enables when dirty', () => {
    render(<TechnologyForm />);

    expect(submitButton()).toBeDisabled();
    fireEvent.change(keyInput(), { target: { value: 'vue' } });
    expect(submitButton()).toBeEnabled();
  });

  it('create mode: shows adminTechKeyInvalid for a non-slug key and persists nothing', async () => {
    render(<TechnologyForm />);
    fireEvent.change(keyInput(), { target: { value: 'React 19' } });
    fireEvent.change(urlInput(), {
      target: { value: 'https://cdn.example.com/vue.svg' },
    });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('adminTechKeyInvalid');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('create mode: shows adminTechKeyExists for a duplicate key', async () => {
    render(<TechnologyForm />);
    fireEvent.change(keyInput(), { target: { value: 'react' } });
    fireEvent.change(urlInput(), {
      target: { value: 'https://cdn.example.com/react-2.svg' },
    });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('adminTechKeyExists');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('create mode: shows adminTechUrlInvalid for a non-https url', async () => {
    render(<TechnologyForm />);
    fireEvent.change(keyInput(), { target: { value: 'vue' } });
    fireEvent.change(urlInput(), { target: { value: 'http://cdn.example.com/vue.svg' } });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('adminTechUrlInvalid');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('create mode: valid Save runs persist BEFORE dispatch and exits (A7)', async () => {
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
    fireEvent.change(keyInput(), { target: { value: 'vue' } });
    fireEvent.change(urlInput(), {
      target: {
        value: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
      },
    });
    fireEvent.change(invertSelect(), { target: { value: 'true' } });

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'adminTechSaved' }))
    );
    expect(calls).toEqual(['persist', 'dispatch']);
    expect(persistSpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ key: 'react' }),
        expect.objectContaining({
          key: 'vue',
          url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
          invertInDark: true,
        }),
      ])
    );
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'vue', invertInDark: true })
    );
    expect(onExitEdit).toHaveBeenCalled();
  });

  it('create mode: persist failure shows adminTechPersistError and skips dispatch', async () => {
    persistSpy.mockReturnValue(false);

    render(<TechnologyForm />);
    fireEvent.change(keyInput(), { target: { value: 'vue' } });
    fireEvent.change(urlInput(), {
      target: { value: 'https://cdn.example.com/vue.svg' },
    });

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
    expect(urlInput()).toHaveValue('https://cdn.example.com/react.svg');
    expect(invertSelect()).toHaveValue('true');
  });

  it('edit mode: a forced key change is rejected by the schema — nothing persists', async () => {
    render(
      <TechnologyForm technology={{ key: 'react', url: 'https://cdn.example.com/react.svg' }} />
    );
    // jsdom does not enforce the disabled attribute on synthetic events —
    // exactly why D7 needs the zod literal in ADDITION to the disabled Input.
    fireEvent.change(keyInput(), { target: { value: 'hacked' } });
    fireEvent.change(urlInput(), {
      target: { value: 'https://cdn.example.com/react-2.svg' },
    });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('adminTechKeyInvalid');
    expect(persistSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('edit mode: valid Save persists the next array and updates keyed by the ORIGINAL key', async () => {
    const calls: string[] = [];
    persistSpy.mockImplementation(() => {
      calls.push('persist');
      return true;
    });
    updateSpy.mockImplementation((payload: unknown) => {
      calls.push('dispatch');
      return { type: 'technologies/updateTechnology', payload };
    });
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
    fireEvent.change(urlInput(), {
      target: { value: 'https://cdn.example.com/react-19.svg' },
    });
    fireEvent.change(invertSelect(), { target: { value: 'true' } });

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'adminTechSaved' }))
    );
    expect(calls).toEqual(['persist', 'dispatch']);
    expect(persistSpy).toHaveBeenCalledWith([
      {
        key: 'react',
        url: 'https://cdn.example.com/react-19.svg',
        invertInDark: true,
      },
    ]);
    expect(updateSpy).toHaveBeenCalledWith({
      key: 'react',
      patch: { url: 'https://cdn.example.com/react-19.svg', invertInDark: true },
    });
    expect(onExitEdit).toHaveBeenCalled();
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
