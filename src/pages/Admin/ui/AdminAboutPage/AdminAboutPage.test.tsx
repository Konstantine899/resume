import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderAdminPage } from '@/shared/tests';
import { AdminAboutPage } from './AdminAboutPage';

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
  useToast: () => ({ addToast: vi.fn(), removeToast: vi.fn() }),
}));

describe('AdminAboutPage (WU-4 section cards)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the About vitrina with 5 cards', () => {
    renderAdminPage(<AdminAboutPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'adminAboutTitle' })).toBeInTheDocument();
    const cards = screen.getAllByTestId(/^admin-about-card-/);
    expect(cards).toHaveLength(5);
  });
});
