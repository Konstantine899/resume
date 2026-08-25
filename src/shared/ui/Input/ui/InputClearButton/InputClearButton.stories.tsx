// InputClearButton Component Stories
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { InputClearButton } from './InputClearButton';

const containerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '280px',
  border: '1px solid var(--border-color)',
  borderRadius: '0.375rem',
  backgroundColor: 'var(--background)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 2.5rem 0.5rem 0.75rem',
  fontFamily: 'Inter, sans-serif',
  fontSize: '1rem',
  color: 'var(--foreground)',
  outline: 'none',
  border: 'none',
  background: 'transparent',
};

const meta = {
  title: 'Shared/Input/InputClearButton',
  component: InputClearButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={containerStyle}>
        <input
          style={inputStyle}
          defaultValue="Some value to clear"
          aria-label="Input with clear"
        />
        <Story />
      </div>
    ),
  ],
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Clear input');
  },
};

export const CustomAriaLabel: Story = {
  args: {
    onClick: () => {},
    'aria-label': 'Очистить поле',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Очистить поле');
  },
};

export const WithTabIndex: Story = {
  args: {
    onClick: () => {},
    tabIndex: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    expect(button).toHaveAttribute('tabindex', '0');
  },
};
