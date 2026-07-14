import { cn } from '@/shared/lib/utils/classNames';
import { memo, useCallback } from 'react';
import type { CodeInlineProps } from '../../model/types';
import styles from './CodeInline.module.scss';

export interface CodeInlineUiProps extends CodeInlineProps {
  isCopied?: boolean;
  onCopy?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * CodeInline UI Component
 * Inline variant for displaying code.
 * Поддерживает размеры sm/md/lg, copyable-режим с визуальным индикатором
 * и доступностью (tabIndex, role, aria-label, Enter/Space).
 *
 * @param children - Код для отображения
 * @param size - Размер (sm | md | lg)
 * @param copyable - Включить режим копирования
 * @param isCopied - Состояние "скопировано"
 * @param onCopy - Callback копирования
 * @param onKeyDown - Callback клавиатуры (Enter/Space)
 * @param ariaLabel - aria-label для доступности
 * @param className - Дополнительный CSS-класс
 * @param disabled - Отключить копирование
 */
const CodeInlineUiInner: React.FC<CodeInlineUiProps> = ({
  children,
  size = 'md',
  copyable = false,
  isCopied = false,
  onCopy,
  onKeyDown,
  ariaLabel,
  className,
  disabled = false,
}) => {
  const handleClick = useCallback(() => {
    if (copyable && !disabled) {
      onCopy?.();
    }
  }, [copyable, disabled, onCopy]);

  const codeClassName = cn(
    styles.code,
    styles[size],
    copyable && !disabled && styles.copyable,
    isCopied && styles.copied,
    className
  );

  return (
    <code
      className={codeClassName}
      onClick={copyable && !disabled ? handleClick : undefined}
      onKeyDown={copyable && !disabled ? onKeyDown : undefined}
      tabIndex={copyable && !disabled ? 0 : undefined}
      role={copyable && !disabled ? 'button' : undefined}
      aria-label={ariaLabel || (copyable ? 'Click to copy code' : undefined)}
      data-testid="code-inline"
    >
      {children}
    </code>
  );
};

CodeInlineUiInner.displayName = 'CodeInlineUi';

/** CodeInlineUi — обёрнут в React.memo для оптимизации ре-рендеров */
export const CodeInlineUi = memo(CodeInlineUiInner);

export default CodeInlineUi;
