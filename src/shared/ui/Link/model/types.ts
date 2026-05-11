// src/shared/ui/Link/model/types.ts
import type { LucideIcon } from 'lucide-react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

export type LinkVariant = 'primary' | 'secondary' | 'ghost' | 'gradient';
export type LinkSize = 'sm' | 'md' | 'lg';
export type LinkUnderline = 'always' | 'hover' | 'never';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** URL ссылки */
  href: string;
  /** Текст ссылки */
  children?: ReactNode;
  /** Вариант отображения */
  variant?: LinkVariant;
  /** Размер */
  size?: LinkSize;
  /** Внешняя ссылка (откроется в новой вкладке) */
  external?: boolean;
  /** Иконка слева (ReactNode) */
  icon?: ReactNode;
  /** Иконка справа (ReactNode) */
  iconRight?: ReactNode;
  /** Показать иконку внешней ссылки для external ссылок */
  showExternalIcon?: boolean;
  /** Кастомная иконка внешней ссылки (LucideIcon компонент) */
  externalIcon?: LucideIcon;
  /** Отключить стилизацию */
  unstyled?: boolean;
  /** Подчеркивание */
  underline?: LinkUnderline;
  /** Добавить hover lift эффект */
  withLift?: boolean;
  /** Валидация href (предупреждение если пустой) */
  requireHref?: boolean;
}
