import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderAdminPage } from '@/shared/tests';
import { AboutEditorList } from './AboutEditorList';

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

describe('AboutEditorList (WU-4 section cards)', () => {
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
});
