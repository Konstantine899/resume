import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TechnologyForm } from './TechnologyForm';
import type { SkillTechnology } from '@/entities/Skill';

const { persistSpy, addToast, dispatchMock, holder, addTechnologySpy, updateTechnologySpy } =
  vi.hoisted(() => ({
    persistSpy: vi.fn((_data: unknown[]) => true),
    addSpy: vi.fn((payload: unknown) => ({ type: 'adminSkills/addTechnology', payload })),
    updateSpy: vi.fn((payload: unknown) => ({ type: 'adminSkills/updateTechnology', payload })),
    addToast: vi.fn(),
    dispatchMock: vi.fn((_action: unknown) => undefined),
    holder: {
      state: {
        adminSkills: [
          {
            category: 'frontend',
            categoryName: 'Frontend',
            technologies: [{ name: 'React', iconSvg: 'react', techKey: 'react' }],
          },
        ],
      },
    },
    addTechnologySpy: vi.fn((payload: unknown) => payload),
    updateTechnologySpy: vi.fn((payload: unknown) => payload),
  }));

vi.mock('../../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/services/storage')>()),
  persistSkills: persistSpy,
}));

vi.mock('../../model/slices/skillsSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/skillsSlice')>()),
  addTechnology: addTechnologySpy,
  updateTechnology: updateTechnologySpy,
}));

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

vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: unknown) => unknown) => selector(holder.state),
    useDispatch: () => dispatchMock,
  };
});

describe('TechnologyForm (single-source selector)', () => {
  beforeEach(() => {
    persistSpy.mockReset();
    persistSpy.mockReturnValue(true);
    dispatchMock.mockClear();
    addToast.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('keeps Save disabled until a technology is selected', () => {
    render(<TechnologyForm categoryId="frontend" />);
    expect(screen.getByRole('button', { name: 'skillsSave' })).toBeDisabled();
  });

  it('enables Save after selecting a catalog technology', () => {
    render(<TechnologyForm categoryId="frontend" />);
    fireEvent.change(screen.getByLabelText('skillsSelectTechnology'), {
      target: { value: 'react' },
    });
    expect(screen.getByRole('button', { name: 'skillsSave' })).toBeEnabled();
  });

  it('persist before dispatch on create save', async () => {
    render(<TechnologyForm categoryId="frontend" />);
    fireEvent.change(screen.getByLabelText('skillsSelectTechnology'), {
      target: { value: 'nodejs' },
    });
    fireEvent.submit(screen.getByTestId('technology-form'));
    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(dispatchMock).toHaveBeenCalledTimes(1);
    expect(addToast).toHaveBeenCalled();
  });

  it('shows persistence error and avoids dispatch on persist failure', async () => {
    persistSpy.mockReturnValue(false);
    render(<TechnologyForm categoryId="frontend" />);
    fireEvent.change(screen.getByLabelText('skillsSelectTechnology'), {
      target: { value: 'nodejs' },
    });
    fireEvent.submit(screen.getByTestId('technology-form'));
    await waitFor(() => expect(addToast).toHaveBeenCalled());
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it('renders inverted catalog icon and allows cancel', () => {
    const onExitEdit = vi.fn();
    render(
      <TechnologyForm
        categoryId="frontend"
        technology={
          {
            name: 'React',
            iconSvg: 'react',
            techKey: 'react',
            invertInDark: false,
          } as SkillTechnology
        }
        onExitEdit={onExitEdit}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'skillsCancel' }));
    expect(onExitEdit).toHaveBeenCalledTimes(1);
  });

  it('duplicate selected key blocks persisting', async () => {
    persistSpy.mockReturnValue(true);
    render(<TechnologyForm categoryId="frontend" technology={undefined} />);
    fireEvent.change(screen.getByLabelText('skillsSelectTechnology'), {
      target: { value: 'react' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'skillsSave' }));
    await waitFor(() => expect(persistSpy).not.toHaveBeenCalled());
  });
});
