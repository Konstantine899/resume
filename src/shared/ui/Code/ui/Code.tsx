import { useToast } from '@/shared/lib/contexts/ToastContext';
import { cn } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { Check, Copy } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useCopyCode } from '../lib/hooks/useCopyCode';
import type { CodeProps } from '../model/types';
import styles from './Code.module.scss';

/**
 * Code компонент для отображения кода
 */
export const Code: React.FC<CodeProps> = ({
  children,
  variant = 'inline',
  size = 'md',
  language,
  showLineNumbers = false,
  copyable = false,
  maxHeight,
  className,
  title,
  onCopy,
  disabled = false,
  ariaLabel,
  icons,
  copyButtonSize = 'sm',
}) => {
  // Получаем Toast контекст из shared
  const { addToast } = useToast();

  // Используем хук с Toast интеграцией
  const { isCopied, handleCopy } = useCopyCode(children, {
    addToast,
    showToastOnSuccess: true,
    showToastOnError: true,
    onCopy,
  });

  // Оптимизация: разбиваем на строки только для block с нумерацией
  const lines = useMemo(() => {
    if (variant !== 'block' || !showLineNumbers) return [];
    return children.split('\n');
  }, [children, variant, showLineNumbers]);

  const hasMultipleLines = lines.length > 1;

  // Иконки по умолчанию
  const CopyIcon = icons?.copy ?? Copy;
  const CopiedIcon = icons?.copied ?? Check;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (copyable && !disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        handleCopy();
      }
    },
    [copyable, disabled, handleCopy]
  );

  const codeClassName = cn(
    styles.code,
    styles[variant],
    styles[size],
    copyable && styles.copyable,
    isCopied && styles.copied,
    className
  );

  const renderInlineCode = () => (
    <code
      className={codeClassName}
      onClick={copyable && !disabled ? handleCopy : undefined}
      onKeyDown={copyable && !disabled ? handleKeyDown : undefined}
      tabIndex={copyable && !disabled ? 0 : undefined}
      role={copyable && !disabled ? 'button' : undefined}
      aria-label={ariaLabel || (copyable ? 'Click to copy code' : undefined)}
      data-testid="code-inline"
    >
      {children}
    </code>
  );

  const renderBlockCode = () => (
    <div
      className={cn(styles.blockContainer, className)}
      data-testid="code-block"
      aria-label={ariaLabel}
    >
      {(title || copyable) && (
        <div className={styles.blockHeader}>
          {title && (
            <div className={styles.blockTitle}>
              {language && <span className={styles.language}>{language}</span>}
              {title}
            </div>
          )}

          {copyable && !disabled && (
            <Button
              variant="ghost"
              size={copyButtonSize}
              icon={isCopied ? <CopiedIcon size={14} /> : <CopyIcon size={14} />}
              onClick={handleCopy}
              onKeyDown={handleKeyDown}
              aria-label={isCopied ? 'Copied!' : 'Copy code'}
              data-testid="code-copy-button"
              className={cn(isCopied && styles.copied)}
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>
          )}
        </div>
      )}

      <div
        className={cn(
          styles.blockContent,
          showLineNumbers && hasMultipleLines && styles.withLineNumbers
        )}
        style={{ maxHeight }}
      >
        {showLineNumbers && hasMultipleLines ? (
          <>
            <div className={styles.lineNumbers} aria-hidden="true">
              {lines.map((_, index) => (
                <div key={index} className={styles.lineNumber}>
                  {index + 1}
                </div>
              ))}
            </div>
            <pre className={styles.pre}>
              <code className={styles.code}>{children}</code>
            </pre>
          </>
        ) : (
          <pre className={styles.pre}>
            <code className={styles.code}>{children}</code>
          </pre>
        )}
      </div>
    </div>
  );

  return variant === 'inline' ? renderInlineCode() : renderBlockCode();
};

Code.displayName = 'Code';

export default Code;
