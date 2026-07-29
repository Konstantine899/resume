import { describe, it, expect, assert } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Mail } from 'lucide-react';
import { Input } from './Input';
import { setupUserEvent } from '@/shared/tests/test-utils';

describe('Input — Keyboard Navigation', () => {
  it('clear button is reachable via Tab key', async () => {
    const user = setupUserEvent();
    render(<Input clearable defaultValue="test" />);

    const input = screen.getByRole('textbox');
    await user.click(input);

    await user.tab();
    const clearButton = screen.getByRole('button', { name: /clear input/i });
    expect(clearButton).toHaveFocus();
  });

  it('password toggle is reachable via Tab key', async () => {
    const user = setupUserEvent();
    const { container } = render(<Input type="password" showPasswordToggle />);

    const input = container.querySelector('input');
    assert(input, 'input element should exist');
    input.focus();

    await user.tab();
    const toggle = screen.getByRole('button', { name: /show password/i });
    expect(toggle).toHaveFocus();
  });

  it('Tab cycles: input → clear → next focusable when clearable', async () => {
    const user = setupUserEvent();
    render(
      <div>
        <Input clearable defaultValue="test" aria-label="Field 1" />
        <button type="button">Next</button>
      </div>
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    await user.tab();
    expect(screen.getByRole('button', { name: /clear input/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: /next/i })).toHaveFocus();
  });

  it('clear button clears value and returns focus to input on click', async () => {
    const user = setupUserEvent();
    render(<Input clearable defaultValue="test" />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.tab();

    const clearButton = screen.getByRole('button', { name: /clear input/i });
    expect(clearButton).toHaveFocus();

    await user.click(clearButton);
    expect(input).toHaveFocus();
    expect(input).toHaveValue('');
  });

  it('password toggle activates via Enter key', () => {
    render(<Input type="password" showPasswordToggle />);
    const toggle = screen.getByRole('button', { name: /show password/i });

    fireEvent.keyDown(toggle, { key: 'Enter' });
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
  });

  it('password toggle activates via Space key', () => {
    render(<Input type="password" showPasswordToggle />);
    const toggle = screen.getByRole('button', { name: /show password/i });

    fireEvent.keyDown(toggle, { key: ' ' });
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
  });
});

describe('Input — ARIA States', () => {
  it('error, loading, and required produce consistent ARIA', () => {
    const { container } = render(<Input label="Test" required loading error="Error" />);
    const input = container.querySelector('input');
    assert(input, 'input element should exist');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-busy', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('toggles aria-pressed on password visibility button', async () => {
    const user = setupUserEvent();
    render(<Input type="password" showPasswordToggle />);

    const toggle = screen.getByRole('button', { name: /show password/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('describes input by counter when shown', () => {
    render(<Input showCounter maxLength={100} label="Test" />);
    const input = screen.getByLabelText('Test');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const describer = document.getElementById(describedBy as string);
    expect(describer).toHaveAttribute('data-testid', 'counter');
  });

  it('does not set aria-busy on input when skeleton (wrapper has it)', () => {
    render(<Input skeleton />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    const wrapper = screen.getByTestId('input-wrapper');
    expect(wrapper).toHaveAttribute('aria-busy');
  });
});

describe('Input — Focus Management', () => {
  it('forwards focus to input when label is clicked', async () => {
    const user = setupUserEvent();
    render(<Input label="Email" />);

    const label = screen.getByText('Email');
    await user.click(label);

    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it('does not move focus away from clear button unexpectedly', async () => {
    const user = setupUserEvent();
    render(<Input clearable defaultValue="test" />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.tab();

    const clearButton = screen.getByRole('button', { name: /clear input/i });
    expect(clearButton).toHaveFocus();

    await user.keyboard('[Space]');
    expect(input).toHaveFocus();
  });
});

describe('Input — Icon Accessibility', () => {
  it('renders non-decorative icon with descriptive label when provided', () => {
    render(<Input icon={<Mail aria-label="Email icon" />} />);
    const icon = screen.getByLabelText('Email icon');
    expect(icon).toBeInTheDocument();
  });

  it('iconAfter does not steal focus from input', async () => {
    const user = setupUserEvent();
    render(<Input iconAfter={<Mail data-testid="icon-after-test" aria-hidden="true" />} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    expect(input).toHaveFocus();
  });
});
