// ============================================
// TechnologyForm tests (WU-5, plan_skills_crud §7)
// ============================================
//
// RED-first contract: create/edit inside a category, §7 validation
// mapped to i18n keys (duplicate name → skillsErrTechExists, icon →
// skillsErrIcon, filter → skillsErrFilter), persist BEFORE dispatch (§3),
// Toast feedback, exit-edit on success.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SkillCategoryData } from '@/entities/Skill';
import { TechnologyForm } from './TechnologyForm';

const { persistSpy, addSpy, updateSpy, addToast, holder } = vi.hoisted(() => ({
  persistSpy: vi.fn((_data: unknown[]) => true),
  addSpy: vi.fn((payload: unknown) => ({ type: 'adminSkills/addTechnology', payload })),
  updateSpy: vi.fn((payload: unknown) => ({ type: 'adminSkills/updateTechnology', payload })),
  addToast: vi.fn(),
  holder: {
    state: {
      adminSkills: [
        {
          category: 'frontend',
          categoryName: 'Frontend',
          technologies: [{ name: 'React', iconSvg: 'react' }],
        },
      ] as SkillCategoryData[],
    },
  },
}));

vi.mock('../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/services/storage')>()),
  persistSkills: persistSpy,
}));

vi.mock('../model/slices/skillsSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/slices/skillsSlice')>()),
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
// hop; REAL selectors run against whatever state the test installs.
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: typeof holder.state) => unknown) => selector(holder.state),
    useDispatch: () => (_action: unknown) => undefined,
  };
});

const nameInput = () => screen.getByLabelText('skillsTechnologyName');
const iconSelect = () => screen.getByLabelText('skillsIcon');
const filterInput = () => screen.getByLabelText('skillsIconFilter');
const invertToggle = () => screen.getByLabelText('skillsInvertInDark');
const submitButton = () => screen.getByRole('button', { name: 'skillsSave' });

describe('TechnologyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    holder.state.adminSkills = [
      {
        category: 'frontend',
        categoryName: 'Frontend',
        technologies: [{ name: 'React', iconSvg: 'react' }],
      },
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('create mode: Save starts disabled and enables when dirty', () => {
    render(<TechnologyForm categoryId="frontend" />);

    expect(submitButton()).toBeDisabled();
    fireEvent.change(nameInput(), { target: { value: 'Vue' } });
    expect(submitButton()).toBeEnabled();
  });

  it('create mode: shows skillsErrTechName for a short name', async () => {
    render(<TechnologyForm categoryId="frontend" />);
    fireEvent.change(nameInput(), { target: { value: 'V' } });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('skillsErrTechName');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('create mode: shows skillsErrTechExists for a duplicate inside the category', async () => {
    render(<TechnologyForm categoryId="frontend" />);
    fireEvent.change(nameInput(), { target: { value: 'React' } });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('skillsErrTechExists');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('create mode: shows skillsErrFilter for a filter without brightness(/invert(', async () => {
    render(<TechnologyForm categoryId="frontend" />);
    fireEvent.change(nameInput(), { target: { value: 'Vue' } });
    fireEvent.change(filterInput(), { target: { value: 'blur(2px)' } });

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('skillsErrFilter');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('create mode: persists BEFORE dispatch and confirms with skillsSaved', async () => {
    const calls: string[] = [];
    persistSpy.mockImplementation(() => {
      calls.push('persist');
      return true;
    });
    addSpy.mockImplementation((payload: unknown) => {
      calls.push('dispatch');
      return { type: 'adminSkills/addTechnology', payload };
    });

    render(<TechnologyForm categoryId="frontend" />);
    fireEvent.change(nameInput(), { target: { value: 'Vue' } });
    fireEvent.change(iconSelect(), { target: { value: 'nextjs' } });
    fireEvent.click(invertToggle());

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'skillsSaved' }))
    );
    expect(calls).toEqual(['persist', 'dispatch']);
    expect(addSpy).toHaveBeenCalledWith({
      categoryId: 'frontend',
      technology: expect.objectContaining({ name: 'Vue', iconSvg: 'nextjs', invertInDark: true }),
    });
  });

  it('create mode: persist failure shows skillsPersistError and skips dispatch', async () => {
    persistSpy.mockReturnValue(false);

    render(<TechnologyForm categoryId="frontend" />);
    fireEvent.change(nameInput(), { target: { value: 'Vue' } });
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'skillsPersistError', type: 'error' })
      )
    );
    expect(addSpy).not.toHaveBeenCalled();
    expect(nameInput()).toHaveValue('Vue');
  });

  it('edit mode: pre-fills the record and dispatches an update keyed by the ORIGINAL name', async () => {
    const onExitEdit = vi.fn();
    render(
      <TechnologyForm
        categoryId="frontend"
        technology={{ name: 'React', iconSvg: 'react' }}
        onExitEdit={onExitEdit}
      />
    );

    expect(nameInput()).toHaveValue('React');
    expect(submitButton()).toBeDisabled();

    fireEvent.change(nameInput(), { target: { value: 'React 19' } });
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(updateSpy).toHaveBeenCalledWith({
        categoryId: 'frontend',
        techName: 'React',
        patch: expect.objectContaining({ name: 'React 19' }),
      })
    );
    await waitFor(() => expect(onExitEdit).toHaveBeenCalled());
  });

  it('edit mode: allows keeping the record’s own name (not a duplicate)', async () => {
    render(
      <TechnologyForm
        categoryId="frontend"
        technology={{ name: 'React', iconSvg: 'react' }}
        onExitEdit={vi.fn()}
      />
    );

    fireEvent.change(nameInput(), { target: { value: 'React ' } }); // trim → same key
    fireEvent.click(submitButton());

    await waitFor(() => expect(updateSpy).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
