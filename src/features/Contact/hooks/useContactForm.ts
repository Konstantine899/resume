// ============================================
// Contact Form Hook with EmailJS & Toast
// ============================================

import { useToast } from '@/app/providers/ToastProvider'; // ✅ Импорт из App layer
import emailjs from '@emailjs/browser';
import { useState } from 'react';
import type { ContactFormData, FormStatus } from '../model/types';

interface UseContactFormReturn {
  formData: ContactFormData;
  status: FormStatus;
  setFormData: (data: ContactFormData) => void;
  setStatus: (status: FormStatus) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  resetForm: () => void;
}

export function useContactForm(): UseContactFormReturn {
  const { addToast } = useToast(); // ✅ Получаем функцию добавления toast

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
      // 1. Валидация формы
      if (!formData.name || !formData.email || !formData.message) {
        throw new Error('Все поля обязательны для заполнения');
      }

      // 2. EmailJS конфигурация
      const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceID || !templateID || !publicKey) {
        throw new Error('EmailJS конфигурация не завершена');
      }

      // 3. Отправка формы
      const formElement = e.target as HTMLFormElement;
      await emailjs.sendForm(serviceID, templateID, formElement, publicKey);

      // 4. Успех → Toast + сброс
      setStatus('success');
      addToast('✅ Сообщение успешно отправлено!', 'success', 5000);
      resetForm();
    } catch (error) {
      // 5. Ошибка → Toast
      setStatus('error');

      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось отправить сообщение. Попробуйте позже.';

      addToast(`❌ ${message}`, 'error', 5000);
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
