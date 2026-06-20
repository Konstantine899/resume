import { cn } from '@/shared/lib/utils/classNames';
import { useCallback } from 'react';
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
 * Inline variant for displaying code
 */
export const CodeInlineUi: React.FC<CodeInlineUiProps> = ({
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

CodeInlineUi.displayName = 'CodeInlineUi';

export default CodeInlineUi;
