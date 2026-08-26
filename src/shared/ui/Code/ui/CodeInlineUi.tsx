// src/shared/ui/Code/ui/CodeInlineUi.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { forwardRef, memo, useCallback } from 'react';
import type { CodeInlineProps } from '../model/types';
import { CODE_DEFAULTS } from '../model/constants';
import { CodeSkeleton } from './CodeSkeleton/CodeSkeleton';
import styles from './CodeInlineUi.module.scss';

export interface CodeInlineUiProps extends CodeInlineProps {
  isCopied?: boolean;
  onCopy?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  ariaLabel?: string;
  className?: string;
  /** Показывать скелетон загрузки */
  skeleton?: boolean;
}

/**
 * CodeInline UI Component
 * Inline variant for displaying code.
 * Поддерживает размеры sm/md/lg, copyable-режим с визуальным индикатором,
 * skeleton-режим для состояния загрузки и доступностью (tabIndex, role, aria-label, Enter/Space).
 */
export const CodeInlineUi = memo(
  forwardRef<HTMLElement, CodeInlineUiProps>(
    (
      {
        children,
        size = CODE_DEFAULTS.size,
        copyable = CODE_DEFAULTS.copyable,
        isCopied = false,
        onCopy,
        onKeyDown,
        ariaLabel,
        className,
        disabled = CODE_DEFAULTS.disabled,
        skeleton = false,
      },
      ref
    ) => {
      const handleClick = useCallback(() => {
        if (copyable && !disabled) {
          onCopy?.();
        }
      }, [copyable, disabled, onCopy]);

      if (skeleton) {
        return <CodeSkeleton variant="inline" size={size} className={className} />;
      }

      const codeClassName = classNames(
        styles.code,
        styles[size],
        copyable && !disabled && styles.copyable,
        isCopied && styles.copied,
        className
      );

      return (
        <code
          ref={ref}
          className={codeClassName}
          onClick={copyable && !disabled ? handleClick : undefined}
          onKeyDown={copyable && !disabled ? onKeyDown : undefined}
          tabIndex={copyable && !disabled ? 0 : undefined}
          role={copyable && !disabled ? 'button' : undefined}
          aria-label={ariaLabel || (copyable ? 'Click to copy code' : undefined)}
          data-testid="code-inline"
          data-size={size}
          data-variant="inline"
          aria-busy={skeleton || undefined}
          data-skeleton={skeleton || undefined}
        >
          {children}
        </code>
      );
    }
  )
);

CodeInlineUi.displayName = 'CodeInlineUi';
