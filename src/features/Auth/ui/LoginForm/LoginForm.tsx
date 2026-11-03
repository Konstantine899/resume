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

import { loginSchema, type LoginValues } from '../authSchema';

export interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  className = '',
  'data-testid': testId = 'login-form',
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
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const values = useWatch({ control });

  const onSubmit = async (data: LoginValues) => {
    try {
      await dispatch(apiSlice.endpoints.login.initiate(data)).unwrap();
      const me = await dispatch(apiSlice.endpoints.me.initiate()).unwrap();
      dispatch(userSet(me));
      resetBootstrapSession();
      onSuccess?.();
    } catch {
      toast.addToast({ message: t('auth.errors.invalidCredentials'), type: 'error' });
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
      <Button type="submit" loading={isSubmitting} variant="primary">
        {t('auth.login')}
      </Button>
    </Form>
  );
};

LoginForm.displayName = 'LoginForm';
export default LoginForm;
