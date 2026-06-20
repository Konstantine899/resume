import { cn } from '@/shared/lib/utils/classNames';
import { useMemo } from 'react';
import type { CodeBlockProps } from '../../model/types';
import { countLines } from '../../lib/utils/countLines';
import { CodeBlockHeader } from '../CodeBlockHeader';
import styles from './CodeBlock.module.scss';

export interface CodeBlockUiProps extends CodeBlockProps {
  isCopied?: boolean;
  onCopy?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  ariaLabel?: string;
  className?: string;
}

/**
 * CodeBlock UI Component
 * Block variant для отображения кода с header и опциональной нумерацией строк
 */
export const CodeBlockUi: React.FC<CodeBlockUiProps> = ({
  children,
  language,
  showLineNumbers = false,
  copyable = false,
  maxHeight,
  title,
  isCopied = false,
  onCopy,
  onKeyDown,
  ariaLabel,
  className,
  disabled = false,
  icons,
  copyButtonSize = 'sm',
}) => {
  // Подсчёт строк для нумерации
  const linesCount = useMemo(() => {
    if (!showLineNumbers) return 0;
    return countLines(children);
  }, [children, showLineNumbers]);

  const hasMultipleLines = linesCount > 1;
  const lines = useMemo(() => {
    return Array.from({ length: linesCount }, (_, i) => i + 1);
  }, [linesCount]);

  const contentClassName = cn(
    styles.blockContent,
    showLineNumbers && hasMultipleLines && styles.withLineNumbers
  );

  return (
    <div
      className={cn(styles.blockContainer, className)}
      data-testid="code-block"
      aria-label={ariaLabel}
    >
      {/* Header с terminal dots, language/title и copy button */}
      <CodeBlockHeader
        language={language}
        title={title}
        copyable={copyable}
        isCopied={isCopied}
        onCopy={onCopy}
        onKeyDown={onKeyDown}
        disabled={disabled}
        icons={icons}
        copyButtonSize={copyButtonSize}
      />

      {/* Code content */}
      <div className={contentClassName} style={{ maxHeight }}>
        {showLineNumbers && hasMultipleLines ? (
          <>
            <div className={styles.lineNumbers} aria-hidden="true">
              {lines.map((lineNumber) => (
                <div key={lineNumber} className={styles.lineNumber}>
                  {lineNumber}
                </div>
              ))}
            </div>
            <pre className={styles.pre}>
              <code>{children}</code>
            </pre>
          </>
        ) : (
          <pre className={styles.pre}>
            <code>{children}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

CodeBlockUi.displayName = 'CodeBlockUi';

export default CodeBlockUi;
