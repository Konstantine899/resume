import { memo, useEffect, useState } from 'react';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import styles from './LiveClock.module.scss';
import type { LiveClockProps } from '../model/types';

export const LiveClock = memo(function LiveClock({
  className,
  children,
  'data-testid': testId = 'live-clock',
}: LiveClockProps) {
  const { t, language } = useLanguage();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatted = new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);

  return (
    <div className={classNames(styles.liveClock, {}, [className])} data-testid={testId}>
      <span className={styles.label}>{t('localTime')}</span>
      <time className={styles.time} dateTime={now.toISOString()}>
        {formatted}
      </time>
      {children}
    </div>
  );
});
