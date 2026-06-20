import type { ButtonSize } from '@/shared/ui/Button/model/types';
import type { LucideIcon } from 'lucide-react';

export type CodeSize = 'sm' | 'md' | 'lg';
export type CodeVariant = 'inline' | 'block';
export type CodeLanguage =
  | 'typescript'
  | 'javascript'
  | 'css'
  | 'html'
  | 'json'
  | 'bash'
  | 'python'
  | string;

export interface CodeIcons {
  /** Иконка копирования */
  copy?: LucideIcon;
  /** Иконка успешного копирования */
  copied?: LucideIcon;
}

export interface CodeInlineProps {
  /** Код для отображения */
  children: React.ReactNode;
  /** Размер */
  size?: CodeSize;
  /** Копировать по клику */
  copyable?: boolean;
  /** Дополнительный класс */
  className?: string;
  /** Отключить копирование */
  disabled?: boolean;
}

export interface CodeBlockProps {
  /** Код для отображения */
  children: React.ReactNode;
  /** Размер */
  size?: CodeSize;
  /** Язык программирования */
  language?: CodeLanguage;
  /** Показать нумерацию строк */
  showLineNumbers?: boolean;
  /** Копировать по клику */
  copyable?: boolean;
  /** Максимальная высота */
  maxHeight?: string;
  /** Дополнительный класс */
  className?: string;
  /** Заголовок */
  title?: string;
  /** Отключить копирование */
  disabled?: boolean;
  /** Accessibility label */
  ariaLabel?: string;
  /** Кастомные иконки */
  icons?: CodeIcons;
  /** Размер кнопки копирования */
  copyButtonSize?: ButtonSize;
}

export interface CodeProps {
  /** Код для отображения */
  children: React.ReactNode;
  /** Вариант отображения */
  variant?: CodeVariant;
  /** Размер */
  size?: CodeSize;
  /** Язык программирования */
  language?: CodeLanguage;
  /** Показать нумерацию строк (для block) */
  showLineNumbers?: boolean;
  /** Копировать по клику */
  copyable?: boolean;
  /** Максимальная высота (для block) */
  maxHeight?: string;
  /** Дополнительный класс */
  className?: string;
  /** Заголовок для block variant */
  title?: string;
  /** Callback при копировании */
  onCopy?: () => void;
  /** Отключить копирование */
  disabled?: boolean;
  /** Accessibility label */
  ariaLabel?: string;
  /** Кастомные иконки */
  icons?: CodeIcons;
  /** Размер кнопки копирования */
  copyButtonSize?: ButtonSize;
}
