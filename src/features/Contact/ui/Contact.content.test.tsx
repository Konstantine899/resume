// Contact read-path via the `content` prop (plan Contact CRUD §10 WU-2).
//
// The 3 social/integration cases in `Contact.test.tsx` stay untouched and
// keep rendering WITHOUT `content` (fallback branch, §11). This file
// covers the store-fed branch: every editable value comes from the prop,
// the `contact` heading stays i18n-owned (§2), and the resolved
// `formTexts` reach the Create toasts (R-11).

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ContactContent } from '@/entities/ContactContent';
import { Contact } from './Contact';

const { addToast } = vi.hoisted(() => ({ addToast: vi.fn() }));

vi.mock('@/shared/lib/i18n/hooks', () => ({
  // `language` is what the store branch indexes content by; `t` keeps
  // returning raw keys so fallback assertions stay trivial.
  useLanguage: () => ({ t: (key: string) => key, language: 'ru' }),
}));
vi.mock('@/shared/ui/AnimatedSection', () => ({
  AnimatedSection: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animated-section">{children}</div>
  ),
}));
vi.mock('@/shared/lib/contexts/ToastContext', () => ({
  useToast: () => ({ addToast }),
}));
vi.mock('@/shared/ui/Card', () => ({
  ContactCard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="contact-card">{children}</div>
  ),
  CardGrid: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-grid">{children}</div>
  ),
}));
vi.mock('@emailjs/browser', () => ({
  default: { sendForm: vi.fn().mockResolvedValue({ status: 200 }) },
}));

const STORE_CONTENT: ContactContent = {
  email: 'store@example.com',
  texts: {
    contactDescription: { en: 'store desc en', ru: 'STORE_DESC_RU' },
    responseTimeHint: { en: 'store hint en', ru: 'STORE_HINT_RU' },
    nameField: { en: 'store name en', ru: 'STORE_NAME_LABEL_RU' },
    email: { en: 'store email en', ru: 'STORE_EMAIL_LABEL_RU' },
    message: { en: 'store message en', ru: 'STORE_MESSAGE_LABEL_RU' },
    namePlaceholder: { en: 'store name ph en', ru: 'STORE_NAME_PH_RU' },
    emailPlaceholder: { en: 'store email ph en', ru: 'STORE_EMAIL_PH_RU' },
    messagePlaceholder: { en: 'store message ph en', ru: 'STORE_MESSAGE_PH_RU' },
    sendMessage: { en: 'store send en', ru: 'STORE_SEND_RU' },
    sending: { en: 'store sending en', ru: 'STORE_SENDING_RU' },
  },
  formTexts: {
    contactFormRequired: { en: 'store required en', ru: 'STORE_REQUIRED_RU' },
    contactFormSent: { en: 'store sent en', ru: 'STORE_SENT_RU' },
    contactFormError: { en: 'store error en', ru: 'STORE_ERROR_RU' },
    contactFormConfigError: { en: 'store config en', ru: 'STORE_CONFIG_RU' },
  },
};

describe('Contact: read-path via the content prop (WU-2)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders editable text and the mailto target from the content prop (language=ru)', () => {
    render(<Contact content={STORE_CONTENT} />);

    // The mailto target and label come from the store, not CONTACT_EMAIL.
    const mailto = screen.getByRole('link', { name: 'store@example.com' });
    expect(mailto).toHaveAttribute('href', 'mailto:store@example.com');

    // Section description + hint.
    expect(screen.getByText('STORE_DESC_RU')).toBeInTheDocument();
    expect(screen.getByText('STORE_HINT_RU')).toBeInTheDocument();

    // Form labels and the submit button.
    expect(screen.getByText('STORE_NAME_LABEL_RU')).toBeInTheDocument();
    expect(screen.getByText('STORE_EMAIL_LABEL_RU')).toBeInTheDocument();
    expect(screen.getByText('STORE_MESSAGE_LABEL_RU')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'STORE_SEND_RU' })).toBeInTheDocument();

    // h2 stays i18n-owned (§2 split-brain guard) — t('contact') → 'contact'.
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('contact');
  });

  it('routes resolved formTexts into the Create toasts (R-11)', async () => {
    render(<Contact content={STORE_CONTENT} />);

    fireEvent.change(screen.getByPlaceholderText('STORE_NAME_PH_RU'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText('STORE_EMAIL_PH_RU'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('STORE_MESSAGE_PH_RU'), {
      target: { value: 'Hello, this is a test message' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'STORE_SEND_RU' }));

    // Default send (mocked emailjs) resolves → success toast uses the
    // STORE value, proving Contact passes `content.formTexts` down (R-11).
    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith({
        message: 'STORE_SENT_RU',
        type: 'success',
        duration: 5000,
      });
    });
  });

  it('keeps SOCIAL_LINKS untouched (outside the store, decision B)', () => {
    render(<Contact content={STORE_CONTENT} />);

    const external = screen
      .getAllByRole('link')
      .filter((link) => !link.getAttribute('href')?.startsWith('mailto:'));
    expect(external).toHaveLength(3);
    for (const link of external) {
      expect(link).toHaveAttribute('target', '_blank');
    }
  });
});
