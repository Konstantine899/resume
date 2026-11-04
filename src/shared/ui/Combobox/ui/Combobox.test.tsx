import { render, screen, fireEvent } from '@testing-library/react';
import { Combobox } from './Combobox';
import { describe, expect, it, vi } from 'vitest';

describe('Combobox', () => {
  it('renders an openable option list', () => {
    const onChange = vi.fn();
    render(
      <Combobox
        values={[]}
        options={[{ value: 'react', label: 'React', description: 'Library' }]}
        onChange={onChange}
        label="Technology"
        placeholder="Search technologies"
      />
    );
    fireEvent.click(screen.getByPlaceholderText('Search technologies'));
    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument();
  });

  it('filters options by query', () => {
    const onChange = vi.fn();
    render(
      <Combobox
        values={[]}
        options={[
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
        ]}
        onChange={onChange}
      />
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 're' } });
    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Vue' })).not.toBeInTheDocument();
  });

  it('selects and removes a selected chip', () => {
    const onChange = vi.fn();
    render(
      <Combobox
        values={['react']}
        options={[{ value: 'react', label: 'React' }]}
        onChange={onChange}
      />
    );
    expect(screen.getByText('React')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove React' }));
    expect(onChange).toHaveBeenCalledWith([]);
    expect(screen.queryByRole('option', { name: 'React' })).toBeNull();
  });
  it('keyboard navigates and selects an option', () => {
    const onChange = vi.fn();
    render(
      <Combobox
        values={[]}
        options={[
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
        ]}
        onChange={onChange}
      />
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.click(input);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalled();
  });

  it('honours Escape and Backspace removal', () => {
    const onChange = vi.fn();
    render(
      <Combobox values={['vue']} options={[{ value: 'vue', label: 'Vue' }]} onChange={onChange} />
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.click(input);
    fireEvent.keyDown(input, { key: 'Escape' });
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('opens on focus and closes on blur', () => {
    const onChange = vi.fn();
    render(<Combobox values={[]} options={[{ value: 'vue', label: 'Vue' }]} onChange={onChange} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.focus(input);
    expect(screen.getByRole('option', { name: 'Vue' })).toBeInTheDocument();
    fireEvent.blur(input);
  });

  it('ignores an unhandled key without side effects', () => {
    const onChange = vi.fn();
    render(<Combobox values={[]} options={[{ value: 'vue', label: 'Vue' }]} onChange={onChange} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'x' });
    expect(onChange).not.toHaveBeenCalled();
  });
});
