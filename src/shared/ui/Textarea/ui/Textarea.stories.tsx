// ============================================
// Textarea Component - Stories
// ============================================

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { Textarea } from './Textarea';

const meta = {
  title: 'Shared/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'filled'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    rows: {
      control: 'number',
      min: 2,
      max: 10,
    },
    maxLength: {
      control: 'number',
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    clearable: {
      control: 'boolean',
    },
    showCounter: {
      control: 'boolean',
    },
    autoResize: {
      control: 'boolean',
    },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both'],
    },
    trimOnBlur: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Basic Stories
// ============================================

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
    variant: 'default',
    size: 'md',
    rows: 4,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByTestId('textarea');
    await expect(textarea).toBeInTheDocument();
    await expect(textarea).toHaveAttribute('placeholder', 'Enter your message...');
    await expect(textarea.tagName).toBe('TEXTAREA');
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Message',
    placeholder: 'Write your message here...',
    rows: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByTestId('textarea-label');
    const textarea = canvas.getByTestId('textarea');
    await expect(label).toHaveTextContent('Message');
    await expect(label).toHaveAttribute('for', textarea.id);
  },
};

// ============================================
// States
// ============================================

export const WithError: Story = {
  args: {
    label: 'Message',
    error: 'Message is required',
    rows: 4,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByTestId('textarea');
    const errorEl = canvas.getByTestId('textarea-error');
    await expect(textarea).toHaveAttribute('aria-invalid', 'true');
    await expect(errorEl).toHaveTextContent('Message is required');
    await expect(errorEl.querySelector('[role="alert"]')).toBeInTheDocument();
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Biography',
    helperText: 'Tell us about yourself in a few words',
    placeholder: 'I am a...',
    rows: 4,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const helper = canvas.getByTestId('textarea-helper');
    const textarea = canvas.getByTestId('textarea');
    await expect(helper).toHaveTextContent('Tell us about yourself in a few words');
    const describedBy = textarea.getAttribute('aria-describedby');
    await expect(describedBy).toBeTruthy();
    if (describedBy) {
      await expect(document.getElementById(describedBy)).toBe(helper);
    }
  },
};

export const WithSuccess: Story = {
  args: {
    label: 'Comment',
    success: true,
    defaultValue: 'Great work!',
    rows: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByTestId('textarea');
    await expect(textarea).toHaveValue('Great work!');
    await expect(textarea.className).toMatch(/success/);
  },
};

export const Loading: Story = {
  args: {
    label: 'Loading...',
    loading: true,
    rows: 4,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByTestId('textarea');
    const loading = canvas.getByTestId('textarea-loading');
    await expect(textarea).toHaveAttribute('aria-busy', 'true');
    await expect(loading).toBeInTheDocument();
    await expect(textarea.className).toMatch(/loading/);
  },
};

export const Disabled: Story = {
  args: {
    label: 'Read-only feedback',
    disabled: true,
    defaultValue: 'This field is disabled',
    rows: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByTestId('textarea');
    await expect(textarea).toBeDisabled();
    await expect(textarea).toHaveValue('This field is disabled');
  },
};

// ============================================
// Features
// ============================================

export const Clearable: Story = {
  args: {
    label: 'Search query',
    clearable: true,
    defaultValue: 'Type something to clear...',
    rows: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const clearBtn = canvas.getByTestId('textarea-clear');
    const textarea = canvas.getByTestId('textarea');
    await expect(clearBtn).toBeInTheDocument();
    await expect(textarea).toHaveValue('Type something to clear...');
    await expect(clearBtn).toHaveAttribute('aria-label', 'Clear text');
  },
};

export const CharacterCounter: Story = {
  args: {
    label: 'Tweet',
    showCounter: true,
    maxLength: 280,
    placeholder: 'What is happening?!',
    rows: 4,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const counter = canvas.getByTestId('textarea-counter');
    const counterValue = canvas.getByTestId('textarea-counter-value');
    await expect(counter).toBeInTheDocument();
    await expect(counterValue).toHaveTextContent('0');
    await expect(counter).toHaveTextContent('0/280');
    await expect(counter).toHaveAttribute('aria-live', 'polite');
    await expect(counter).toHaveAttribute('aria-atomic', 'true');
  },
};

export const CharacterCounterNearLimit: Story = {
  name: 'Character Counter (near limit)',
  args: {
    label: 'Tweet',
    showCounter: true,
    maxLength: 280,
    defaultValue:
      'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum.'.slice(
        0,
        260
      ),
    rows: 8,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const counter = canvas.getByTestId('textarea-counter');
    const counterValue = canvas.getByTestId('textarea-counter-value');
    await expect(counterValue).toHaveTextContent('260');
    await expect(counter).toHaveTextContent('260/280');
    // Near limit (>= 90% of 280 = 252)
    await expect(counterValue.className).toMatch(/warning/);
  },
};

export const AutoResize: Story = {
  args: {
    label: 'Auto-resizing textarea',
    autoResize: true,
    placeholder: 'Type multiple lines to see auto-resize...',
    rows: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByTestId('textarea');
    await expect(textarea.className).toMatch(/autoResize/);
  },
};

// ============================================
// Visual Variations
// ============================================

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
      <Textarea size="sm" placeholder="Small" rows={2} />
      <Textarea size="md" placeholder="Medium" rows={3} />
      <Textarea size="lg" placeholder="Large" rows={4} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textareas = canvas.getAllByTestId('textarea');
    await expect(textareas).toHaveLength(3);
    await expect(textareas[0].className).toMatch(/sm/);
    await expect(textareas[1].className).toMatch(/md/);
    await expect(textareas[2].className).toMatch(/lg/);
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
      <Textarea variant="default" placeholder="Default" rows={3} />
      <Textarea variant="outline" placeholder="Outline" rows={3} />
      <Textarea variant="filled" placeholder="Filled" rows={3} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textareas = canvas.getAllByTestId('textarea');
    await expect(textareas).toHaveLength(3);
    await expect(textareas[0].className).toMatch(/default/);
    await expect(textareas[1].className).toMatch(/outline/);
    await expect(textareas[2].className).toMatch(/filled/);
  },
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
      <Textarea label="Comment" icon={<span>💬</span>} placeholder="Icon on the left..." rows={3} />
      <Textarea
        label="Validated"
        iconAfter={<span>✓</span>}
        success
        defaultValue="Valid input"
        rows={3}
      />
      <Textarea
        label="Both icons"
        icon={<span>🔍</span>}
        iconAfter={<span>⌘</span>}
        placeholder="Icons on both sides..."
        rows={3}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textareas = canvas.getAllByTestId('textarea');
    await expect(textareas).toHaveLength(3);

    // First textarea has left icon
    const icon1 = canvas.getAllByTestId('textarea-icon');
    await expect(icon1).toHaveLength(2); // first and third

    // Second textarea has right icon
    const iconAfter = canvas.getAllByTestId('textarea-icon-after');
    await expect(iconAfter).toHaveLength(2); // second and third
  },
};
