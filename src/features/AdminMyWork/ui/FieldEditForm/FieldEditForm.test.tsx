// ============================================
// FieldEditForm tests (mywork-field-actions WU-5 — SPEC R-B2/R-B6)
// ============================================
//
// RED-first contract: one field at a time (no foreign inputs leak in),
// per-field zod from the SHARED lib slices (schemaFor), Save disabled
// while pristine, persist BEFORE dispatch of a ONE-field partial (§3),
// persist failure keeps the form open with an error toast, year '' →
// undefined, metric-N splices the indexed entry.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '@/entities/Project';
import { FieldEditForm } from './FieldEditForm';

const { persistSpy, updateProjectSpy, addToast, holder } = vi.hoisted(() => ({
  persistSpy: vi.fn((_projects: unknown[]) => true),
  updateProjectSpy: vi.fn((payload: unknown) => ({ type: 'myWork/updateProject', payload })),
  addToast: vi.fn(),
  holder: { projects: [] as Project[] },
}));

vi.mock('../../model/services/storage', () => ({
  persistProjects: persistSpy,
}));

vi.mock('../../model/slices/myWorkSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/myWorkSlice')>()),
  updateProject: updateProjectSpy,
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

vi.mock('@/shared/lib/contexts/ToastContext', () => ({
  useToast: () => ({ addToast, removeToast: vi.fn() }),
}));

vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: { myWork: Project[] }) => unknown) =>
      selector({ myWork: holder.projects }),
    useDispatch: () => (action: unknown) => action,
  };
});

const PROJECT: Project = {
  id: 'p1',
  title: 'Shop',
  description: { en: 'An ecommerce platform', ru: 'Интернет-магазин' },
  techIcons: ['react', 'nextjs'],
  link: 'https://shop.example',
  image: '/images/projects/shop.png',
  category: 'ecommerce',
  status: 'completed',
  featured: true,
  role: { en: 'Lead', ru: 'Тимлид' },
  metrics: ['1M+ users', 'p95 120ms'],
  year: 2024,
};

describe('FieldEditForm (mywork)', () => {
  beforeEach(() => {
    holder.projects = [PROJECT];
    persistSpy.mockClear();
    persistSpy.mockImplementation(() => true);
    updateProjectSpy.mockClear();
    addToast.mockClear();
  });

  const renderForm = (
    field: Parameters<typeof FieldEditForm>[0]['field'],
    props: Partial<React.ComponentProps<typeof FieldEditForm>> = {}
  ) => {
    const onExitEdit = vi.fn();
    render(
      <FieldEditForm project={PROJECT} field={field} onExitEdit={onExitEdit} {...props} />
    );
    return { onExitEdit };
  };

  it('renders ONLY the active field inputs', () => {
    renderForm('title');
    expect(screen.getByLabelText('projectFieldTitle')).toBeInTheDocument();
    expect(screen.queryByLabelText('projectFieldLink')).toBeNull();
    expect(screen.queryByLabelText('projectFieldYear')).toBeNull();
  });

  it('keeps Save disabled while pristine', () => {
    renderForm('title');
    expect(screen.getByRole('button', { name: 'projectSave' })).toBeDisabled();
  });

  it('saves a one-field partial: persist FIRST, then dispatch, then exit', async () => {
    const { onExitEdit } = renderForm('title');
    fireEvent.change(screen.getByLabelText('projectFieldTitle'), {
      target: { value: 'Shop v2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'projectSave' }));

    await waitFor(() => expect(onExitEdit).toHaveBeenCalledTimes(1));
    expect(persistSpy).toHaveBeenCalledTimes(1);
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    expect(persisted[0]?.title).toBe('Shop v2');
    expect(persisted[0]?.year).toBe(2024); // untouched siblings stay
    expect(updateProjectSpy).toHaveBeenCalledTimes(1);
    const payload = updateProjectSpy.mock.calls[0]?.[0] as {
      id: string;
      patch: { title: string; updatedAt: string };
    };
    expect(payload.id).toBe('p1');
    expect(payload.patch.title).toBe('Shop v2');
    expect(typeof payload.patch.updatedAt).toBe('string');
    expect(addToast).toHaveBeenCalledWith({ message: 'projectSaved', type: 'success' });
  });

  it('persist failure keeps the form open with projectSaveError and no exit', async () => {
    persistSpy.mockImplementation(() => false);
    const { onExitEdit } = renderForm('title');
    fireEvent.change(screen.getByLabelText('projectFieldTitle'), {
      target: { value: 'Nope' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'projectSave' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'projectSaveError', type: 'error' })
    );
    expect(updateProjectSpy).not.toHaveBeenCalled();
    expect(onExitEdit).not.toHaveBeenCalled();
  });

  it('maps invalid title to the projectTitleRequired alert', async () => {
    renderForm('title');
    fireEvent.change(screen.getByLabelText('projectFieldTitle'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'projectSave' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('projectTitleRequired');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it("year '' saves as year: undefined", async () => {
    renderForm('year');
    fireEvent.change(screen.getByLabelText('projectFieldYear'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'projectSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    expect(persisted[0]?.year).toBeUndefined();
  });

  it('metric-N splices the indexed entry into the metrics array', async () => {
    renderForm('metric-1');
    fireEvent.change(screen.getByLabelText('projectFieldMetrics'), {
      target: { value: 'p95 90ms' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'projectSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    expect(persisted[0]?.metrics).toEqual(['1M+ users', 'p95 90ms']);
  });

  it('category Select persists the picked enum value', async () => {
    renderForm('category');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'portfolio' } });
    fireEvent.click(screen.getByRole('button', { name: 'projectSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    expect(persisted[0]?.category).toBe('portfolio');
  });
});
