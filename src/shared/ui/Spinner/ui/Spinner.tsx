import { classNames } from '@/shared/lib/utils/classNames';
import { memo, useEffect, useMemo } from 'react';
import type { SpinnerProps, SpinnerSpeed, SpinnerThickness } from '../model/types';
import { validateSpinnerProps } from '../lib/validateSpinnerProps';
import styles from './Spinner.module.scss';

// ============================================
// Speed mapping
// ============================================

const speedMap: Record<
  SpinnerSpeed,
  { spinner: string; doubleRing: { outer: string; inner: string } }
> = {
  slow: { spinner: '1.2s', doubleRing: { outer: '1.5s', inner: '1.3s' } },
  normal: { spinner: '0.8s', doubleRing: { outer: '1s', inner: '0.85s' } },
  fast: { spinner: '0.4s', doubleRing: { outer: '0.6s', inner: '0.5s' } },
};

// ============================================
// Thickness mapping
// ============================================

const thicknessMap: Record<SpinnerThickness, { spinner: string; doubleRing: string }> = {
  thin: { spinner: '1.5px', doubleRing: '3px' },
  normal: { spinner: '2px', doubleRing: '4px' },
  thick: { spinner: '3px', doubleRing: '5px' },
};

// ============================================
// Accessibility attributes
// ============================================

const accessibilityProps = {
  role: 'status' as const,
  'aria-busy': 'true' as const,
};

// ============================================
// Main component
// ============================================

export const Spinner = memo((props: SpinnerProps) => {
  const {
    variant = 'spinner',
    size = 'md',
    color = 'primary',
    speed,
    thickness,
    trackColor,
    label = 'Loading',
    className = '',
    style,
    ...restProps
  } = props;

  // Dev warnings for invalid props
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const warnings = validateSpinnerProps(
        variant,
        size,
        color,
        speed ?? 'normal',
        thickness ?? 'normal'
      );
      warnings.forEach((w) => {
        // eslint-disable-next-line no-console
        console.warn(w.message);
      });
    }
  }, [variant, size, color, speed, thickness]);

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
    <div className={rootClassName} style={inlineStyle} {...restProps}>
      {variant === 'double-ring' ? (
        <div className={styles.doubleRing} {...accessibilityProps} aria-label={label}>
          <div className={styles.outerRing} />
          <div className={styles.innerRing} />
        </div>
      ) : (
        <div className={styles.spinner} {...accessibilityProps} aria-label={label}>
          <div className={styles.spinnerCircle} />
        </div>
      )}
    </div>
  );
});

Spinner.displayName = 'Spinner';
