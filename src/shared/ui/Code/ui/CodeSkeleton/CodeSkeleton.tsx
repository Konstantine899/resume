import { classNames } from '@/shared/lib/utils/classNames';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { CodeSize } from '../../model/types';
import { CODE_DEFAULTS } from '../../model/constants';
import styles from './CodeSkeleton.module.scss';

export interface CodeSkeletonProps {
  /** Вариант скелетона: inline — текстовый, block — блок с header + контентом */
  variant?: 'inline' | 'block';
  /** Размер (влияет на размеры inline-скелетона) */
  size?: CodeSize;
  /** Язык для skeleton-бейджа (только block) */
  language?: string;
  /** Заголовок для skeleton (только block) */
  title?: string;
  /** Показывать skeleton кнопки копирования (только block) */
  copyable?: boolean;
  className?: string;
}

const INLINE_WIDTH: Record<CodeSize, string> = {
  sm: '60px',
  md: '80px',
  lg: '120px',
};

const INLINE_HEIGHT: Record<CodeSize, string> = {
  sm: '1em',
  md: '1em',
  lg: '1.5em',
};

/**
 * CodeSkeleton — единая точка рендера skeleton-состояний компонента Code.
 * Заменяет дублирование Skeleton в CodeInlineUi, CodeBlock и CodeBlockHeader (DRY, SR6).
 */
export const CodeSkeleton = ({
  variant = 'inline',
  size = CODE_DEFAULTS.size,
  language,
  title,
  copyable = false,
  className,
}: CodeSkeletonProps) => {
  if (variant === 'inline') {
    return (
      <Skeleton
        variant="text"
        width={INLINE_WIDTH[size]}
        height={INLINE_HEIGHT[size]}
        className={className}
        aria-busy="true"
        data-skeleton="true"
      />
    );
  }

  return (
    <div
      className={classNames(styles.blockSkeleton, className)}
      aria-busy="true"
      data-skeleton="true"
    >
      <div className={styles.header}>
        <div className={styles.terminalDots}>
          <div className={classNames(styles.dot, styles.red)} />
          <div className={classNames(styles.dot, styles.yellow)} />
          <div className={classNames(styles.dot, styles.green)} />
        </div>
        <div className={styles.title}>
          {language && (
            <Skeleton variant="text" width="36px" height="0.75rem" className={styles.language} />
          )}
          {title && <Skeleton variant="text" width="120px" height="0.875rem" />}
        </div>
        {copyable && (
          <Skeleton
            variant="rectangular"
            width="64px"
            height="28px"
            className={styles.copyButton}
          />
        )}
      </div>
      <Skeleton
        variant="rectangular"
        width="100%"
        height="310px"
        aria-busy="true"
        data-skeleton="true"
      />
    </div>
  );
};

CodeSkeleton.displayName = 'CodeSkeleton';
