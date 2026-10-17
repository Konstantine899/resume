// ============================================
// TechnologiesList tests (technologies-crud SPEC, WU-3)
// ============================================
//
// RED-first contract (gold standard: SkillsEditorList + plan D6):
// - flat rows from the store, windowed by the container (technologies-
//   pagination: sizes 5/10/20, default 20 — MyWork pilot rule);
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
    // Gotcha resume-projects-crud: the mock MUST mutate the holder for
    // removeTechnology — otherwise the delete-then-clamp tests observe a
    // frozen catalog (the re-render comes from closeModal's setState).
    useDispatch: () => (action: { type?: string; payload?: string }) => {
      if (action?.type === 'technologies/removeTechnology' && typeof action.payload === 'string') {
        const key = action.payload;
        holder.state.technologies = holder.state.technologies.filter(
          (tech: Technology) => tech.key !== key
        );
      }
      return action;
    },
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

  // ---- technologies-pagination epic (owner directive 2026-10-16) --------
  //
  // Container contract (MyWork pilot rule): the LIST owns {page, pageSize}
  // (sizes 5/10/20, default 20), windows the rows as a render-time
  // derivation (no setState-in-effect) and renders the kit PageSizeGroup
  // + kit Pagination ABOVE the table, under the «Add» header.

  const catalogOf14: Technology[] = Array.from({ length: 14 }, (_, index) => ({
    key: `tech-${index + 1}`,
    url: `https://cdn.example.com/tech-${index + 1}.svg`,
  }));

  describe('pagination', () => {
    const root = () => screen.getByTestId('technologies-list');
    const sizeGroup = () => within(root()).getByRole('group', { name: 'perPageLabel' });
    const pagination = () => within(root()).getByRole('navigation', { name: 'paginationNav' });
    const table = () => within(root()).getByRole('table');
    const currentPage = () => pagination().querySelector('[aria-current="page"]');

    beforeEach(() => {
      holder.state.technologies = [...catalogOf14];
    });

    it('shows ALL 14 records at the default size 20 (single page)', () => {
      render(<TechnologiesList />);

      expect(screen.getAllByTestId(/^tech-row-/)).toHaveLength(14);
      expect(within(sizeGroup()).getByRole('button', { name: '20' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      expect(within(pagination()).getByLabelText('paginationNext')).toBeDisabled();
    });

    it('offers 5/10/20 sizes; picking 5 windows the rows across pages 2/3', () => {
      render(<TechnologiesList />);

      const group = sizeGroup();
      for (const size of ['5', '10', '20']) {
        expect(within(group).getByRole('button', { name: size })).toBeInTheDocument();
      }

      fireEvent.click(within(group).getByRole('button', { name: '5' }));
      expect(screen.getAllByTestId(/^tech-row-/)).toHaveLength(5);
      expect(within(group).getByRole('button', { name: '5' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );

      // Page 3 carries the TAIL of the catalog (14 = 5 + 5 + 4).
      fireEvent.click(within(pagination()).getByText('3'));
      expect(screen.getAllByTestId(/^tech-row-/)).toHaveLength(4);
      expect(screen.getByTestId('tech-row-tech-11')).toBeInTheDocument();
      expect(screen.getByTestId('tech-row-tech-14')).toBeInTheDocument();
      expect(screen.queryByTestId('tech-row-tech-10')).not.toBeInTheDocument();
    });

    it('switching the page size resets the window to page 1', () => {
      render(<TechnologiesList />);

      fireEvent.click(within(sizeGroup()).getByRole('button', { name: '5' }));
      fireEvent.click(within(pagination()).getByLabelText('paginationNext'));
      expect(currentPage()).toHaveTextContent('2');

      fireEvent.click(within(sizeGroup()).getByRole('button', { name: '10' }));

      expect(currentPage()).toHaveTextContent('1');
      expect(screen.getByTestId('tech-row-tech-1')).toBeInTheDocument();
      expect(screen.queryByTestId('tech-row-tech-11')).not.toBeInTheDocument();
    });

    it('deleting the last row on the last page clamps back into range (no effect)', async () => {
      holder.state.technologies = Array.from({ length: 6 }, (_, index) => ({
        key: `tech-${index + 1}`,
        url: `https://cdn.example.com/tech-${index + 1}.svg`,
      })) as Technology[];

      render(<TechnologiesList />);
      fireEvent.click(within(sizeGroup()).getByRole('button', { name: '5' }));
      fireEvent.click(within(pagination()).getByLabelText('paginationNext'));
      expect(currentPage()).toHaveTextContent('2');
      expect(screen.getByTestId('tech-row-tech-6')).toBeInTheDocument();

      // Delete the ONLY row of the last page.
      fireEvent.click(
        within(rowActions('tech-6')).getByRole('button', { name: 'adminTechnologiesDelete' })
      );
      fireEvent.click(
        within(confirmModal()).getByRole('button', { name: 'adminTechnologiesDelete' })
      );
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

      // 5 records fit ONE page — the view derives back into range at render.
      expect(currentPage()).toHaveTextContent('1');
      expect(screen.getByTestId('tech-row-tech-1')).toBeInTheDocument();
      expect(within(pagination()).getByLabelText('paginationNext')).toBeDisabled();
    });

    it('renders the size group AND the pagination ABOVE the table', () => {
      render(<TechnologiesList />);

      // DOM order: page-size control → Pagination → table (FOLLOWING bit).
      const FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
      expect(sizeGroup().compareDocumentPosition(pagination()) & FOLLOWING).toBe(FOLLOWING);
      expect(pagination().compareDocumentPosition(table()) & FOLLOWING).toBe(FOLLOWING);
    });

    it('keeps the key-column sort toggle (asc → desc → none, aria-sort marked)', () => {
      render(<TechnologiesList />);

      const header = () => within(table()).getByRole('columnheader', { name: 'adminTechTableKey' });
      const rowKeys = () =>
        Array.from(document.querySelectorAll('[data-testid^="tech-row-"]')).map((node) =>
          node.getAttribute('data-testid')
        );

      const sortButton = within(table()).getByRole('button', { name: 'adminTechTableKey' });
      fireEvent.click(sortButton);
      // localeCompare order — NOT insertion order (tech-1 < tech-10 < …).
      expect(header()).toHaveAttribute('aria-sort', 'ascending');
      expect(rowKeys().indexOf('tech-row-tech-10')).toBeLessThan(
        rowKeys().indexOf('tech-row-tech-2')
      );

      fireEvent.click(sortButton);
      expect(header()).toHaveAttribute('aria-sort', 'descending');
      expect(rowKeys()[0]).toBe('tech-row-tech-9');

      fireEvent.click(sortButton);
      expect(header()).not.toHaveAttribute('aria-sort');
      expect(rowKeys()[0]).toBe('tech-row-tech-1');
      expect(rowKeys()[1]).toBe('tech-row-tech-2');
    });
  });
});
