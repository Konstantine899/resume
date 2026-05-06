// ============================================
// Avatar Component
// ============================================
import { classNames } from '@/shared/lib/utils/classNames';
import { getImageWithFallback } from '@/shared/lib/utils/getImageWithFallback';
import { getInitials } from '@/shared/lib/utils/getInitials';
import { validateImage } from '@/shared/lib/utils/validateImage';
import React, { useState } from 'react';
import { getSizeInPixels, getStatusColor } from '../model/constants';
import type { AvatarProps } from '../model/types';
import styles from './Avatar.module.scss';

/**
 * Avatar Component
 * Displays user avatar with image, fallback initials, and optional status indicator.
 *
 * Features:
 * - Image validation with fallback to initials
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Status indicator (online, offline, busy, away)
 * - Clickable with keyboard support
 * - Accessible (ARIA labels, keyboard navigation)
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  shape = 'circle',
  status,
  statusPosition = 'top-right',
  className = '',
  disabled = false,
  onClick,
  border = 0,
  borderColor,
}) => {
  const [imageError, setImageError] = useState(false);

  // Валидация URL изображения
  const isValidImage = src && validateImage(src);

  // Получаем URL с fallback логикой
  const avatarSrc = getImageWithFallback({
    primary: isValidImage ? src : undefined,
  });

  // Показываем fallback если нет валидного src или произошла ошибка
  const showFallback = !avatarSrc || imageError;
  const initials = name ? getInitials(name) : '?';

  // Стили аватара
  const avatarStyle: React.CSSProperties = {
    width: `${getSizeInPixels(size)}px`,
    height: `${getSizeInPixels(size)}px`,
    borderWidth: border > 0 ? `${border}px` : undefined,
    borderColor,
  };

  // Классы аватара
  const avatarClassName = classNames(
    styles.avatar,
    styles[shape],
    onClick && !disabled && styles.clickable,
    disabled && styles.disabled,
    className
  );

  // Маппинг позиций статуса
  const statusPositionClassMap = {
    'top-right': styles['top-right'],
    'bottom-right': styles['bottom-right'],
    'top-left': styles['top-left'],
    'bottom-left': styles['bottom-left'],
  } as const;

  const statusPositionClass = statusPositionClassMap[statusPosition];

  // Обработчик клика
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  // Обработчик клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <span
      className={avatarClassName}
      style={avatarStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? undefined : onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={alt}
    >
      {/* Изображение */}
      {avatarSrc && (
        <img
          src={avatarSrc}
          alt={alt}
          className={classNames(styles.image, showFallback && styles.hidden)}
          onLoad={() => setImageError(false)}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      )}

      {/* Fallback с инициалами */}
      {showFallback && (
        <span className={styles.fallback} aria-hidden="true">
          {initials}
        </span>
      )}

      {/* Индикатор статуса */}
      {status && (
        <span
          className={classNames(styles.status, styles[status], statusPositionClass)}
          style={{ backgroundColor: getStatusColor(status) }}
          aria-label={`Status: ${status}`}
        />
      )}
    </span>
  );
};

Avatar.displayName = 'Avatar';
