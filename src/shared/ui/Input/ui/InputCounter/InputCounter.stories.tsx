// InputCounter Component Stories
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { InputCounter } from './InputCounter';

const wrapperStyle: React.CSSProperties = {
  width: '280px',
};

const containerStyle: React.CSSProperties = {
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
  title: 'Shared/Input/InputCounter',
  component: InputCounter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={wrapperStyle}>
        <div style={containerStyle}>
          <input
            style={inputStyle}
            defaultValue="Typing some content to count characters..."
            aria-label="Input with counter"
          />
        </div>
        <Story />
      </div>
    ),
  ],
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
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toMatch(/50\/100/);
  },
};

export const NearLimit: Story = {
  args: {
    current: 90,
    max: 100,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toMatch(/90\/100/);
  },
};

export const AtLimit: Story = {
  args: {
    current: 100,
    max: 100,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toMatch(/100\/100/);
  },
};

export const OverLimit: Story = {
  args: {
    current: 120,
    max: 100,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toMatch(/120\/100/);
  },
};

export const CustomThreshold: Story = {
  args: {
    current: 60,
    max: 100,
    warningThreshold: 0.5,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toMatch(/60\/100/);
  },
};

export const ShortText: Story = {
  args: {
    current: 10,
    max: 280,
  },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toMatch(/10\/280/);
  },
};
