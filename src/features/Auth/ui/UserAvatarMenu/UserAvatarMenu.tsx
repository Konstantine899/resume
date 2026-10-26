import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Link as UILink } from '@/shared/ui/Link';
import { useDispatch, useSelector } from 'react-redux';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { Popover } from '@/shared/ui/Popover';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '@/shared/lib/contexts/ThemeContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { apiSlice } from '@/shared/api/apiSlice';
import { selectAuthUser } from '../../model/selectors/selectors';
import { userSet, signedOut } from '../../model/slices/authSlice';
import { authToken } from '@/shared/api/authToken';
import type { AuthUser } from '@/shared/api/types';
import aboutPortrait from '@/shared/assets/Firefly_RemoveBackground.webp';

export interface UserAvatarMenuProps {
  user?: AuthUser | null;
  isAdmin?: boolean;
}

export const UserAvatarMenu: React.FC<UserAvatarMenuProps> = ({
  user: userProp,
  isAdmin: isAdminProp,
}) => {
  const dispatch = useDispatch<ThunkDispatch<unknown, unknown, UnknownAction>>();
  const reduxUser = useSelector(selectAuthUser);
  const user = userProp !== undefined ? userProp : reduxUser;

  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const isAdmin = isAdminProp ?? user?.role === 'admin';

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    dispatch(apiSlice.endpoints.getSiteSettings.initiate())
      .unwrap()
      .then((data: { resumeUrl?: string | null }) => {
        if (cancelled) return;
        setResumeUrl(data?.resumeUrl ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setResumeUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const downloadHref = resumeUrl && resumeUrl.trim() ? resumeUrl : '/contact';

  const handleThemeToggle = async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    if (user) {
      try {
        const updated = await dispatch(
          apiSlice.endpoints.updatePreferences.initiate({ theme: next })
        ).unwrap();
        dispatch(userSet(updated));
        if (updated.theme && updated.theme !== theme) {
          toggleTheme();
        }
      } catch {
        // Keep local state untouched on failure.
      }
    } else {
      toggleTheme();
    }
  };

  const handleLanguageToggle = async () => {
    const next = language === 'en' ? 'ru' : 'en';
    if (user) {
      try {
        const updated = await dispatch(
          apiSlice.endpoints.updatePreferences.initiate({ language: next })
        ).unwrap();
        dispatch(userSet(updated));
        setLanguage(next);
      } catch {
        // Keep local state untouched on failure.
      }
    } else {
      setLanguage(next);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(apiSlice.endpoints.logout.initiate()).unwrap();
    } catch {
      // Logout errors still wipe local state.
    }
    dispatch(signedOut());
    authToken.clearAccessToken();
  };

  if (!user) {
    return null;
  }

  return (
    <Popover.Provider closeOnClickOutside closeOnEsc closeOnContentClick={false}>
      <Popover.Trigger
        as="button"
        type="button"
        aria-label={user.email}
        data-testid="user-avatar-trigger"
        style={{ background: 'transparent', border: 0, padding: 0 }}
      >
        <img
          src={aboutPortrait}
          alt={user.email}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
            objectPosition: 'center top',
            background: 'transparent',
          }}
        />
      </Popover.Trigger>
      <Popover.Content position="bottom" size="auto">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '12rem' }}>
          <UILink href={`mailto:${user.email}`} variant="ghost" size="sm" data-testid="user-email">
            {user.email}
          </UILink>
          {isAdmin ? (
            <UILink
              component={Link}
              href="/admin"
              to="/admin"
              variant="ghost"
              size="sm"
              data-testid="admin-panel-link"
            >
              {t('navAdmin')}
            </UILink>
          ) : null}
          <UILink href={downloadHref} variant="ghost" size="sm" data-testid="download-resume-link">
            {t('downloadResume')}
          </UILink>
          <Button data-testid="theme-toggle" variant="ghost" size="sm" onClick={handleThemeToggle}>
            <Icon name={theme === 'dark' ? Sun : Moon} size={16} color="inherit" decorative />
            {theme === 'dark' ? t('lightMode') : t('darkMode')}
          </Button>
          <Button
            data-testid="language-toggle"
            variant="ghost"
            size="sm"
            onClick={handleLanguageToggle}
          >
            <Icon name={Globe} size={16} color="inherit" decorative />
            {language === 'en' ? t('languageFull') : t('language')}
          </Button>
          <Button data-testid="logout-button" variant="ghost" size="sm" onClick={handleLogout}>
            {t('auth.logout')}
          </Button>
        </div>
      </Popover.Content>
    </Popover.Provider>
  );
};

UserAvatarMenu.displayName = 'UserAvatarMenu';
export default UserAvatarMenu;
