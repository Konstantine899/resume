import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { AvatarBadge } from './AvatarBadge';

const meta = {
  title: 'Shared/Avatar/Badge',
  component: AvatarBadge,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['online', 'offline', 'busy', 'away'],
      description: 'Presence status',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Avatar size (scales the badge)',
    },
    'aria-label': { control: 'text', description: 'Accessibility label' },
  },
} satisfies Meta<typeof AvatarBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: 'offline',
    size: 'md',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole('status');
    expect(badge).toHaveAttribute('aria-label', 'Status: offline');
  },
};

export const Statuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <AvatarBadge status="online" />
      <AvatarBadge status="offline" />
      <AvatarBadge status="busy" />
      <AvatarBadge status="away" />
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const badges = canvasElement.querySelectorAll('[role="status"]');
    expect(badges).toHaveLength(4);
    const labels = Array.from(badges).map((el) => el.getAttribute('aria-label'));
    expect(labels.join('|')).toBe('Status: online|Status: offline|Status: busy|Status: away');
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <AvatarBadge status="online" size="sm" />
      <AvatarBadge status="online" size="md" />
      <AvatarBadge status="online" size="lg" />
      <AvatarBadge status="online" size="xl" />
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const badges = canvasElement.querySelectorAll('[role="status"]');
    expect(badges).toHaveLength(4);
    expect((badges[0] as HTMLElement).style.width).toBe('12px');
    expect((badges[1] as HTMLElement).style.width).toBe('16px');
    expect((badges[2] as HTMLElement).style.width).toBe('20px');
  },
};

export const CustomAriaLabel: Story = {
  args: {
    status: 'busy',
    size: 'md',
    'aria-label': 'User is busy',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('status')).toHaveAttribute('aria-label', 'User is busy');
  },
};
