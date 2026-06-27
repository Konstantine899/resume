import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';
import { AvatarBadge } from '../AvatarBadge/AvatarBadge';
import { AvatarStatus } from '../AvatarStatus/AvatarStatus';
import { AvatarGroup } from '../AvatarGroup/AvatarGroup';
import avatar1 from './assets/avatar.jpg';
import avatar2 from './assets/avatar001.jpg';
import avatar3 from './assets/avatar003.jpg';

const meta: Meta<typeof Avatar> = {
  title: 'Shared/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          { id: 'image-alt', enabled: true },
          { id: 'aria-allowed-attr', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Image URL',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for accessibility',
      table: {
        defaultValue: { summary: "'Avatar'" },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Avatar size',
      table: {
        defaultValue: { summary: "'md'" },
      },
    },
    variant: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Avatar shape',
      table: {
        defaultValue: { summary: "'circle'" },
      },
    },
    showSkeleton: {
      control: 'boolean',
      description: 'Show skeleton loading state',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    heroStyle: {
      control: 'boolean',
      description: 'Enable hero styling with gradient border',
    },
    showGlow: {
      control: 'boolean',
      description: 'Show pulsing glow effect',
    },
    showRing: {
      control: 'boolean',
      description: 'Show decorative ring',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

/**
 * Quick start: Basic avatar with initials.
 * For more variants, see AvatarHero, AvatarAbout subcomponents.
 */
export const Default: Story = {
  args: {
    alt: 'User',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Quick start: Basic avatar with initials (48px). For hero variants with effects, see AvatarHero. For About section variants, see AvatarAbout.',
      },
    },
  },
};

/**
 * Avatar with status badge composition.
 * Shows how to use AvatarBadge inside Avatar.
 */
export const WithBadge: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-lg, 24px)' }}>
      <Avatar src={avatar1} alt="User" size="md">
        <AvatarBadge variant="dot" status="online" />
      </Avatar>
      <Avatar src={avatar2} alt="User" size="md">
        <AvatarBadge variant="dot" status="busy" />
      </Avatar>
      <Avatar src={avatar3} alt="User" size="md">
        <AvatarBadge variant="number" count={5} />
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Avatar with badge (status indicator or notification count). Badge is positioned automatically.',
      },
    },
  },
};

/**
 * Avatar with status indicator composition.
 * Shows how to use AvatarStatus inside Avatar.
 */
export const WithStatus: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-lg, 24px)' }}>
      <Avatar src={avatar1} alt="Online User" size="md">
        <AvatarStatus status="online" />
      </Avatar>
      <Avatar src={avatar2} alt="Busy User" size="md">
        <AvatarStatus status="busy" />
      </Avatar>
      <Avatar src={avatar3} alt="Away User" size="md">
        <AvatarStatus status="away" />
      </Avatar>
      <Avatar alt="Offline User" size="md">
        <AvatarStatus status="offline" />
      </Avatar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Avatar with status indicator. Shows user availability status.',
      },
    },
  },
};

/**
 * Avatar in group composition.
 * Shows how to use Avatar inside AvatarGroup.
 */
export const InGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg, 24px)' }}>
      <AvatarGroup max={4} size="md">
        <Avatar src={avatar1} alt="User 1" />
        <Avatar src={avatar2} alt="User 2" />
        <Avatar src={avatar3} alt="User 3" />
        <Avatar alt="User 4" />
        <Avatar alt="User 5" />
      </AvatarGroup>
      <AvatarGroup max={2} size="sm">
        <Avatar alt="A" />
        <Avatar alt="B" />
        <Avatar alt="C" />
      </AvatarGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Avatar used in AvatarGroup. Shows overflow indicator (+N) when more avatars than max.',
      },
    },
  },
};
