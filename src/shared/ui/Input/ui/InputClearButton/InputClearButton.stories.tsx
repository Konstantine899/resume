// InputClearButton Component Stories
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputClearButton } from './InputClearButton';

const meta = {
  title: 'Shared/Input/InputClearButton',
  component: InputClearButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: {
      action: 'clicked',
      description: 'Clear button click handler',
    },
    'aria-label': {
      control: 'text',
      description: 'Accessibility label',
    },
    tabIndex: {
      control: 'number',
      description: 'Tab index',
    },
  },
} satisfies Meta<typeof InputClearButton>;

export default meta;
type Story = StoryObj<typeof InputClearButton>;

export const Default: Story = {
  args: {
    onClick: () => alert('Clear clicked!'),
  },
};

export const CustomAriaLabel: Story = {
  args: {
    onClick: () => {},
    'aria-label': 'Очистить поле',
  },
};

export const WithTabIndex: Story = {
  args: {
    onClick: () => {},
    tabIndex: 0,
  },
};
