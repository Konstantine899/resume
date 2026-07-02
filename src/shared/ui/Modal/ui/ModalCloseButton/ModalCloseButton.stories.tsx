// ============================================
// ModalCloseButton Stories
// ============================================

import type { Meta, StoryObj } from '@storybook/react-vite';
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
};

export const CustomAriaLabel: Story = {
  args: { onClose: () => {}, ariaLabel: 'Close modal' },
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
};
