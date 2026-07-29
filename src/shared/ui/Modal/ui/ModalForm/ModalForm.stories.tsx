import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { useModal } from '@/shared/lib/hooks/useModal';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { ModalForm } from './ModalForm';

const meta = {
  title: 'Shared/Modal/Form',
  component: ModalForm,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    isOpen: false,
    onClose: () => {},
    title: 'Contact Form',
    onSubmit: () => {},
    children: '',
  },
} satisfies Meta<typeof ModalForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultForm: Story = {
  render: () => {
    const { isOpen, open, close } = useModal();
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      close();
    };
    return (
      <div>
        <Button onClick={open}>Open Form</Button>
        <ModalForm isOpen={isOpen} onClose={close} title="Contact Form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Name" name="name" placeholder="Your name" />
            <Input label="Email" name="email" type="email" placeholder="your@email.com" />
            <Input label="Message" name="message" placeholder="Your message" />
          </div>
        </ModalForm>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /open form/i }));
    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(canvas.getByText('Contact Form')).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const LoadingForm: Story = {
  render: () => {
    const { isOpen, open, close } = useModal();
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
    };
    return (
      <div>
        <Button onClick={open}>Loading Form</Button>
        <ModalForm
          isOpen={isOpen}
          onClose={close}
          title="Sending..."
          submitLabel="Saving"
          loading={true}
          onSubmit={handleSubmit}
        >
          <p>Form content with loading state.</p>
        </ModalForm>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /loading form/i }));
    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const submitButton = canvas.getByRole('button', { name: /saving/i });
    expect(submitButton).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const CustomLabels: Story = {
  render: () => {
    const { isOpen, open, close } = useModal();
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      close();
    };
    return (
      <div>
        <Button onClick={open}>Custom Labels</Button>
        <ModalForm
          isOpen={isOpen}
          onClose={close}
          title="Confirm Deletion"
          submitLabel="Delete"
          cancelLabel="Keep"
          onSubmit={handleSubmit}
        >
          <p>Are you sure you want to delete this item?</p>
        </ModalForm>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /custom labels/i }));
    const dialog = await canvas.findByRole('dialog');
    expect(canvas.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /keep/i })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};
