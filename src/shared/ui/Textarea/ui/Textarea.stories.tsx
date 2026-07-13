// ============================================
// Textarea Component - Stories
// ============================================

import type { Meta, StoryObj } from '@storybook/react-vite';
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
};

export const WithLabel: Story = {
  args: {
    label: 'Message',
    placeholder: 'Write your message here...',
    rows: 5,
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
};

export const WithHelperText: Story = {
  args: {
    label: 'Biography',
    helperText: 'Tell us about yourself in a few words',
    placeholder: 'I am a...',
    rows: 4,
  },
};

export const WithSuccess: Story = {
  args: {
    label: 'Comment',
    success: true,
    defaultValue: 'Great work!',
    rows: 3,
  },
};

export const Loading: Story = {
  args: {
    label: 'Loading...',
    loading: true,
    rows: 4,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Read-only feedback',
    disabled: true,
    defaultValue: 'This field is disabled',
    rows: 3,
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
};

export const CharacterCounter: Story = {
  args: {
    label: 'Tweet',
    showCounter: true,
    maxLength: 280,
    placeholder: 'What is happening?!',
    rows: 4,
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
};

export const AutoResize: Story = {
  args: {
    label: 'Auto-resizing textarea',
    autoResize: true,
    placeholder: 'Type multiple lines to see auto-resize...',
    rows: 2,
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
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
      <Textarea variant="default" placeholder="Default" rows={3} />
      <Textarea variant="outline" placeholder="Outline" rows={3} />
      <Textarea variant="filled" placeholder="Filled" rows={3} />
    </div>
  ),
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
};
