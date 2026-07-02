// ============================================
// ModalHeader Stories
// ============================================

import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModalHeader } from './ModalHeader';

const meta = {
  title: 'Shared/Modal/Header',
  component: ModalHeader,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    showCloseButton: { control: 'boolean' },
  },
} satisfies Meta<typeof ModalHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = { onClose: () => {} };

export const Default: Story = {
  args: { ...baseArgs, title: 'Modal Header' },
};

export const WithSubtitle: Story = {
  args: { ...baseArgs, title: 'Header', subtitle: 'This is a subtitle' },
};

export const NoCloseButton: Story = {
  args: { ...baseArgs, title: 'No Close', showCloseButton: false },
};

export const CustomTitle: Story = {
  args: { ...baseArgs, title: 'Custom Title', subtitle: 'With description' },
};
