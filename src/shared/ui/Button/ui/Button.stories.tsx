// src/shared/ui/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Mail, User } from 'lucide-react';
import { Button } from './Button';

const meta = {
  title: 'Shared/UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
    },
    rotation: {
      control: 'range',
      min: 0,
      max: 360,
      step: 45,
    },
  },
  args: {
    onClick: () => console.log('Clicked!'),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Basic Variants
// ============================================

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
    size: 'md',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
    size: 'md',
  },
};

// ============================================
// Sizes
// ============================================

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
    variant: 'primary',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium',
    size: 'md',
    variant: 'primary',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
    variant: 'primary',
  },
};

// ============================================
// Icon Buttons
// ============================================

export const IconLeft: Story = {
  args: {
    children: 'With Icon',
    icon: <User size={18} />,
    iconPosition: 'left',
    variant: 'primary',
  },
};

export const IconRight: Story = {
  args: {
    children: 'With Icon',
    icon: <ArrowRight size={18} />,
    iconPosition: 'right',
    variant: 'primary',
  },
};

export const IconOnly: Story = {
  args: {
    icon: <Mail size={20} />,
    ariaLabel: 'Send email',
    variant: 'primary',
    size: 'md',
  },
};

export const IconRotation: Story = {
  args: {
    children: 'Rotated Icon',
    icon: <ArrowRight size={18} />,
    iconPosition: 'right',
    rotation: 45,
    variant: 'primary',
  },
};

// ============================================
// States
// ============================================

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'primary',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    loading: true,
    variant: 'primary',
  },
};

// ============================================
// Special Cases
// ============================================

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
    variant: 'primary',
  },
  parameters: {
    layout: 'padded',
  },
};

// ============================================
// Combinations
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const IconButtonGallery: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Button icon={<User size={18} />} ariaLabel="User" variant="ghost" />
      <Button icon={<Mail size={18} />} ariaLabel="Email" variant="ghost" />
      <Button icon={<ArrowRight size={18} />} ariaLabel="Next" variant="ghost" />
    </div>
  ),
};
