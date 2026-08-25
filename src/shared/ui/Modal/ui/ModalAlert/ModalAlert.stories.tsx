import { AlertTriangle, Info } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, within } from 'storybook/test';
import { useModal } from '@/shared/lib/hooks/useModal';
import { Button } from '@/shared/ui/Button';
import { ModalAlert } from './ModalAlert';

const meta = {
  title: 'Shared/Modal/Alert',
  component: ModalAlert,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    isOpen: false,
    onClose: () => {},
    title: '',
    message: '',
  },
} satisfies Meta<typeof ModalAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleAlert: Story = {
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Open Alert</Button>
        <ModalAlert
          isOpen={isOpen}
          onClose={close}
          title="Information"
          message="Operation completed successfully."
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /open alert/i }));
    expect(screen.getByText('Information')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /ok/i }));
    await expect(screen.queryByText('Information')).not.toBeInTheDocument();
  },
};

export const ConfirmDialog: Story = {
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Open Confirm</Button>
        <ModalAlert
          isOpen={isOpen}
          onClose={close}
          title="Confirm Action"
          message="Are you sure you want to proceed?"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          onConfirm={() => {}}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /open confirm/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Confirm Action')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: /cancel/i }));
    await expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  },
};

export const DestructiveConfirm: Story = {
  render: () => {
    const { isOpen, open, close } = useModal();
    const handleDelete = () => {};
    return (
      <div>
        <Button onClick={open}>Delete</Button>
        <ModalAlert
          isOpen={isOpen}
          onClose={close}
          title="Delete Item"
          message="This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
          icon={<AlertTriangle size={32} />}
          onConfirm={handleDelete}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /delete/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Delete Item')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /delete/i })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: /cancel/i }));
    await expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  },
};

export const WithCustomIcon: Story = {
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>With Icon</Button>
        <ModalAlert
          isOpen={isOpen}
          onClose={close}
          title="Info"
          message="This is an informational message with a custom icon."
          icon={<Info size={32} />}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /with icon/i }));
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(
      screen.getByText('This is an informational message with a custom icon.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ok/i })).toBeInTheDocument();
  },
};
