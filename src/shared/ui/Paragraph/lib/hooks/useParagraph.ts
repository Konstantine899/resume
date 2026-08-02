// src/shared/ui/Paragraph/lib/hooks/useParagraph.ts

import { useMemo } from 'react';
import type { ElementType } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { mapSizeToClass } from '@/shared/lib/utils/mapSizeToClass';
import { resolveCssModuleKey } from '@/shared/lib/utils/resolveCssModuleKey';
import { isValidLineClamp } from '../../model/constants';
import {
  validateParagraphProps,
  type ParagraphValidationProps,
} from '../utils/validateParagraphProps';
import cls from '../../ui/Paragraph.module.scss';

/**
 * Props для хука useParagraph
 */
export type ParagraphHookProps = ParagraphValidationProps & {
  /** Корневой элемент (строка или компонент) */
  as?: ElementType;
  /** Дополнительный CSS класс */
  className?: string;
};

/**
 * Возвращаемое значение хука useParagraph
 */
export interface UseParagraphReturn {
  /** Вычисленный className (CSS module классы + модификаторы + custom className) */
  paragraphClassName: string;
  /** Data-атрибуты для распространения на элемент */
  dataAttrs: Record<string, string>;
}

/**
 * Shared hook, который консолидирует логику Paragraph: вычисление className,
 * генерацию data-атрибутов и синхронную валидацию (только development).
 *
 * @remarks
 * - Called during render (no useEffect wrapper)
 * - Validation runs synchronously ONLY in development mode
 * - Zero production overhead: validation is completely skipped when NODE_ENV !== 'development'
 * - Поведенческий noop: дублирует className-логику, ранее жившую в Paragraph.tsx
 *
 * @param props - Paragraph конфигурация (ParagraphHookProps)
 * @returns Объект с paragraphClassName (string) и dataAttrs (Record)
 *
 * @example
 * ```typescript
 * const { paragraphClassName, dataAttrs } = useParagraph({ size: 'xl', theme: 'muted', as: 'p' });
 * ```
 */
export const useParagraph = ({
  size = 'm',
  theme = 'primary',
  align = 'left',
  weight,
  wrap,
  truncate,
  lineClamp,
  as = 'p',
  className,
}: ParagraphHookProps): UseParagraphReturn => {
  // Synchronous validation (development only)
  if (process.env.NODE_ENV === 'development') {
    validateParagraphProps({ size, theme, align, weight, wrap, truncate, lineClamp });
  }

  // Валидация lineClamp (только 2-5) — поведение сохранено из Paragraph.tsx
  const validatedLineClamp = lineClamp && isValidLineClamp(lineClamp) ? lineClamp : undefined;

  // Мемоизированное вычисление className (mapSizeToClass + модификаторы)
  const paragraphClassName = useMemo(() => {
    // Маппинг размера в класс SCSS модуля через утилиту.
    // resolveCssModuleKey: сборка экспортирует camelCase-ключи (camelCaseOnly),
    // поэтому kebab-ключи вида `size-2xl` резолвятся в `size2Xl`.
    const sizeClass = resolveCssModuleKey(cls, mapSizeToClass(size));
    const lineClampClass =
      validatedLineClamp && !truncate
        ? resolveCssModuleKey(cls, `line-clamp-${validatedLineClamp}`)
        : '';

    // Все классы резолвятся через resolveCssModuleKey (camelCaseOnly build) и
    // truthy-guard'ятся: при отсутствии ключа возвращается '' и класс не попадает
    // в DOM (защита от случайного литерала "undefined").
    const themeClass = resolveCssModuleKey(cls, theme);
    const alignClass = resolveCssModuleKey(cls, align);
    const weightClass = weight ? resolveCssModuleKey(cls, weight) : '';
    const wrapClass = wrap ? resolveCssModuleKey(cls, wrap) : '';
    const truncateClass = truncate ? resolveCssModuleKey(cls, 'truncate') : '';

    const mods: Record<string, boolean | undefined> = {
      ...(sizeClass && { [sizeClass]: true }),
      ...(themeClass && { [themeClass]: true }),
      ...(alignClass && { [alignClass]: true }),
      ...(lineClampClass && { [lineClampClass]: true }),
      ...(weightClass && { [weightClass]: true }),
      ...(wrapClass && { [wrapClass]: true }),
      ...(truncateClass && { [truncateClass]: true }),
    };

    return classNames(cls.paragraph, mods, [className]);
  }, [size, theme, align, weight, wrap, truncate, validatedLineClamp, className]);

  // Data-атрибуты для стилизации и тестирования.
  // data-as присутствует только для строковых элементов (компоненты его не имеют).
  const dataAttrs: Record<string, string> = {
    'data-size': size,
    'data-theme': theme,
    'data-align': align,
    ...(typeof as === 'string' ? { 'data-as': as } : {}),
  };

  return {
    paragraphClassName,
    dataAttrs,
  };
};
