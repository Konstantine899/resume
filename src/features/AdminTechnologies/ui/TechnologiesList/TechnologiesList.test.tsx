// ============================================
// TechnologiesList tests (technologies-crud SPEC, WU-3)
// ============================================
//
// RED-first contract (gold standard: SkillsEditorList + plan D6):
// - flat DataTable rows from the store (PAGE_SIZE = 12, sort by key);
// - row actions: Pencil → onEditTechnology(key), Trash2 → confirm modal
//   whose subtitle NAMES the key (OPEN-10 parity);
// - D6 guard: a key in `usedKeys` (any project references it) CANNOT be
//   deleted — `adminTechDeleteInUse` renders INSIDE the still-open modal,
//   nothing is persisted or dispatched;
// - storage failure keeps the modal open (OPEN-9 parity);
// - empty catalog → EmptyState.

import type { Technology } from '@/entities/Technology';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TechnologiesList } from './TechnologiesList';

const { persistSpy, removeSpy, addToast, holder } = vi.hoisted(() => ({
  persistSpy: vi.fn((_data: unknown[]) => true),
  removeSpy: vi.fn((key: string) => ({ type: 'technologies/removeTechnology', payload: key })),
  addToast: vi.fn(),
  holder: {
    state: {
      technologies: [
        {
          key: 'react',
          url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        },
        {
          key: 'nextjs',
          url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
          invertInDark: true,
        },
      ] as Technology[],
    },
  },
}));

vi.mock('@/entities/Technology', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/Technology')>()),
  persistTechnologies: persistSpy,
  removeTechnology: removeSpy,
}));

// Identity t with options — the confirm subtitle must name the key.
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

vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: typeof holder.state) => unknown) => selector(holder.state),
    useDispatch: () => (_action: unknown) => undefined,
  };
});

const rowActions = (key: string) => screen.getByTestId(`tech-actions-${key}`);
const confirmModal = () => screen.getByRole('dialog');

describe('TechnologiesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    holder.state.technologies = [
      {
        key: 'react',
        url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      },
      {
        key: 'nextjs',
        url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
        invertInDark: true,
      },
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders one row per store record with the icon url', () => {
    render(<TechnologiesList />);

    expect(screen.getByTestId('tech-row-react')).toBeInTheDocument();
    expect(screen.getByTestId('tech-row-nextjs')).toBeInTheDocument();
    expect(screen.getByTestId('tech-icon-react')).toHaveAttribute(
      'src',
      'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'
    );
  });

  it('«Add» calls onAddTechnology', () => {
    const onAddTechnology = vi.fn();
    render(<TechnologiesList onAddTechnology={onAddTechnology} />);

    fireEvent.click(screen.getByRole('button', { name: 'adminTechnologiesAdd' }));

    expect(onAddTechnology).toHaveBeenCalled();
  });

  it('Pencil calls onEditTechnology with the row key', () => {
    const onEditTechnology = vi.fn();
    render(<TechnologiesList onEditTechnology={onEditTechnology} />);

    fireEvent.click(
      within(rowActions('nextjs')).getByRole('button', { name: 'adminTechnologiesEdit' })
    );

    expect(onEditTechnology).toHaveBeenCalledWith('nextjs');
  });

  it('Trash2 opens a confirm modal whose subtitle NAMES the key', () => {
    render(<TechnologiesList />);

    fireEvent.click(
      within(rowActions('react')).getByRole('button', { name: 'adminTechnologiesDelete' })
    );

    expect(within(confirmModal()).getByText('adminTechConfirmDelete:react')).toBeInTheDocument();
  });

  it('confirm delete: persist BEFORE dispatch, toast, modal closes, callback fires', async () => {
    const calls: string[] = [];
    persistSpy.mockImplementation(() => {
      calls.push('persist');
      return true;
    });
    removeSpy.mockImplementation((key: string) => {
      calls.push('dispatch');
      return { type: 'technologies/removeTechnology', payload: key };
    });
    const onTechnologyDeleted = vi.fn();

    render(<TechnologiesList onTechnologyDeleted={onTechnologyDeleted} />);
    fireEvent.click(
      within(rowActions('react')).getByRole('button', { name: 'adminTechnologiesDelete' })
    );
    fireEvent.click(
      within(confirmModal()).getByRole('button', { name: 'adminTechnologiesDelete' })
    );

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'adminTechDeleted' })
      )
    );
    expect(calls).toEqual(['persist', 'dispatch']);
    expect(persistSpy).toHaveBeenCalledWith([expect.objectContaining({ key: 'nextjs' })]);
    expect(removeSpy).toHaveBeenCalledWith('react');
    expect(onTechnologyDeleted).toHaveBeenCalledWith('react');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('D6 guard: a used key cannot be deleted — error INSIDE the open modal, nothing touched', async () => {
    render(<TechnologiesList usedKeys={new Set(['react'])} />);

    fireEvent.click(
      within(rowActions('react')).getByRole('button', { name: 'adminTechnologiesDelete' })
    );
    fireEvent.click(
      within(confirmModal()).getByRole('button', { name: 'adminTechnologiesDelete' })
    );

    expect(await within(confirmModal()).findByRole('alert')).toHaveTextContent(
      'adminTechDeleteInUse'
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(persistSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
    expect(addToast).not.toHaveBeenCalled();
  });

  it('an UNUSED key deletes fine even when usedKeys is provided', async () => {
    render(<TechnologiesList usedKeys={new Set(['react'])} />);

    fireEvent.click(
      within(rowActions('nextjs')).getByRole('button', { name: 'adminTechnologiesDelete' })
    );
    fireEvent.click(
      within(confirmModal()).getByRole('button', { name: 'adminTechnologiesDelete' })
    );

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'adminTechDeleted' })
      )
    );
    expect(removeSpy).toHaveBeenCalledWith('nextjs');
  });

  it('storage failure keeps the modal open and skips dispatch', async () => {
    persistSpy.mockReturnValue(false);

    render(<TechnologiesList />);
    fireEvent.click(
      within(rowActions('react')).getByRole('button', { name: 'adminTechnologiesDelete' })
    );
    fireEvent.click(
      within(confirmModal()).getByRole('button', { name: 'adminTechnologiesDelete' })
    );

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'adminTechPersistError', type: 'error' })
      )
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it('Cancel closes the confirm modal without deleting', () => {
    render(<TechnologiesList />);
    fireEvent.click(
      within(rowActions('react')).getByRole('button', { name: 'adminTechnologiesDelete' })
    );

    fireEvent.click(within(confirmModal()).getByRole('button', { name: 'adminTechCancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('empty catalog renders the EmptyState', () => {
    holder.state.technologies = [];
    render(<TechnologiesList />);

    expect(screen.getByText('adminTechnologiesEmpty')).toBeInTheDocument();
    expect(screen.queryByTestId('tech-row-react')).not.toBeInTheDocument();
  });
});
