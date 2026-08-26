import { forwardRef, useCallback } from 'react';
import type { CodeProps } from '../model/types';
import { CODE_DEFAULTS } from '../model/constants';
import { useCopyCode } from '../lib/hooks/useCopyCode';
import { CodeInlineUi } from './CodeInlineUi';
import { CodeBlockUi } from './CodeBlock/CodeBlock';

/**
 * Code Component
 * Универсальный компонент для отображения кода (inline и block)
 *
 * Поддерживает skeleton-режим для состояния загрузки.
 */
export const Code = forwardRef<HTMLElement, CodeProps>(
  (
    { children, variant = CODE_DEFAULTS.variant, onCopy, onCopyResult, skeleton = false, ...props },
    ref
  ) => {
    const { isCopied, handleCopy } = useCopyCode(children, {
      onCopyResult,
      onCopy,
      enabled: !skeleton,
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

    // Skeleton mode
    if (skeleton) {
      if (variant === 'block') {
        return (
          <CodeBlockUi
            {...props}
            ref={ref as React.Ref<HTMLDivElement>}
            skeleton
            onCopy={handleCopy}
          >
            {children}
          </CodeBlockUi>
        );
      }
      return (
        <CodeInlineUi {...props} ref={ref} skeleton onCopy={handleCopy}>
          {children}
        </CodeInlineUi>
      );
    }

    if (variant === 'inline') {
      return (
        <CodeInlineUi
          {...props}
          ref={ref}
          isCopied={isCopied}
          onCopy={handleCopy}
          onKeyDown={handleKeyDown}
        >
          {children}
        </CodeInlineUi>
      );
    }

    return (
      <CodeBlockUi
        {...props}
        ref={ref as React.Ref<HTMLDivElement>}
        isCopied={isCopied}
        onCopy={handleCopy}
        onKeyDown={handleKeyDown}
      >
        {children}
      </CodeBlockUi>
    );
  }
);

Code.displayName = 'Code';
