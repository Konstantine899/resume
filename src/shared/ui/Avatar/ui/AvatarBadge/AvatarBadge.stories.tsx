import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarBadge } from './AvatarBadge';

const meta = {
  title: 'Shared/Avatar/AvatarBadge',
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

export const Busy: Story = {
  args: {
    variant: 'dot',
    status: 'busy',
  },
};

export const Away: Story = {
  args: {
    variant: 'dot',
    status: 'away',
  },
};

export const Offline: Story = {
  args: {
    variant: 'dot',
    status: 'offline',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <div>
        <AvatarBadge variant="dot" status="online" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Online</p>
      </div>
      <div>
        <AvatarBadge variant="dot" status="busy" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Busy</p>
      </div>
      <div>
        <AvatarBadge variant="dot" status="away" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Away</p>
      </div>
      <div>
        <AvatarBadge variant="dot" status="offline" />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Offline</p>
      </div>
      <div>
        <AvatarBadge variant="number" count={9} />
        <p style={{ marginTop: '8px', fontSize: '12px' }}>Number</p>
      </div>
    </div>
  ),
};
