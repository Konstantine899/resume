// ============================================
// useKeyboardAction Hook
// ============================================

import { useCallback } from 'react';
import type { KeyboardEvent } from 'react';

export interface UseKeyboardActionOptions {
  /** Отключить активацию (default: false) */
  disabled?: boolean;
  /**
   * Гейт активности. Enter/Space диспатчат нативный `click()` на элементе только
   * когда `enabled` (и не disabled). Так один native `click()` порождает ровно
   * один `onClick` на элементе — без двойного срабатывания и без вызова
   * дополнительного колбэка.
   */
  enabled?: boolean;
}

export type UseKeyboardActionHandler = (event: KeyboardEvent<HTMLElement>) => void;

/**
 * Хук, возвращающий `onKeyDown` обработчик для активации элемента с клавиатуры.
 *
 * Обобщённый паттерн для интерактивных не-нативных элементов (например, Icon
 * со span-path и auto-`role="button"`): при Enter/Space предотвращает дефолтное
 * поведение (скролл при Space) и эмулирует нативный `click()` на
 * `event.currentTarget` — ровно один раз. Элемент держит свой `onClick` для
 * мыши и клавиатуры как единый источник действия; `enabled` гейтит активность.
 *
 * @param options - Настройки (disabled, enabled)
 * @returns onKeyDown обработчик
 *
 * @example
 * ```tsx
 * const handleKeyDown = useKeyboardAction({ disabled, enabled: isInteractive });
 * return <span tabIndex={0} onClick={onClick} onKeyDown={handleKeyDown}>…</span>;
 * ```
 */
export const useKeyboardAction = ({
  disabled = false,
  enabled,
}: UseKeyboardActionOptions = {}): UseKeyboardActionHandler =>
  useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (disabled || !enabled) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;

      event.preventDefault();
      event.currentTarget.click();
    },
    [disabled, enabled]
  );
