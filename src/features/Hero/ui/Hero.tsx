// ============================================
// Hero Feature
// ============================================
import { DEVELOPER_DATA, PROFILE_STACK, SOCIAL_LINKS } from '@/entities/Developer';

import { useLanguage } from '@/shared/lib/i18n/hooks';
import { Badge } from '@/shared/ui/Badge';
import { ButtonWithIcon } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Link } from '@/shared/ui/Link';
import React, { useEffect, useState } from 'react';
import { Download, Mail } from 'lucide-react';
import avatarImage from '@/shared/assets/avatar003.jpg';
import { HeroProps } from '../model/types';
import styles from './Hero.module.scss';
import { HeroAvatar } from './HeroAvatar';

type AvatarState = 'loading' | 'loaded' | 'error';

/**
 * Hero Feature Component
 * Main hero section with introduction and call-to-action.
 *
 * Recruiter-audit P1 additions: a role + experience line, scannable stack
 * badges, a CTA pair (Download Resume → `#contact` until the PDF exists —
 * never a dead/fake link — and Hire Me → `#contact`), and icon-only social
 * profile links. NO age / personal data anywhere.
 */
export const Hero: React.FC<HeroProps> = ({ className = '', 'data-testid': testId = 'hero' }) => {
  const { t } = useLanguage();
  const [avatarState, setAvatarState] = useState<AvatarState>('loading');

  // Имитация загрузки аватара (для демонстрации состояний)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Можно переключать состояния для тестирования:
      // 'loaded' — успех
      // 'error' — ошибка
      setAvatarState('loaded');
    }, 2000); // 2 секунды имитация загрузки

    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="home" className={`${styles.hero} ${className}`} data-testid={testId}>
      {/* Gradient Background */}
      <div className={styles.gradientBackground} />

      {/* Overlay for better text contrast */}
      <div className={styles.overlay} />
      <div className={styles.content}>
        {/* Left side - Text content */}
        <div className={styles.leftContent}>
          {/* Greeting */}
          <h1 className={styles.greeting}>{t(`greeting`)}</h1>
          <h2 className={styles.name}>{t(`name`)}</h2>

          {/* Role + experience line (no age, no personal data) */}
          <p className={styles.roleLine} data-testid="hero-role-line">
            <span>{t('heroRole')}</span>
            <span className={styles.roleDivider} aria-hidden="true">
              ·
            </span>
            <span>{t('heroExperience')}</span>
          </p>

          {/* Stack badges — scannable proof above the fold */}
          <ul className={styles.stackBadges} data-testid="hero-stack-badges">
            {PROFILE_STACK.map((tech) => (
              <li key={tech}>
                <Badge variant="outline" size="sm">
                  {tech}
                </Badge>
              </li>
            ))}
          </ul>

          {/* CTA pair — both point at Contact until the resume PDF exists */}
          <div className={styles.actions} data-testid="hero-actions">
            <ButtonWithIcon
              component="a"
              href="#contact"
              variant="primary"
              size="md"
              leftIcon={<Icon name={Download} size={20} color="inherit" decorative />}
            >
              {t('downloadResume')}
            </ButtonWithIcon>
            <ButtonWithIcon
              component="a"
              href="#contact"
              variant="outline"
              size="md"
              leftIcon={<Icon name={Mail} size={20} color="inherit" decorative />}
            >
              {t('getInTouch')}
            </ButtonWithIcon>
          </div>

          {/* Social profile links (shared SOCIAL_LINKS, i18n aria-labels) */}
          <div className={styles.socials} data-testid="hero-socials">
            {SOCIAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                external
                showExternalIcon={false}
                variant="text-primary"
                size="sm"
                className={styles.socialLink}
                aria-label={t(link.labelKey)}
              >
                <Icon name={link.icon} size={18} color="inherit" decorative />
              </Link>
            ))}
          </div>
        </div>

        {/* Right side - Photo */}
        <HeroAvatar
          state={avatarState}
          fullName={DEVELOPER_DATA.fullName}
          avatarImage={avatarImage}
        />
      </div>
    </section>
  );
};

Hero.displayName = 'Hero';
