import type { Meta, StoryObj } from '@storybook/react-vite';
import { LiveClock } from './LiveClock';

const meta = {
  title: 'Features/LiveClock',
  component: LiveClock,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof LiveClock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
