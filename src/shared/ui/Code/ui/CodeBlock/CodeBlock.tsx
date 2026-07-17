import { classNames } from '@/shared/lib/utils/classNames';
import { memo, useMemo } from 'react';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { CodeBlockProps } from '../../model/types';
import { CODE_DEFAULTS } from '../../model/constants';
import { countLines } from '../../lib/utils/countLines';
import { CodeBlockHeader } from '../CodeBlockHeader/CodeBlockHeader';
import styles from './CodeBlock.module.scss';

export interface CodeBlockUiProps extends CodeBlockProps {
  isCopied?: boolean;
  onCopy?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  ariaLabel?: string;
  className?: string;
  /** Показывать скелетон загрузки */
  skeleton?: boolean;
}

/**
 * CodeBlock UI Component
 * Block variant для отображения кода с header и опциональной нумерацией строк
 */
const CodeBlockUiInner: React.FC<CodeBlockUiProps> = ({
  children,
  language,
  showLineNumbers = CODE_DEFAULTS.showLineNumbers,
  copyable = CODE_DEFAULTS.copyable,
  maxHeight,
  title,
  isCopied = false,
  onCopy,
  onKeyDown,
  ariaLabel,
  className,
  disabled = CODE_DEFAULTS.disabled,
  icons,
  copyButtonSize = 'sm',
  skeleton = false,
  size = CODE_DEFAULTS.size,
}) => {
  const linesCount = useMemo(() => {
    if (!showLineNumbers) return 0;
    return countLines(children);
  }, [children, showLineNumbers]);

  const hasMultipleLines = linesCount > 1;
  const lines = useMemo(() => {
    return Array.from({ length: linesCount }, (_, i) => i + 1);
  }, [linesCount]);

  if (skeleton) {
    return (
      <div
        className={classNames(styles.blockContainer, className)}
        data-testid="code-block"
        role="region"
        aria-label={ariaLabel || (title ? `Code block: ${title}` : 'Code block')}
        data-variant="block"
        data-size={size}
        data-skeleton="true"
        aria-busy="true"
      >
        <CodeBlockHeader
          language={language}
          title={title}
          copyable={copyable}
          icons={icons}
          copyButtonSize={copyButtonSize}
          skeleton
        />
        <div className={styles.blockContent}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={maxHeight || '310px'}
            aria-busy="true"
            data-skeleton="true"
          />
        </div>
      </div>
    );
  }

  const contentClassName = classNames(
    styles.blockContent,
    showLineNumbers && hasMultipleLines && styles.withLineNumbers
  );

  return (
    <div
      className={classNames(styles.blockContainer, className)}
      data-testid="code-block"
      tabIndex={0}
      role="region"
      aria-label={ariaLabel || (title ? `Code block: ${title}` : 'Code block')}
      data-variant="block"
      data-size={size}
      data-skeleton={skeleton || undefined}
      aria-busy={skeleton || undefined}
    >
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

CodeBlockUiInner.displayName = 'CodeBlockUi';

export const CodeBlockUi = memo(CodeBlockUiInner);

export default CodeBlockUi;
