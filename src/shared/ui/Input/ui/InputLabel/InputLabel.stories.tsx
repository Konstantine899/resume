// InputLabel Component Stories
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputLabel } from './InputLabel';

const wrapperStyle: React.CSSProperties = {
  width: '280px',
};

const inputContainerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  border: '1px solid var(--border-color)',
  borderRadius: '0.375rem',
  backgroundColor: 'var(--background)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontFamily: 'Inter, sans-serif',
  fontSize: '1rem',
  color: 'var(--foreground)',
  outline: 'none',
  border: 'none',
  background: 'transparent',
};

const meta = {
  title: 'Shared/Input/InputLabel',
  component: InputLabel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story, { args }) => {
      if (args?.floating) {
        return (
          <div style={wrapperStyle}>
            <div style={{ ...inputContainerStyle, minHeight: '36px' }}>
              <input
                style={{ ...inputStyle, paddingTop: '0.75rem' }}
                placeholder=" "
                aria-label="Input with floating label"
              />
              <Story />
            </div>
          </div>
        );
      }
      return (
        <div style={wrapperStyle}>
          <Story />
          <div style={inputContainerStyle}>
            <input style={inputStyle} placeholder="Type here..." aria-label="Input with label" />
          </div>
        </div>
      );
    },
  ],
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
