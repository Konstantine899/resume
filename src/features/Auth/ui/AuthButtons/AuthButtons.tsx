import { Button } from '@/shared/ui/Button';
import React, { useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import { ReactReduxContext } from 'react-redux';

import { useLanguage } from '@/shared/lib/i18n/hooks';
import { selectAuthUser, selectIsAdmin } from '../../model/selectors/selectors';

import { AuthModal } from '../AuthModal/AuthModal';
import { UserAvatarMenu } from '../UserAvatarMenu/UserAvatarMenu';

const AnonymousAuthButtons: React.FC = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<'login' | 'register'>('login');

  return (
    <>
      <Button
        data-testid="auth-login-open"
        variant="primary"
        size="sm"
        onClick={() => {
          setVariant('login');
          setOpen(true);
        }}
      >
        {t('auth.loginOpen')}
      </Button>
      <Button
        data-testid="auth-register-open"
        variant="outline"
        size="sm"
        onClick={() => {
          setVariant('register');
          setOpen(true);
        }}
      >
        {t('auth.registerOpen')}
      </Button>
      <AuthModal
        open={open}
        variant={variant}
        onClose={() => setOpen(false)}
        onVariantChange={setVariant}
      />
    </>
  );
};

const ConnectedAuthButtons: React.FC = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<'login' | 'register'>('login');

  const user = useSelector(selectAuthUser);
  const isAdmin = useSelector(selectIsAdmin);

  if (!user) {
    return (
      <>
        <Button
          data-testid="auth-login-open"
          variant="primary"
          size="sm"
          onClick={() => {
            setVariant('login');
            setOpen(true);
          }}
        >
          {t('auth.loginOpen')}
        </Button>
        <Button
          data-testid="auth-register-open"
          variant="outline"
          size="sm"
          onClick={() => {
            setVariant('register');
            setOpen(true);
          }}
        >
          {t('auth.registerOpen')}
        </Button>
        <AuthModal
          open={open}
          variant={variant}
          onClose={() => setOpen(false)}
          onVariantChange={setVariant}
        />
      </>
    );
  }

  return <UserAvatarMenu user={user} isAdmin={isAdmin} />;
};

const AuthButtons: React.FC = () => {
  const ctx = useContext(ReactReduxContext);
  if (!ctx) return <AnonymousAuthButtons />;
  return <ConnectedAuthButtons />;
};

AuthButtons.displayName = 'AuthButtons';
export default AuthButtons;
export { AuthButtons };
