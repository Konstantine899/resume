import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import { apiSlice } from '@/shared/api/apiSlice';
import { ToastContext } from '@/shared/lib/contexts/ToastContext/ui/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { userSet } from '../../model/slices/authSlice';
import { resetBootstrapSession } from '../../model/services/sessionBootstrap';

import { type RegisterValues, registerSchema } from '../authSchema';

export interface RegisterFormProps {
  onSuccess?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  className = '',
  'data-testid': testId = 'register-form',
}) => {
  const { t } = useLanguage();
  const dispatch = useDispatch<ThunkDispatch<unknown, unknown, UnknownAction>>();
  const toastCtx = React.useContext(ToastContext);
  const toast = { addToast: toastCtx?.addToast ?? (() => {}) };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const values = useWatch({ control });

  const onSubmit = async (data: RegisterValues) => {
    try {
      await dispatch(
        apiSlice.endpoints.register.initiate({ email: data.email, password: data.password })
      ).unwrap();
      const me = await dispatch(apiSlice.endpoints.me.initiate()).unwrap();
      dispatch(userSet(me));
      resetBootstrapSession();
      onSuccess?.();
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message;
      if (message === 'Email is already registered') {
        toast.addToast({ message: t('auth.errors.emailTaken'), type: 'error' });
      } else {
        toast.addToast({ message: t('auth.errors.generic'), type: 'error' });
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={className} data-testid={testId} gap="lg">
      <Input
        label={t('auth.email')}
        type="email"
        error={errors.email ? t('auth.errors.validation') : undefined}
        value={values.email ?? ''}
        fullWidth
        {...register('email')}
      />
      <Input
        label={t('auth.password')}
        type="password"
        error={errors.password ? t('auth.errors.validation') : undefined}
        value={values.password ?? ''}
        fullWidth
        {...register('password')}
      />
      <Input
        label={t('auth.confirmPassword')}
        type="password"
        error={errors.confirmPassword ? t('auth.errors.validation') : undefined}
        value={values.confirmPassword ?? ''}
        fullWidth
        {...register('confirmPassword')}
      />
      <Button type="submit" loading={isSubmitting} variant="primary">
        {t('auth.register')}
      </Button>
    </Form>
  );
};

RegisterForm.displayName = 'RegisterForm';
export default RegisterForm;
