import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useCallback } from 'react';
import type { CodeProps } from '../model/types';
import { useCopyCode } from '../lib/hooks/useCopyCode';
import { CodeInlineUi } from './CodeInline';
import { CodeBlockUi } from './CodeBlock';

/**
 * Code Component
 * Универсальный компонент для отображения кода (inline и block)
 */
export const Code: React.FC<CodeProps> = ({ children, variant = 'inline', onCopy, ...props }) => {
  // Получаем Toast контекст из shared
  const { addToast } = useToast();

  // Используем хук с Toast интеграцией
  const { isCopied, handleCopy } = useCopyCode(children, {
    addToast,
    showToastOnSuccess: true,
    showToastOnError: true,
    onCopy,
  });

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (props.copyable && !props.disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        handleCopy();
      }
    },
    [props.copyable, props.disabled, handleCopy]
  );

  if (variant === 'inline') {
    return (
      <CodeInlineUi {...props} isCopied={isCopied} onCopy={handleCopy} onKeyDown={handleKeyDown}>
        {children}
      </CodeInlineUi>
    );
  }

  return (
    <CodeBlockUi {...props} isCopied={isCopied} onCopy={handleCopy} onKeyDown={handleKeyDown}>
      {children}
    </CodeBlockUi>
  );
};

Code.displayName = 'Code';

export default Code;
