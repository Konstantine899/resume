// InputAddon Component Stories
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Mail, Search } from 'lucide-react';
import { expect, within } from '@storybook/test';
import { InputAddon } from './InputAddon';

const inputContainerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '280px',
  border: '1px solid var(--border-color)',
  borderRadius: '0.375rem',
  backgroundColor: 'var(--background)',
  transition: 'border-color 0.2s ease',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  paddingLeft: '2.5rem',
  fontFamily: 'Inter, sans-serif',
  fontSize: '1rem',
  color: 'var(--foreground)',
  outline: 'none',
  border: 'none',
  background: 'transparent',
};

const endInputStyle: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: '0.75rem',
  paddingRight: '2.5rem',
};

const meta = {
  title: 'Shared/Input/InputAddon',
  component: InputAddon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, { args }) => {
      const isEnd = args?.position === 'end';
      return (
        <div style={inputContainerStyle}>
          <Story />
          <input
            style={isEnd ? endInputStyle : inputStyle}
            placeholder="Type here..."
            aria-label="Input with addon"
          />
        </div>
      );
    },
  ],
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('$')).toBeInTheDocument();
  },
};

export const EndPosition: Story = {
  args: {
    position: 'end',
    children: '.00',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('.00')).toBeInTheDocument();
  },
};

export const WithIcon: Story = {
  args: {
    position: 'start',
    children: <Mail size={16} />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    expect(input).toBeInTheDocument();
  },
};

export const WithText: Story = {
  args: {
    position: 'start',
    children: 'USD',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('USD')).toBeInTheDocument();
  },
};

export const CustomClass: Story = {
  args: {
    position: 'start',
    className: 'custom-addon',
    children: '€',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('€')).toBeInTheDocument();
  },
};

export const SearchIcon: Story = {
  args: {
    position: 'start',
    children: <Search size={16} />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    expect(input).toBeInTheDocument();
  },
};
