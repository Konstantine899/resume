import type { SelectHTMLAttributes } from 'react';

/**
 * Опция kit Select — plain data, без бизнес-логики (план A6):
 * потребитель сам маппит свои enum'ы в `SelectOption[]`.
 */
export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

/** Варианты отделки — выровнены с Input (без `floating` — специфика input). */
export type SelectVariant = 'default' | 'outline' | 'filled';

/** Размеры — union Input + `mapSizeToClass`. */
export type SelectSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Собственные пропсы kit Select (не наследуют HTML-атрибуты `<select>`).
 * Строго управляемый (план A3): `value` + `onChange(value)`; kit про RHF
 * ничего не знает (план A4) — интеграция `setValue` на стороне фичи.
 */
export type SelectOwnProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** Строка потребителя (t()); связка с контролом через htmlFor/id */
  label?: string;
  /** Рендерится как `<option value="">` первым */
  placeholder?: string;
  /** Строка потребителя; включает error-модификатор (контракт Input) */
  error?: string;
  helperText?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  id?: string;
  name?: string;
};

/**
 * Полный набор пропсов: собственные + остальные нативные атрибуты
 * `<select>` (onBlur, form, autoFocus и т.п.), кроме перекрытых.
 */
export type SelectProps = SelectOwnProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'value' | 'onChange'>;
