import { classNames } from '@/shared/lib/utils/classNames';
import { memo, forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SpinnerProps } from '../model/types';
import { speedMap, thicknessMap } from '../model/constants';
import styles from './Spinner.module.scss';

// ============================================
// Main component
// ============================================

export const Spinner = memo(
  forwardRef<HTMLDivElement, SpinnerProps>((props, ref) => {
    const { t } = useTranslation();
    const {
      variant = 'spinner',
      size = 'md',
      color = 'primary',
      speed,
      animationDuration,
      thickness,
      borderWidth,
      trackColor,
      delay,
      label,
      className = '',
      style,
      ...restProps
    } = props;

    // ---- CSS custom properties for variants ----

    const inlineStyle = useMemo(() => {
      const vars: Record<string, string> = {};

      if (trackColor) {
        vars['--spinner-track'] = trackColor;
      }

      // Числовой size пишет пиксельный var (SPR-06); preset-класс не применяется
      if (typeof size === 'number') {
        vars['--spinner-size'] = `${size}px`;
      }

      // Алиасы (SPR-07): канонический speed/thickness выигрывают при конфликте
      const resolvedSpeed = speed ?? animationDuration;
      const resolvedThickness = thickness ?? borderWidth;

      if (variant === 'double-ring') {
        if (resolvedSpeed) {
          const { doubleRing } = speedMap[resolvedSpeed];
          vars['--double-ring-speed-outer'] = doubleRing.outer;
          vars['--double-ring-speed-inner'] = doubleRing.inner;
        }
        if (resolvedThickness) {
          vars['--double-ring-thickness'] = thicknessMap[resolvedThickness].doubleRing;
        }
      } else {
        if (resolvedSpeed) {
          vars['--spinner-speed'] = speedMap[resolvedSpeed].spinner;
        }
        if (resolvedThickness) {
          vars['--spinner-thickness'] = thicknessMap[resolvedThickness].spinner;
        }
      }

      // ---- Delay (SPR-03): CSS-only animation-delay ----
      // delay=undefined/0 → 0s (immediate)
      // delay>0 → animation-delay в мс (AntD семантика: задержка появления)
      if (delay !== undefined && delay > 0) {
        vars['--spinner-delay'] = `${delay}ms`;
      }

      const hasVars = Object.keys(vars).length > 0;
      if (!hasVars && !style) return undefined;
      return { ...vars, ...style } as React.CSSProperties;
    }, [variant, size, speed, animationDuration, thickness, borderWidth, trackColor, delay, style]);

    // Default label with i18n
    const effectiveLabel = label ?? t('loading');

    // ---- Classes ----

    // Числовой size не имеет preset-класса — classNames отфильтрует undefined (SPR-06)
    const sizeClass = typeof size === 'number' ? undefined : styles[size];
    const rootClassName = classNames(styles.root, sizeClass, styles[color], className);

    // ---- Render ----

    return (
      <div
        ref={ref}
        className={rootClassName}
        style={inlineStyle}
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label={effectiveLabel}
        data-variant={variant}
        data-size={typeof size === 'string' ? size : undefined}
        data-color={color}
        data-speed={speed}
        data-thickness={thickness}
        {...restProps}
      >
        {variant === 'double-ring' ? (
          <div className={styles.doubleRing}>
            <div className={styles.outerRing} data-testid="spinner-outer-ring" />
            <div className={styles.innerRing} data-testid="spinner-inner-ring" />
          </div>
        ) : (
          <div className={styles.spinner}>
            <div className={styles.spinnerCircle} data-testid="spinner-circle" />
          </div>
        )}
      </div>
    );
  })
);

Spinner.displayName = 'Spinner';
