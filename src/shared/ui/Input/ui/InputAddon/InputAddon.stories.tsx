// InputAddon Component Stories
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Mail, Search } from 'lucide-react';
import { InputAddon } from './InputAddon';

const meta = {
  title: 'Shared/Input/InputAddon',
  component: InputAddon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['start', 'end'],
      description: 'Position relative to input',
    },
    className: {
      control: 'text',
      description: 'Custom CSS class',
    },
  },
} satisfies Meta<typeof InputAddon>;

export default meta;
type Story = StoryObj<typeof InputAddon>;

export const StartPosition: Story = {
  args: {
    position: 'start',
    children: '$',
  },
};

export const EndPosition: Story = {
  args: {
    position: 'end',
    children: '.00',
  },
};

export const WithIcon: Story = {
  args: {
    position: 'start',
    children: <Mail size={16} />,
  },
};

export const WithText: Story = {
  args: {
    position: 'start',
    children: 'USD',
  },
};

export const CustomClass: Story = {
  args: {
    position: 'start',
    className: 'custom-addon',
    children: '€',
  },
};

export const SearchIcon: Story = {
  args: {
    position: 'start',
    children: <Search size={16} />,
  },
};
