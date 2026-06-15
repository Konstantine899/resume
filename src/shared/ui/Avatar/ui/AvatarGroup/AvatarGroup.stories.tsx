import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../Avatar/Avatar';
import { AvatarGroup } from './AvatarGroup';

const meta = {
  title: 'Shared/Avatar/AvatarGroup',
  component: AvatarGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    max: {
      control: 'number',
      min: 1,
      max: 10,
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['circle', 'square'],
    },
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

export const Default: Story = {
  args: {
    max: 5,
    size: 'md',
    variant: 'circle',
    children: (
      <>
        <Avatar alt="User 1" />
        <Avatar alt="User 2" />
        <Avatar alt="User 3" />
        <Avatar alt="User 4" />
        <Avatar alt="User 5" />
      </>
    ),
  },
};

export const WithMax: Story = {
  args: {
    max: 3,
    size: 'md',
    variant: 'circle',
    children: (
      <>
        <Avatar alt="User 1" />
        <Avatar alt="User 2" />
        <Avatar alt="User 3" />
        <Avatar alt="User 4" />
        <Avatar alt="User 5" />
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    max: 5,
    size: 'sm',
    variant: 'circle',
    children: (
      <>
        <Avatar alt="User 1" />
        <Avatar alt="User 2" />
        <Avatar alt="User 3" />
      </>
    ),
  },
};

export const Large: Story = {
  args: {
    max: 5,
    size: 'lg',
    variant: 'circle',
    children: (
      <>
        <Avatar alt="User 1" />
        <Avatar alt="User 2" />
        <Avatar alt="User 3" />
      </>
    ),
  },
};

export const Square: Story = {
  args: {
    max: 5,
    size: 'md',
    variant: 'square',
    children: (
      <>
        <Avatar alt="User 1" />
        <Avatar alt="User 2" />
        <Avatar alt="User 3" />
      </>
    ),
  },
};
