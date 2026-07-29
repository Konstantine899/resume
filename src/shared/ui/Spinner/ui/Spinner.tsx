import { classNames } from '@/shared/lib/utils/classNames';
import { memo, useMemo, forwardRef } from 'react';
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
      thickness,
      trackColor,
      label,
      className = '',
      style,
      ...restProps
    } = props;

    // Default label with i18n
    const effectiveLabel = label ?? t('loading');

    // ---- CSS custom properties for variants ----

    const inlineStyle = useMemo(() => {
      const vars: Record<string, string> = {};

      if (trackColor) {
        vars['--spinner-track'] = trackColor;
      }

      if (variant === 'double-ring') {
        if (speed) {
          const { doubleRing } = speedMap[speed];
          vars['--double-ring-speed-outer'] = doubleRing.outer;
          vars['--double-ring-speed-inner'] = doubleRing.inner;
        }
        if (thickness) {
          vars['--double-ring-thickness'] = thicknessMap[thickness].doubleRing;
        }
      } else {
        if (speed) {
          vars['--spinner-speed'] = speedMap[speed].spinner;
        }
        if (thickness) {
          vars['--spinner-thickness'] = thicknessMap[thickness].spinner;
        }
      }

      const hasVars = Object.keys(vars).length > 0;
      if (!hasVars && !style) return undefined;
      return { ...vars, ...style } as React.CSSProperties;
    }, [variant, speed, thickness, trackColor, style]);

    // ---- Classes ----

    const rootClassName = classNames(styles.root, styles[size], styles[color], className);

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
        data-size={size}
        data-color={color}
        data-speed={speed}
        data-thickness={thickness}
        {...restProps}
      >
        {variant === 'double-ring' ? (
          <div className={styles.doubleRing}>
            <div className={styles.outerRing} />
            <div className={styles.innerRing} />
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
