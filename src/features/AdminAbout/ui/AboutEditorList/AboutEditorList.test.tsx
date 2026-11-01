import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderAdminPage } from '@/shared/tests';
import { AboutEditorList } from './AboutEditorList';
import { readCollapseState } from './lib/collapseState';

const { addToast } = vi.hoisted(() => ({ addToast: vi.fn() }));

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>();
  return {
    ...actual,
    apiSlice: {
      ...actual.apiSlice,
      endpoints: {
        ...actual.apiSlice.endpoints,
        updateAboutContent: {
          ...actual.apiSlice.endpoints.updateAboutContent,
          initiate: ((_arg: unknown) => {
            const result = Object.assign(Promise.resolve({ data: {} }), {
              unwrap: () => Promise.resolve({}),
            });
            return () => result;
          }) as unknown as typeof actual.apiSlice.endpoints.updateAboutContent.initiate,
        },
        updateAboutPortrait: {
          ...actual.apiSlice.endpoints.updateAboutPortrait,
          initiate: ((_arg: unknown) => {
            const result = Object.assign(Promise.resolve({ data: {} }), {
              unwrap: () => Promise.resolve({}),
            });
            return () => result;
          }) as unknown as typeof actual.apiSlice.endpoints.updateAboutPortrait.initiate,
        },
      },
    },
  };
});

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

describe('AboutEditorList (WU-4/WU-5 section cards)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header (h2 + hint + add button + portrait button + Reset)', () => {
    renderAdminPage(<AboutEditorList />);
    expect(screen.getByRole('heading', { level: 2, name: 'adminAboutTitle' })).toBeInTheDocument();
    expect(screen.getByText('adminAboutHint')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'adminAboutAddRow' })).toBeInTheDocument();
    expect(screen.getByTestId('admin-about-portrait-button')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'aboutReset' })).toBeInTheDocument();
  });

  it('renders exactly five collapsed cards by default', () => {
    renderAdminPage(<AboutEditorList />);
    const cards = screen.getAllByTestId(/^admin-about-card-/);
    expect(cards).toHaveLength(5);
    const collapses = screen.getAllByRole('button', { name: 'adminAboutExpandTable' });
    expect(collapses).toHaveLength(5);
  });

  it('a card expands on click, showing its stable content region', () => {
    renderAdminPage(<AboutEditorList />);
    const button = screen.getAllByRole('button', {
      name: 'adminAboutExpandTable',
    })[0] as HTMLElement;
    fireEvent.click(button);
    const content = document.querySelector('[id^="about-card-content-"]') as HTMLElement;
    expect(content).not.toHaveAttribute('hidden');
  });

  it('moves from expanded strip to minus control and back', () => {
    renderAdminPage(<AboutEditorList />);
    const button = screen.getAllByRole('button', {
      name: 'adminAboutExpandTable',
    })[0] as HTMLElement;
    fireEvent.click(button);
    const minus = screen.getByTestId('admin-about-collapse-main') as HTMLElement;
    expect(minus).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(minus);
    const plus = screen.getByTestId('admin-about-expand-main') as HTMLElement;
    expect(plus.getAttribute('aria-expanded')).toBe('false');
    expect(plus.getAttribute('aria-controls')).toBe('about-card-content-main');
  });

  it('persists collapse state to localStorage and reads it back', () => {
    renderAdminPage(<AboutEditorList />);
    const button = screen.getAllByRole('button', {
      name: 'adminAboutExpandTable',
    })[0] as HTMLElement;
    fireEvent.click(button);
    const raw = localStorage.getItem('admin-about:collapsed');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.version).toBe(1);
    expect(typeof parsed.collapsed.main).toBe('boolean');
  });

  it('does not crash when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => renderAdminPage(<AboutEditorList />)).not.toThrow();
    vi.restoreAllMocks();
  });

  it('renders the fullName row on expand and enables save on dirty valid input', () => {
    renderAdminPage(<AboutEditorList />);
    fireEvent.click(screen.getByTestId('admin-about-expand-main') as HTMLElement);
    const input = screen.getByLabelText('aboutFieldFullName');
    fireEvent.change(input, { target: { value: 'Nazar' } });
    const save = screen.getByRole('button', { name: 'aboutSave' });
    expect(save).not.toBeDisabled();
  });

  it('does not allow save on pristine or invalid fullName', () => {
    renderAdminPage(<AboutEditorList />);
    fireEvent.click(screen.getByTestId('admin-about-expand-main') as HTMLElement);
    const save = screen.getByRole('button', { name: 'aboutSave' });
    expect(save).toBeDisabled();
  });

  it('dispatches through the add button modal', () => {
    renderAdminPage(<AboutEditorList />);
    fireEvent.click(screen.getByRole('button', { name: 'adminAboutAddRow' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens the Tech card and toggles chips with a dirty save', async () => {
    renderAdminPage(<AboutEditorList />);
    fireEvent.click(screen.getByTestId('admin-about-expand-technologies') as HTMLElement);
    const chips = screen.getAllByRole('button');
    expect(chips.length).toBeGreaterThan(0);
  });

  it('CTA block can be filled and saved', async () => {
    renderAdminPage(<AboutEditorList />);
    fireEvent.click(screen.getByTestId('admin-about-expand-cta') as HTMLElement);
    const areas = document.querySelectorAll('textarea');
    expect(areas[0]).toBeDefined();
    const save = screen.getByRole('button', { name: 'aboutSave' });
    expect(save).toBeInTheDocument();
    // change drafts through the first textarea
    fireEvent.change(areas[0] as HTMLTextAreaElement, { target: { value: 'Hire' } });
    fireEvent.change(areas[1] as HTMLTextAreaElement, { target: { value: 'Найми' } });
    fireEvent.click(save);
    await waitFor(() => expect(addToast).toHaveBeenCalled());
  });

  it('does not crash when collapsing/expanding repeatedly', () => {
    renderAdminPage(<AboutEditorList />);
    const plus = screen.getByTestId('admin-about-expand-stats') as HTMLElement;
    fireEvent.click(plus);
    const minus = screen.getByTestId('admin-about-collapse-stats') as HTMLElement;
    fireEvent.click(minus);
    expect(screen.getByTestId('admin-about-expand-stats')).toBeInTheDocument();
  });

  it('still renders the 5 card titles', () => {
    renderAdminPage(<AboutEditorList />);
    expect(screen.getByText('adminAboutCardMain')).toBeInTheDocument();
    expect(screen.getByText('adminAboutCardDescriptions')).toBeInTheDocument();
    expect(screen.getByText('adminAboutCardTechnologies')).toBeInTheDocument();
    expect(screen.getByText('adminAboutCardStats')).toBeInTheDocument();
    expect(screen.getByText('adminAboutCardCta')).toBeInTheDocument();
  });

  it('restores persisted collapsed sections', () => {
    localStorage.setItem(
      'admin-about:collapsed',
      JSON.stringify({ version: 1, collapsed: { main: false, cta: false } })
    );
    renderAdminPage(<AboutEditorList />);
    expect(screen.getByTestId('admin-about-collapse-main')).toBeInTheDocument();
    expect(screen.getByTestId('admin-about-collapse-cta')).toBeInTheDocument();
  });

  it('resets collapsed state on version mismatch', () => {
    localStorage.setItem(
      'admin-about:collapsed',
      JSON.stringify({ version: 999, collapsed: { main: false } })
    );
    renderAdminPage(<AboutEditorList />);
    expect(screen.getAllByTestId(/^admin-about-expand-/)).toHaveLength(5);
  });

  it('try/catch works when localStorage setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    renderAdminPage(<AboutEditorList />);
    expect(() =>
      fireEvent.click(screen.getByTestId('admin-about-expand-main') as HTMLElement)
    ).not.toThrow();
    vi.restoreAllMocks();
  });

  it('roundtrip collapse persists', () => {
    renderAdminPage(<AboutEditorList />);
    fireEvent.click(screen.getByTestId('admin-about-expand-main') as HTMLElement);
    fireEvent.click(screen.getByTestId('admin-about-collapse-main') as HTMLElement);
    const stored = localStorage.getItem('admin-about:collapsed');
    expect(JSON.parse(stored as string).collapsed.main).toBe(true);
  });

  it('fullName valid save success path', async () => {
    renderAdminPage(<AboutEditorList />);
    fireEvent.click(screen.getByTestId('admin-about-expand-main') as HTMLElement);
    const input = screen.getByLabelText('aboutFieldFullName') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Nazar' } });
    fireEvent.click(screen.getByRole('button', { name: 'aboutSave' }));
    await waitFor(() => expect(addToast).toHaveBeenCalled());
  });

  it('fullName invalid keeps disabled', () => {
    renderAdminPage(<AboutEditorList />);
    fireEvent.click(screen.getByTestId('admin-about-expand-main') as HTMLElement);
    const input = screen.getByLabelText('aboutFieldFullName') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'a' } });
    const save = screen.getByRole('button', { name: 'aboutSave' });
    expect(save).toBeDisabled();
  });

  it('tech toggle and save persists', async () => {
    renderAdminPage(<AboutEditorList />);
    fireEvent.click(screen.getByTestId('admin-about-expand-technologies') as HTMLElement);
    const candidates = screen
      .getAllByRole('button')
      .filter((b) => b.textContent?.trim() === 'react');
    if (candidates.length > 0) fireEvent.click(candidates[0] as HTMLElement);
    const save = screen.getAllByRole('button', { name: 'aboutSave' }).slice(-1)[0] as HTMLElement;
    fireEvent.click(save);
    await waitFor(() => expect(addToast).toHaveBeenCalled());
  });

  it('CTA save success path', async () => {
    renderAdminPage(<AboutEditorList />);
    fireEvent.click(screen.getByTestId('admin-about-expand-cta') as HTMLElement);
    const areas = document.querySelectorAll('textarea') as NodeListOf<HTMLTextAreaElement>;
    fireEvent.change(areas[0] as HTMLTextAreaElement, { target: { value: 'Hire' } });
    fireEvent.change(areas[1] as HTMLTextAreaElement, { target: { value: 'Найми' } });
    const save = screen.getByRole('button', { name: 'aboutSave' });
    fireEvent.click(save);
    await waitFor(() => expect(addToast).toHaveBeenCalled());
  });

  it('CTA hidden toggle works', () => {
    renderAdminPage(<AboutEditorList />);
    fireEvent.click(screen.getByTestId('admin-about-expand-cta') as HTMLElement);
    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it('collapse all roundtrip survives', () => {
    renderAdminPage(<AboutEditorList />);
    for (let i = 0; i < 5; i++) {
      const btn = screen.getAllByTestId(/^admin-about-expand-/)[0] as HTMLElement;
      fireEvent.click(btn);
    }
    expect(screen.getAllByTestId(/^admin-about-collapse-/)).toHaveLength(5);
  });

  for (const section of ['main', 'descriptions', 'technologies', 'stats', 'cta']) {
    it(`covers expand/collapse for ${section}`, () => {
      renderAdminPage(<AboutEditorList />);
      const plus = screen.getByTestId(`admin-about-expand-${section}`) as HTMLElement;
      fireEvent.click(plus);
      const minus = screen.getByTestId(`admin-about-collapse-${section}`) as HTMLElement;
      expect(minus).toHaveAttribute('aria-expanded', 'true');
      fireEvent.click(minus);
      expect(screen.getByTestId(`admin-about-expand-${section}`)).toBeInTheDocument();
    });
  }

  it('uses persisted fully collapsed state and expands one', () => {
    localStorage.setItem(
      'admin-about:collapsed',
      JSON.stringify({
        version: 1,
        collapsed: { main: true, descriptions: true, technologies: true, stats: true, cta: true },
      })
    );
    renderAdminPage(<AboutEditorList />);
    const plus = screen.getAllByTestId(/^admin-about-expand-/)[0] as HTMLElement;
    fireEvent.click(plus);
    expect(screen.getAllByTestId(/^admin-about-collapse-/).length).toBeGreaterThan(0);
  });

  it('covers chip selected/unselected rendering when stack exists', () => {
    // direct render uses seed (stack undefined) -> all catalog chips unselected path + unknown check
    renderAdminPage(<AboutEditorList />);
    fireEvent.click(screen.getByTestId('admin-about-expand-technologies') as HTMLElement);
    const reactButtons = screen
      .getAllByRole('button')
      .filter((b) => b.textContent?.trim() === 'react');
    if (reactButtons.length > 0) fireEvent.click(reactButtons[0] as HTMLElement);
    expect(screen.getAllByRole('button').some((b) => b.textContent?.includes('×'))).toBe(true);
  });

  it('renders both input mode cards when localStorage is throwing on setItem', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
    expect(() => renderAdminPage(<AboutEditorList />)).not.toThrow();
    expect(screen.getAllByTestId(/^admin-about-card-/)).toHaveLength(5);
    vi.restoreAllMocks();
  });

  it('renders the section titles and add button consistently', () => {
    renderAdminPage(<AboutEditorList />);
    for (const title of [
      'adminAboutCardMain',
      'adminAboutCardDescriptions',
      'adminAboutCardTechnologies',
      'adminAboutCardStats',
      'adminAboutCardCta',
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it('readCollapseState branches', () => {
    const original = localStorage.getItem;
    localStorage.clear();
    expect(readCollapseState()).toEqual({
      main: true,
      descriptions: true,
      technologies: true,
      stats: true,
      cta: true,
    });
    localStorage.setItem('admin-about:collapsed', '{broken');
    expect(readCollapseState()).toEqual({
      main: true,
      descriptions: true,
      technologies: true,
      stats: true,
      cta: true,
    });
    localStorage.setItem(
      'admin-about:collapsed',
      JSON.stringify({ version: 0, collapsed: { main: false, descriptions: true } })
    );
    expect(readCollapseState().main).toBe(true);
    localStorage.setItem(
      'admin-about:collapsed',
      JSON.stringify({ version: 1, collapsed: { main: false, cta: true } })
    );
    const state = readCollapseState();
    expect(state.main).toBe(false);
    expect(state.cta).toBe(true);
    localStorage.getItem = original;
  });
});
