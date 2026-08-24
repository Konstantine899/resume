import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { Avatar } from '../Avatar/Avatar';
import { AvatarGroup } from './AvatarGroup';

const meta = {
  title: 'Shared/Avatar/Group',
  component: AvatarGroup,
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
    max: {
      control: { type: 'number', min: 1, max: 8 },
      description: 'Maximum number of visible avatars',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Avatar size',
    },
    overflowText: { control: 'text', description: 'Overflow indicator template with {{count}}' },
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const AVATARS = [
  <Avatar key="1" src="/images/avatar/avatar003.jpg" alt="Alice" size="md" />,
  <Avatar key="2" src="/images/avatar/avatar003.jpg" alt="Bob" size="md" />,
  <Avatar key="3" src="/images/avatar/avatar003.jpg" alt="Carol" size="md" />,
  <Avatar key="4" src="/images/avatar/avatar003.jpg" alt="Dave" size="md" />,
  <Avatar key="5" src="/images/avatar/avatar003.jpg" alt="Eve" size="md" />,
];

export const Default: Story = {
  args: { children: AVATARS },
  render: () => <AvatarGroup max={3}>{AVATARS}</AvatarGroup>,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('group')).toHaveAttribute('aria-label', 'Avatar group');
    expect(canvas.getByText('+2')).toBeInTheDocument();
    expect(canvas.getAllByRole('img')).toHaveLength(3);
  },
};

export const WithinMax: Story = {
  args: { children: AVATARS },
  render: () => <AvatarGroup max={5}>{AVATARS}</AvatarGroup>,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole('img')).toHaveLength(5);
    expect(canvas.queryByText(/^\+/)).not.toBeInTheDocument();
  },
};

export const CustomOverflowText: Story = {
  args: { children: AVATARS },
  render: () => (
    <AvatarGroup max={2} overflowText="{{count}} more">
      {AVATARS}
    </AvatarGroup>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('3 more')).toBeInTheDocument();
  },
};

export const Sizes: Story = {
  args: { children: AVATARS },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <AvatarGroup size="sm" max={3}>
        {AVATARS}
      </AvatarGroup>
      <AvatarGroup size="md" max={3}>
        {AVATARS}
      </AvatarGroup>
      <AvatarGroup size="lg" max={3}>
        {AVATARS}
      </AvatarGroup>
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const groups = canvasElement.querySelectorAll('[role="group"]');
    expect(groups).toHaveLength(3);
  },
};
