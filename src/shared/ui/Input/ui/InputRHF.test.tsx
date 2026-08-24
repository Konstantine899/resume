import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { Input } from './Input';

interface TestForm {
  name: string;
  email: string;
}

function FormWithRHF({ onSubmit }: { onSubmit: (data: TestForm) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestForm>({
    defaultValues: { name: '', email: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Name"
        placeholder="Enter name"
        {...register('name', { required: 'Name is required' })}
        error={errors.name?.message}
      />
      <Input
        label="Email"
        placeholder="Enter email"
        {...register('email', { required: 'Email is required' })}
        error={errors.email?.message}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

describe('Input + React Hook Form', () => {
  it('registers and submits values', async () => {
    const onSubmit = vi.fn();
    render(<FormWithRHF onSubmit={onSubmit} />);

    const nameInput = screen.getByPlaceholderText('Enter name');
    const emailInput = screen.getByPlaceholderText('Enter email');

    await userEvent.type(nameInput, 'John');
    await userEvent.type(emailInput, 'john@test.com');

    await userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith(
      { name: 'John', email: 'john@test.com' },
      expect.anything()
    );
  });

  it('forwards onBlur for touched state', async () => {
    const onSubmit = vi.fn();
    render(<FormWithRHF onSubmit={onSubmit} />);

    const nameInput = screen.getByPlaceholderText('Enter name');
    nameInput.focus();
    nameInput.blur();

    await userEvent.click(screen.getByText('Submit'));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Name is required')).toBeDefined();
    expect(screen.getByText('Email is required')).toBeDefined();
  });

  it('works with controlled value updates', async () => {
    const onSubmit = vi.fn();
    render(<FormWithRHF onSubmit={onSubmit} />);

    const nameInput = screen.getByPlaceholderText('Enter name') as HTMLInputElement;
    await userEvent.type(nameInput, 'Hello');

    expect(nameInput.value).toBe('Hello');
  });
});
