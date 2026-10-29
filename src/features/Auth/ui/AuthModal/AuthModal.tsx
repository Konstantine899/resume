import { Modal } from '@/shared/ui/Modal';
import React, { useState } from 'react';

import { LoginForm } from '../LoginForm/LoginForm';
import { RegisterForm } from '../RegisterForm/RegisterForm';
import { useLanguage } from '@/shared/lib/i18n/hooks';

export type AuthModalVariant = 'login' | 'register';

export interface AuthModalProps {
  open: boolean;
  variant?: AuthModalVariant;
  onClose: () => void;
  onVariantChange?: (variant: AuthModalVariant) => void;
  'data-testid'?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  variant: initialVariant = 'login',
  onClose,
  onVariantChange,
  'data-testid': testId = 'auth-modal',
}) => {
  const { t } = useLanguage();
  const [variant, setVariant] = useState<AuthModalVariant>(initialVariant);
  const [prevOpen, setPrevOpen] = useState<boolean>(open);

  // Reset the variant when the modal is (re)opened, without an effect
  // (react-hooks/set-state-in-effect): render-time state adjustment.
  if (open && !prevOpen) {
    setVariant(initialVariant);
    setPrevOpen(true);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  const switchTo = (next: AuthModalVariant) => {
    setVariant(next);
    onVariantChange?.(next);
  };

  return (
    <Modal isOpen={open} onClose={onClose} data-testid={testId}>
      {variant === 'login' ? (
        <>
          <LoginForm onSuccess={onClose} />
          <button type="button" onClick={() => switchTo('register')}>
            {t('auth.register')}
          </button>
        </>
      ) : (
        <>
          <RegisterForm onSuccess={onClose} />
          <button type="button" onClick={() => switchTo('login')}>
            {t('auth.login')}
          </button>
        </>
      )}
    </Modal>
  );
};

AuthModal.displayName = 'AuthModal';
export default AuthModal;
