import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { ModalCloseButton } from './ModalCloseButton';

const meta = {
  title: 'Shared/Modal/CloseButton',
  component: ModalCloseButton,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    ariaLabel: { control: 'text' },
  },
} satisfies Meta<typeof ModalCloseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onClose: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Close modal');
  },
};

export const CustomAriaLabel: Story = {
  args: { onClose: () => {}, ariaLabel: 'Close modal' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    expect(button).toHaveAttribute('aria-label', 'Close modal');
  },
};

export const WithTooltip: Story = {
  args: { onClose: () => {} },
  render: (args) => (
    <div style={{ position: 'relative' }}>
      <ModalCloseButton {...args} />
      <span
        style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          color: 'var(--foreground-muted)',
          whiteSpace: 'nowrap',
        }}
      >
        Close (Esc)
      </span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    expect(button).toBeInTheDocument();
    expect(canvas.getByText('Close (Esc)')).toBeInTheDocument();
  },
};
