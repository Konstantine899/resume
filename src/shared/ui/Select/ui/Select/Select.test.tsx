// src/shared/ui/Select/ui/Select/Select.test.tsx

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';
import type { SelectOption } from '../../model/types';
import styles from './Select.module.scss';

const OPTIONS: SelectOption[] = [
  { value: 'full-time', label: 'Full time' },
  { value: 'part-time', label: 'Part time' },
  { value: 'contract', label: 'Contract', disabled: true },
];

describe('Select', () => {
  it('renders one option per options entry', () => {
    render(<Select options={OPTIONS} value="" onChange={vi.fn()} aria-label="Employment" />);

    const select = screen.getByRole('combobox', { name: 'Employment' });
    const options = within(select).getAllByRole('option');

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('Full time');
    expect(options[2]).toHaveTextContent('Contract');
    expect(options[2]).toBeDisabled();
  });

  it('renders placeholder as the first empty-value option', () => {
    render(
      <Select
        options={OPTIONS}
        value=""
        onChange={vi.fn()}
        placeholder="Choose…"
        aria-label="Employment"
      />
    );

    const select = screen.getByRole('combobox', { name: 'Employment' });
    const options = within(select).getAllByRole('option');

    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent('Choose…');
    expect(options[0]).toHaveValue('');
    expect(select).toHaveValue('');
  });

  it('is controlled: the selected option follows value', () => {
    render(
      <Select options={OPTIONS} value="part-time" onChange={vi.fn()} aria-label="Employment" />
    );

    expect(screen.getByRole('combobox', { name: 'Employment' })).toHaveValue('part-time');
  });

  it('reports the chosen value through onChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Select options={OPTIONS} value="" onChange={handleChange} aria-label="Employment" />);

    await user.selectOptions(screen.getByRole('combobox', { name: 'Employment' }), 'full-time');

    expect(handleChange).toHaveBeenCalledWith('full-time');
  });

  it('associates the visible label with the control via htmlFor/id', () => {
    render(<Select options={OPTIONS} value="" onChange={vi.fn()} label="Employment type" />);

    expect(screen.getByLabelText('Employment type')).toBe(
      screen.getByRole('combobox', { name: 'Employment type' })
    );
  });

  it('maps the native required attribute', () => {
    render(
      <Select options={OPTIONS} value="" onChange={vi.fn()} aria-label="Employment" required />
    );

    expect(screen.getByRole('combobox', { name: 'Employment' })).toBeRequired();
  });

  it('exposes error via aria-invalid, aria-describedby and visible text', () => {
    render(
      <Select
        options={OPTIONS}
        value=""
        onChange={vi.fn()}
        aria-label="Employment"
        error="Pick one"
      />
    );

    const select = screen.getByRole('combobox', { name: 'Employment' });
    const errorText = screen.getByText('Pick one');

    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select.getAttribute('aria-describedby')).toContain(errorText.id);
  });

  it('keeps helperText when there is no error', () => {
    render(
      <Select
        options={OPTIONS}
        value=""
        onChange={vi.fn()}
        aria-label="Employment"
        helperText="As in the contract"
      />
    );

    const select = screen.getByRole('combobox', { name: 'Employment' });
    const helper = screen.getByText('As in the contract');

    expect(select).not.toHaveAttribute('aria-invalid');
    expect(select.getAttribute('aria-describedby')).toContain(helper.id);
  });

  it('disables the control', () => {
    render(
      <Select options={OPTIONS} value="" onChange={vi.fn()} aria-label="Employment" disabled />
    );

    expect(screen.getByRole('combobox', { name: 'Employment' })).toBeDisabled();
  });

  it('maps size and variant to CSS modifiers and merges className', () => {
    const { container } = render(
      <Select
        options={OPTIONS}
        value=""
        onChange={vi.fn()}
        aria-label="Employment"
        size="lg"
        variant="filled"
        className="extra-class"
      />
    );

    const select = screen.getByRole('combobox', { name: 'Employment' });

    expect(select).toHaveClass(styles.lg ?? '');
    expect(select).toHaveClass(styles.filled ?? '');
    expect(container.firstElementChild).toHaveClass('extra-class');
  });

  it('renders no hardcoded kit copy — text equals consumer strings exactly (plan A2)', () => {
    const { container } = render(
      <Select
        options={OPTIONS}
        value="full-time"
        onChange={vi.fn()}
        label="Employment type"
        placeholder="Choose…"
        error="Pick one"
      />
    );

    expect(container.textContent).toBe('Employment typeChoose…Full timePart timeContractPick one');
  });
});
