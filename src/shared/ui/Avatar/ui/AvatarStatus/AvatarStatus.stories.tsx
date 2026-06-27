import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarStatus } from './AvatarStatus';

const meta = {
  title: 'Shared/Avatar/Status',
  component: AvatarStatus,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['online', 'offline', 'busy', 'away'],
    },
  },
} satisfies Meta<typeof AvatarStatus>;

export default meta;
type Story = StoryObj<typeof AvatarStatus>;

export const Online: Story = {
  args: {
    status: 'online',
  },
};

export const Offline: Story = {
  args: {
    status: 'offline',
  },
};

export const Busy: Story = {
  args: {
    status: 'busy',
  },
};

export const Away: Story = {
  args: {
    status: 'away',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-lg, 24px)', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <AvatarStatus status="online" />
        <p style={{ marginTop: 'var(--spacing-xs, 8px)', fontSize: 'var(--font-size-xs, 12px)' }}>
          Online
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <AvatarStatus status="busy" />
        <p style={{ marginTop: 'var(--spacing-xs, 8px)', fontSize: 'var(--font-size-xs, 12px)' }}>
          Busy
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <AvatarStatus status="away" />
        <p style={{ marginTop: 'var(--spacing-xs, 8px)', fontSize: 'var(--font-size-xs, 12px)' }}>
          Away
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <AvatarStatus status="offline" />
        <p style={{ marginTop: 'var(--spacing-xs, 8px)', fontSize: 'var(--font-size-xs, 12px)' }}>
          Offline
        </p>
      </div>
    </div>
  ),
};
