import { cn } from '@/shared/lib/utils/classNames';
import { memo } from 'react';
import { ButtonWithIcon } from '@/shared/ui/Button';
import type { ButtonSize } from '@/shared/ui/Button/model/types';
import { Check, Copy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CodeLanguage } from '../../model/types';
import styles from './CodeBlockHeader.module.scss';

export interface CodeBlockHeaderProps {
  /** Язык программирования */
  language?: CodeLanguage;
  /** Заголовок */
  title?: string;
  /** Копировать по клику */
  copyable?: boolean;
  /** Скопировано */
  isCopied?: boolean;
  /** Callback копирования */
  onCopy?: () => void;
  /** Callback клавиатуры */
  onKeyDown?: (event: React.KeyboardEvent) => void;
  /** Отключить */
  disabled?: boolean;
  /** Кастомные иконки */
  icons?: {
    copy?: LucideIcon;
    copied?: LucideIcon;
  };
  /** Размер кнопки */
  copyButtonSize?: ButtonSize;
  /** Дополнительный класс */
  className?: string;
}

/**
 * CodeBlockHeader UI Component
 * Header с terminal dots, language/title и copy button справа вверху
 *
 * @param language - Язык программирования (отображается в badge)
 * @param title - Заголовок файла
 * @param copyable - Показывать кнопку копирования
 * @param isCopied - Состояние "скопировано"
 * @param onCopy - Callback копирования
 * @param onKeyDown - Callback клавиатуры (Enter/Space)
 * @param disabled - Отключить копирование
 * @param icons - Кастомные иконки copy/copied
 * @param copyButtonSize - Размер кнопки копирования
 * @param className - Дополнительный CSS-класс
 */
const CodeBlockHeaderInner: React.FC<CodeBlockHeaderProps> = ({
  language,
  title,
  copyable = false,
  isCopied = false,
  onCopy,
  onKeyDown,
  disabled = false,
  icons,
  copyButtonSize = 'sm',
  className,
}) => {
  const CopyIcon = icons?.copy ?? Copy;
  const CopiedIcon = icons?.copied ?? Check;

  return (
    <div className={cn(styles.blockHeader, className)}>
      <div className={styles.blockHeaderLeft}>
        {/* Terminal dots */}
        <div className={styles.terminalDots}>
          <div className={`${styles.dot} ${styles.red}`} />
          <div className={`${styles.dot} ${styles.yellow}`} />
          <div className={`${styles.dot} ${styles.green}`} />
        </div>

        {/* Language & Title */}
        {title && (
          <div className={styles.blockTitle}>
            {language && <span className={styles.language}>{language}</span>}
            {title}
          </div>
        )}
      </div>

      {/* Copy button - СПРАВА ВВЕРХУ */}
      {copyable && !disabled && (
        <ButtonWithIcon
          variant="ghost"
          size={copyButtonSize}
          leftIcon={isCopied ? <CopiedIcon size={14} /> : <CopyIcon size={14} />}
          onClick={onCopy}
          onKeyDown={onKeyDown}
          aria-label={isCopied ? 'Copied!' : 'Copy code'}
          data-testid="code-copy-button"
          className={cn(styles.copyButton, isCopied && styles.copied)}
        >
          {isCopied ? 'Copied!' : 'Copy'}
        </ButtonWithIcon>
      )}
    </div>
  );
};

CodeBlockHeaderInner.displayName = 'CodeBlockHeader';

/** CodeBlockHeader — обёрнут в React.memo для оптимизации ре-рендеров */
export const CodeBlockHeader = memo(CodeBlockHeaderInner);

export default CodeBlockHeader;
