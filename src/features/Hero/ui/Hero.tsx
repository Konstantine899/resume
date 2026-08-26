// ============================================
// Hero Feature
// ============================================
import { DEVELOPER_DATA } from '@/entities/Developer';

import { useLanguage } from '@/shared/lib/i18n/hooks';
const avatarImage = '/images/avatar/avatar003.jpg';
import { Code } from '@/shared/ui/Code';
import { Link } from '@/shared/ui/Link';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import React, { useEffect, useState } from 'react';
import { HeroProps } from '../model/types';
import styles from './Hero.module.scss';
import { HeroAvatar } from './HeroAvatar';
import SkillsCode from './SkillsCode/SkillsCode';

type AvatarState = 'loading' | 'loaded' | 'error';

/**
 * Hero Feature Component
 * Main hero section with introduction and call-to-action.
 */
export const Hero: React.FC<HeroProps> = ({
  className = '',
  onGetResume,
  'data-testid': testId = 'hero',
}) => {
  const { t } = useLanguage();
  const { addToast } = useToast();
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

          {/* Code Block с навыками */}
          <Code
            variant="block"
            title="developer.ts"
            language="TypeScript"
            copyable
            showLineNumbers
            className={styles.codeBlock}
            onCopyResult={(success) =>
              addToast({
                message: success ? t(`codeCopied`) : t(`codeCopyFailed`),
                type: success ? 'success' : 'error',
                duration: success ? 2000 : 3000,
              })
            }
          >
            <SkillsCode />
          </Code>

          {/* Resume Button */}
          <Link
            href="#"
            unstyled
            variant="ghost"
            underline="never"
            className={styles.resumeButton}
            onClick={(e) => {
              e.preventDefault();
              onGetResume?.();
            }}
          >
            {t(`getResume`)}
          </Link>
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
export default Hero;
