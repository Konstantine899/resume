import { useLanguage } from '@/shared/lib/i18n/hooks';
import { Button } from '@/shared/ui/Button';
import styles from './LanguageSwitch.module.scss';

export const LanguageSwitch = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={styles.button}
      onClick={toggleLanguage}
      aria-label={t('language')}
    >
      {language === 'en' ? '🇺🇸 EN' : '🇷🇺 RU'}
    </Button>
  );
};
