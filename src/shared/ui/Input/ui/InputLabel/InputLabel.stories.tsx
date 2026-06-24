// InputLabel Component Stories
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputLabel } from './InputLabel';

const meta = {
  title: 'Shared/Input/InputLabel',
  component: InputLabel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    htmlFor: {
      control: 'text',
      description: 'HTML for attribute',
    },
    required: {
      control: 'boolean',
      description: 'Show required indicator',
    },
    floating: {
      control: 'boolean',
      description: 'Use floating label style',
    },
  },
} satisfies Meta<typeof InputLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    htmlFor: 'input-id',
    children: 'Label Text',
  },
};

export const Required: Story = {
  args: {
    htmlFor: 'input-id',
    required: true,
    children: 'Email Address',
  },
};

export const Floating: Story = {
  args: {
    htmlFor: 'input-id',
    floating: true,
    children: 'Floating Label',
  },
};

export const WithCustomClass: Story = {
  args: {
    htmlFor: 'input-id',
    className: 'custom-label',
    children: 'Custom Styled Label',
  },
};
