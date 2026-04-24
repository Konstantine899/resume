import { Button } from '@/shared/ui/Button';
import { useLanguage } from '../hooks/useLanguage';
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
      aria-label={t('language.switch')}
    >
      {language === 'en' ? '🇺🇸 EN' : '🇷🇺 RU'}
    </Button>
  );
};
