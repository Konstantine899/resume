import React, { memo, useId, useMemo, useRef, useState } from 'react';
import { Input } from '@/shared/ui/Input';
import { useLanguage } from '@/shared/lib/i18n';
import type { ComboboxOption, ComboboxProps } from '../model/types';
import styles from './Combobox.module.scss';

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((current) => current !== value)
    : [...values, value];
}

export const Combobox = memo((props: ComboboxProps) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listId = `combobox-listbox-${useId()}`;

  const selectedSet = useMemo(() => new Set(props.values), [props.values]);
  const filteredOptions = useMemo<ComboboxOption[]>(() => {
    return props.options.filter((option) => {
      const needle = query.trim().toLowerCase();
      if (needle === '') return true;
      return (
        option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle)
      );
    });
  }, [props.options, query]);

  const moveActive = (delta: number): void => {
    if (filteredOptions.length === 0) return;
    setOpen(true);
    setActiveIndex((current) => {
      const next =
        current === -1 ? (delta === 1 ? 0 : filteredOptions.length - 1) : current + delta;
      return (next + filteredOptions.length) % filteredOptions.length;
    });
  };

  const selectOption = (option: ComboboxOption): void => {
    props.onChange(toggleValue(props.values, option.value));
    setQuery('');
    setActiveIndex(-1);
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(-1);
        break;
      case 'Enter':
        event.preventDefault();
        if (open && activeIndex >= 0) {
          const selected = filteredOptions[activeIndex];
          if (selected) selectOption(selected);
        }
        break;
      case 'Escape':
        setOpen(false);
        setActiveIndex(-1);
        break;
      case 'Backspace':
        if (!query && props.values.length > 0) {
          props.onChange(props.values.slice(0, -1));
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.root}>
      <Input
        label={props.label}
        value={query}
        role="combobox"
        placeholder={props.placeholder}
        disabled={props.disabled}
        fullWidth
        id="combobox-input"
        aria-controls={listId}
        aria-expanded={open}
        aria-autocomplete="list"
        onChange={(event) => {
          setQuery((event.target as HTMLInputElement).value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={onKeyDown}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
      />

      <div className={styles.selected}>
        {props.values.map((value) => {
          const option = props.options.find((candidate) => candidate.value === value);
          const label = option?.label ?? value;
          return (
            <span key={value} className={styles.chip}>
              <span>{label}</span>
              <button
                type="button"
                className={styles.remove}
                aria-label={t('comboboxRemove') + ' ' + label}
                onClick={() => props.onChange(props.values.filter((entry) => entry !== value))}
              >
                ×
              </button>
            </span>
          );
        })}
      </div>

      {open && (
        <ul id={listId} role="listbox" aria-label={props.label} className={styles.panel}>
          {filteredOptions.length === 0 && (
            <li className={styles.emptyOption} role="option" aria-live="polite">
              {props.emptyText ?? t('comboboxNoOptions')}
            </li>
          )}
          {filteredOptions.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-label={option.label}
              aria-selected={selectedSet.has(option.value)}
              className={index === activeIndex ? styles.active : ''}
              onMouseDown={(event) => {
                event.preventDefault();
                selectOption(option);
              }}
            >
              {option.iconUrl ? (
                <img src={option.iconUrl} alt="" className={styles.optionIcon} />
              ) : null}
              <span>{option.label}</span>
              {option.description ? <small>{option.description}</small> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

Combobox.displayName = 'Combobox';
