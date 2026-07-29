import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { ModalForm } from './ModalForm';

function FormWrapper({ onSubmit }: { onSubmit?: (e: React.FormEvent) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const handleSubmit = onSubmit ?? vi.fn();
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Form</Button>
      <ModalForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Test Form"
        onSubmit={handleSubmit}
      >
        <Input label="Name" name="name" />
        <Input label="Email" name="email" />
      </ModalForm>
    </div>
  );
}

describe('ModalForm', () => {
  test('renders when open', async () => {
    const user = userEvent.setup();
    render(<FormWrapper />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /open form/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  test('renders title, submit and cancel buttons', async () => {
    const user = userEvent.setup();
    render(<FormWrapper />);
    await user.click(screen.getByRole('button', { name: /open form/i }));
    expect(await screen.findByText('Test Form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<FormWrapper />);
    await user.click(screen.getByRole('button', { name: /open form/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('calls onSubmit when submit button clicked', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(<FormWrapper onSubmit={handleSubmit} />);
    await user.click(screen.getByRole('button', { name: /open form/i }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  test('renders loading state on submit button', async () => {
    render(
      <ModalForm
        isOpen={true}
        onClose={() => {}}
        title="Loading Form"
        loading={true}
        onSubmit={() => {}}
      >
        <p>Loading state</p>
      </ModalForm>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('renders custom button labels', async () => {
    render(
      <ModalForm
        isOpen={true}
        onClose={() => {}}
        title="Custom Labels Form"
        submitLabel="Save Changes"
        cancelLabel="Discard"
        onSubmit={() => {}}
      >
        <p>Custom labels</p>
      </ModalForm>
    );
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
  });
});
