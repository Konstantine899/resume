// InputCounter Component Stories
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputCounter } from './InputCounter';

const meta = {
  title: 'Shared/Input/InputCounter',
  component: InputCounter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    current: {
      control: 'number',
      description: 'Current character count',
    },
    max: {
      control: 'number',
      description: 'Maximum allowed characters',
    },
    warningThreshold: {
      control: 'number',
      description: 'Threshold for warning (0-1)',
    },
  },
} satisfies Meta<typeof InputCounter>;

export default meta;
type Story = StoryObj<typeof InputCounter>;

export const Default: Story = {
  args: {
    current: 50,
    max: 100,
  },
};

export const NearLimit: Story = {
  args: {
    current: 90,
    max: 100,
  },
};

export const AtLimit: Story = {
  args: {
    current: 100,
    max: 100,
  },
};

export const OverLimit: Story = {
  args: {
    current: 120,
    max: 100,
  },
};

export const CustomThreshold: Story = {
  args: {
    current: 60,
    max: 100,
    warningThreshold: 0.5,
  },
};

export const ShortText: Story = {
  args: {
    current: 10,
    max: 280,
  },
};
