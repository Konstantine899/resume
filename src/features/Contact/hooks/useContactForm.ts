// ============================================
// Contact Form Hook with EmailJS & Toast
// ============================================

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import emailjs from '@emailjs/browser';
import { useState } from 'react';
import type { ContactFormData, FormStatus } from '../model/types';

interface UseContactFormOptions {
  /** Overrides the default EmailJS send call (used for testing). */
  send?: (form: HTMLFormElement) => Promise<unknown>;
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
  const { t } = useLanguage();
  const sendForm = options?.send ?? emailjsSend;

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
      // 1. Validation
      if (!formData.name || !formData.email || !formData.message) {
        setStatus('error');
        addToast({ message: t('contactFormRequired'), type: 'error', duration: 5000 });
        return;
      }

      // 2. Send (EmailJS by default, injected in tests)
      const formElement = e.target as HTMLFormElement;
      await sendForm(formElement);

      // 3. Success → Toast + reset
      setStatus('success');
      addToast({ message: t('contactFormSent'), type: 'success', duration: 5000 });
      resetForm();
    } catch (error) {
      // 4. Error → Toast
      setStatus('error');

      const message =
        error instanceof EmailJSConfigError ? t('contactFormConfigError') : t('contactFormError');

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
