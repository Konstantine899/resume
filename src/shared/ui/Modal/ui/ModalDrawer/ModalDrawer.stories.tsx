import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, within } from '@storybook/test';
import { useModal } from '@/shared/lib/hooks/useModal';
import { Button } from '@/shared/ui/Button';
import { ModalDrawer } from './ModalDrawer';

const meta = {
  title: 'Shared/Modal/Drawer',
  component: ModalDrawer,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    isOpen: false,
    onClose: () => {},
    children: '',
    title: '',
  },
} satisfies Meta<typeof ModalDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RightDrawer: Story = {
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Open Drawer</Button>
        <ModalDrawer isOpen={isOpen} onClose={close} title="Right Drawer" size="md">
          <p>Drawer content panel sliding from the right.</p>
          <p>Non-modal panel without overlay.</p>
        </ModalDrawer>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /open drawer/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Right Drawer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const LeftDrawer: Story = {
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Left Drawer</Button>
        <ModalDrawer isOpen={isOpen} onClose={close} title="Left Drawer" placement="left">
          <p>Drawer panel sliding from the left.</p>
        </ModalDrawer>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /left drawer/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Left Drawer')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const LargeDrawer: Story = {
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Large Drawer</Button>
        <ModalDrawer isOpen={isOpen} onClose={close} title="Large Drawer" size="lg">
          <p>Wide drawer panel with more content space.</p>
          {Array.from({ length: 10 }).map((_, i) => (
            <p key={i}>Section {i + 1}</p>
          ))}
        </ModalDrawer>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /large drawer/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Section 10')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};
