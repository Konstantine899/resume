// ============================================
// SkillCategoryForm tests (WU-5, plan_skills_crud §7)
// ============================================
//
// RED-first contract: create/edit modes, §7 validation mapped to i18n
// keys, persist BEFORE dispatch (§3), Toast feedback (§10). Storage and
// action creators are spied at the module boundary; selectors run REAL
// against a seed-shaped state (MyWorkEditorList pattern).

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SkillCategoryData } from '@/entities/Skill';
import { SkillCategoryForm } from './SkillCategoryForm';

const { persistSpy, addSpy, updateSpy, addToast, holder } = vi.hoisted(() => ({
  persistSpy: vi.fn((_data: unknown[]) => true),
  addSpy: vi.fn((payload: unknown) => ({ type: 'adminSkills/addSkillCategory', payload })),
  updateSpy: vi.fn((payload: unknown) => ({ type: 'adminSkills/updateSkillCategory', payload })),
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
  addSkillCategory: addSpy,
  updateSkillCategory: updateSpy,
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

const categoryInput = () => screen.getByLabelText('skillsCategoryType');
const nameInput = () => screen.getByLabelText('skillsCategoryName');
const submitButton = () => screen.getByRole('button', { name: 'skillsSave' });

const fillCreate = (category: string, categoryName: string) => {
  fireEvent.change(categoryInput(), { target: { value: category } });
  fireEvent.change(nameInput(), { target: { value: categoryName } });
};

describe('SkillCategoryForm', () => {
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
    render(<SkillCategoryForm />);

    expect(submitButton()).toBeDisabled();
    fireEvent.change(nameInput(), { target: { value: 'Testing' } });
    expect(submitButton()).toBeEnabled();
  });

  it('create mode: shows skillsErrCategoryName for a short display name', async () => {
    render(<SkillCategoryForm />);
    fillCreate('testing', 'AB');

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('skillsErrCategoryName');
    expect(persistSpy).not.toHaveBeenCalled();
    expect(addSpy).not.toHaveBeenCalled();
  });

  it('create mode: shows skillsErrCategoryExists for a duplicate category key', async () => {
    render(<SkillCategoryForm />);
    fillCreate('frontend', 'Frontend again');

    fireEvent.click(submitButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('skillsErrCategoryExists');
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
      return { type: 'adminSkills/addSkillCategory', payload };
    });

    render(<SkillCategoryForm />);
    fillCreate('testing', 'Testing');

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'skillsSaved' }))
    );
    expect(calls).toEqual(['persist', 'dispatch']);
    expect(persistSpy).toHaveBeenCalledWith([
      expect.objectContaining({ category: 'frontend' }),
      expect.objectContaining({ category: 'testing', categoryName: 'Testing' }),
    ]);
  });

  it('create mode: persist failure shows skillsPersistError and skips dispatch', async () => {
    persistSpy.mockReturnValue(false);

    render(<SkillCategoryForm />);
    fillCreate('testing', 'Testing');

    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'skillsPersistError', type: 'error' })
      )
    );
    expect(addSpy).not.toHaveBeenCalled();
    // §10 error state: the form keeps its values.
    expect(nameInput()).toHaveValue('Testing');
  });

  it('edit mode: pre-fills the record and allows its own category key', async () => {
    const onExitEdit = vi.fn();
    render(
      <SkillCategoryForm
        category={{
          category: 'frontend',
          categoryName: 'Frontend',
          technologies: [],
        }}
        onExitEdit={onExitEdit}
      />
    );

    expect(categoryInput()).toHaveValue('frontend');
    expect(nameInput()).toHaveValue('Frontend');
    // Save starts pristine → disabled until a change.
    expect(submitButton()).toBeDisabled();

    fireEvent.change(nameInput(), { target: { value: 'Frontend Web' } });
    fireEvent.click(submitButton());

    await waitFor(() =>
      expect(updateSpy).toHaveBeenCalledWith({
        category: 'frontend',
        patch: { category: 'frontend', categoryName: 'Frontend Web' },
      })
    );
    await waitFor(() => expect(onExitEdit).toHaveBeenCalled());
  });
});
