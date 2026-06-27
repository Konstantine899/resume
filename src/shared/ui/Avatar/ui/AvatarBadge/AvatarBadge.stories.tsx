import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarBadge } from './AvatarBadge';

const meta = {
  title: 'Shared/Avatar/Badge',
  component: AvatarBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['dot', 'number', 'icon'],
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'busy', 'away'],
    },
    count: {
      control: 'number',
      min: 0,
      max: 99,
    },
  },
} satisfies Meta<typeof AvatarBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dot: Story = {
  args: {
    variant: 'dot',
    status: 'online',
  },
};

export const Number: Story = {
  args: {
    variant: 'number',
    count: 5,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-lg, 24px)' }}>
      <div style={{ textAlign: 'center' }}>
        <AvatarBadge variant="dot" status="online" />
        <p style={{ marginTop: 'var(--spacing-xs, 8px)', fontSize: 'var(--font-size-xs, 12px)' }}>
          Online
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <AvatarBadge variant="dot" status="busy" />
        <p style={{ marginTop: 'var(--spacing-xs, 8px)', fontSize: 'var(--font-size-xs, 12px)' }}>
          Busy
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <AvatarBadge variant="dot" status="away" />
        <p style={{ marginTop: 'var(--spacing-xs, 8px)', fontSize: 'var(--font-size-xs, 12px)' }}>
          Away
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <AvatarBadge variant="dot" status="offline" />
        <p style={{ marginTop: 'var(--spacing-xs, 8px)', fontSize: 'var(--font-size-xs, 12px)' }}>
          Offline
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <AvatarBadge variant="number" count={9} />
        <p style={{ marginTop: 'var(--spacing-xs, 8px)', fontSize: 'var(--font-size-xs, 12px)' }}>
          Number
        </p>
      </div>
    </div>
  ),
};
