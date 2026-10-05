// ============================================
// Contact Form Hook with EmailJS & Toast
// ============================================

import {
  ContactFormDataSchema,
  type FormTextKey,
  type LocalizedText,
} from '@/entities/ContactContent';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import emailjs from '@emailjs/browser';
import { useState } from 'react';
import type { ContactFormData, FormStatus } from '../model/types';

interface UseContactFormOptions {
  /** Overrides the default EmailJS send call (used for testing). */
  send?: (form: HTMLFormElement) => Promise<unknown>;
  /**
   * Admin-edited toast texts (resolved `content.formTexts[language]`,
   * passed by Contact — R-11). Absent → fallback to `t()`, so the hook
   * stays usable without a Provider (its bare tests).
   */
  texts?: Record<FormTextKey, LocalizedText>;
}

interface UseContactFormReturn {
  formData: ContactFormData;
  status: FormStatus;
  setFormData: (data: ContactFormData) => void;
  setStatus: (status: FormStatus) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  resetForm: () => void;
}

/** Thrown when the required EmailJS environment variables are missing. */
class EmailJSConfigError extends Error {
  constructor() {
    super('EmailJS configuration is missing');
    this.name = 'EmailJSConfigError';
  }
}

/** Default EmailJS send implementation (ADR 0003 — direct SDK call). */
async function emailjsSend(form: HTMLFormElement): Promise<unknown> {
  const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceID || !templateID || !publicKey) {
    throw new EmailJSConfigError();
  }

  return emailjs.sendForm(serviceID, templateID, form, publicKey);
}

export function useContactForm(options?: UseContactFormOptions): UseContactFormReturn {
  const { addToast } = useToast();
  const { t, language } = useLanguage();
  const sendForm = options?.send ?? emailjsSend;
  // R-11: store-edited text wins, t() is the store-free fallback.
  const toastText = (key: FormTextKey): string => options?.texts?.[key]?.[language] ?? t(key);

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState<FormStatus>('idle');

  const resetForm = () => {
    setFormData({ name: '', email: '', message: '' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      // 1. Validation — zod ContactFormDataSchema (§7): trim+format email,
      // name 2–80 after trim, message 10–2000. All failures map to ONE
      // toast (R-4: no per-key messages in the schema).
      const parsed = ContactFormDataSchema.safeParse(formData);
      if (!parsed.success) {
        setStatus('error');
        addToast({ message: toastText('contactFormRequired'), type: 'error', duration: 5000 });
        return;
      }

      // 2. Send (EmailJS by default, injected in tests)
      const formElement = e.target as HTMLFormElement;
      await sendForm(formElement);

      // 3. Success → Toast + reset
      setStatus('success');
      addToast({ message: toastText('contactFormSent'), type: 'success', duration: 5000 });
      resetForm();
    } catch (error) {
      // 4. Error → Toast
      setStatus('error');

      const message =
        error instanceof EmailJSConfigError
          ? toastText('contactFormConfigError')
          : toastText('contactFormError');

      addToast({ message, type: 'error', duration: 5000 });
    }
  };

  return {
    formData,
    status,
    setFormData,
    setStatus,
    handleSubmit,
    resetForm,
  };
}
