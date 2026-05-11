// src/shared/ui/Link/ui/Link.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Github, Mail } from 'lucide-react';
import { Link } from '../ui/Link';

const meta = {
  title: 'Shared/Link',
  component: Link,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'gradient'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    underline: {
      control: 'select',
      options: ['always', 'hover', 'never'],
    },
    href: {
      control: 'text',
    },
    external: {
      control: 'boolean',
    },
    showExternalIcon: {
      control: 'boolean',
    },
    unstyled: {
      control: 'boolean',
    },
    withLift: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Link по умолчанию */
export const Default: Story = {
  args: {
    href: '#',
    children: 'Click me',
    variant: 'primary',
    size: 'md',
  },
};

/** Разные варианты */
export const Variants: Story = {
  args: {
    href: '#',
    children: 'Link',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Link {...args} variant="primary">
        Primary Link
      </Link>
      <Link {...args} variant="secondary">
        Secondary Link
      </Link>
      <Link {...args} variant="ghost">
        Ghost Link
      </Link>
    </div>
  ),
};

/** Разные размеры */
export const Sizes: Story = {
  args: {
    href: '#',
    children: 'Link',
    variant: 'primary',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Link {...args} size="sm">
        Small Link
      </Link>
      <Link {...args} size="md">
        Medium Link
      </Link>
      <Link {...args} size="lg">
        Large Link
      </Link>
    </div>
  ),
};

/** Внешняя ссылка */
export const External: Story = {
  args: {
    href: 'https://github.com',
    children: 'GitHub',
    external: true,
  },
};

/** Ссылка с иконкой слева */
export const WithLeftIcon: Story = {
  args: {
    href: 'mailto:example@example.com',
    children: 'Send Email',
    icon: <Mail size={16} />,
  },
};

/** Ссылка с иконкой справа */
export const WithRightIcon: Story = {
  args: {
    href: '#',
    children: 'Learn More',
    iconRight: <ArrowRight size={16} />,
  },
};

/** Разные варианты подчеркивания */
export const UnderlineVariants: Story = {
  args: {
    href: '#',
    children: 'Link with underline',
    variant: 'primary',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Link {...args} underline="always">
        Always Underlined
      </Link>
      <Link {...args} underline="hover">
        Underline on Hover
      </Link>
      <Link {...args} underline="never">
        Never Underlined
      </Link>
    </div>
  ),
};

/** С кастомной внешней иконкой */
export const CustomExternalIcon: Story = {
  args: {
    href: 'https://github.com',
    children: 'GitHub Profile',
    external: true,
    externalIcon: Github,
  },
};

/** Gradient variant */
export const Gradient: Story = {
  args: {
    href: '#',
    children: 'Gradient Link',
    variant: 'gradient',
    size: 'lg',
  },
};

/** With lift effect */
export const WithLift: Story = {
  args: {
    href: '#',
    children: 'Link with Lift',
    variant: 'primary',
    withLift: true,
  },
};

/** All features combined */
export const FullyFeatured: Story = {
  args: {
    href: 'https://github.com',
    children: 'Fully Featured Link',
    variant: 'primary',
    size: 'lg',
    external: true,
    icon: <Github size={16} />,
    withLift: true,
    underline: 'hover',
  },
};

/** Internal link with onClick */
export const InternalLink: Story = {
  args: {
    href: '/about',
    children: 'Internal Link',
    variant: 'secondary',
    onClick: (e) => {
      e.preventDefault();
      // Internal navigation handler
    },
  },
};

/** Dark theme - все варианты */
export const DarkTheme: Story = {
  args: {
    href: '#',
    children: 'Link',
  },
  render: () => (
    <div style={{ background: '#292726', padding: '32px', borderRadius: '8px' }}>
      <h3 style={{ color: '#e8e6e3', marginBottom: '24px' }}>🌙 Dark Theme</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="#" variant="primary" size="lg">
            Primary
          </Link>
          <Link href="#" variant="secondary" size="lg">
            Secondary
          </Link>
          <Link href="#" variant="ghost" size="lg">
            Ghost
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="#" variant="primary" size="sm">
            Small
          </Link>
          <Link href="#" variant="primary" size="md">
            Medium
          </Link>
          <Link href="#" variant="primary" size="lg">
            Large
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="https://github.com" external>
            External
          </Link>
          <Link href="#" icon={<Mail size={16} />}>
            With Icon
          </Link>
          <Link href="#" iconRight={<ArrowRight size={16} />}>
            With Right Icon
          </Link>
        </div>
      </div>
    </div>
  ),
};

/** Light theme - все варианты */
export const LightTheme: Story = {
  args: {
    href: '#',
    children: 'Link',
  },
  render: () => (
    <div style={{ background: '#f5f3f0', padding: '32px', borderRadius: '8px' }}>
      <h3 style={{ color: '#1a1716', marginBottom: '24px' }}>☀️ Light Theme</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="#" variant="primary" size="lg">
            Primary
          </Link>
          <Link href="#" variant="secondary" size="lg">
            Secondary
          </Link>
          <Link href="#" variant="ghost" size="lg">
            Ghost
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="#" variant="primary" size="sm">
            Small
          </Link>
          <Link href="#" variant="primary" size="md">
            Medium
          </Link>
          <Link href="#" variant="primary" size="lg">
            Large
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="https://github.com" external>
            External
          </Link>
          <Link href="#" icon={<Mail size={16} />}>
            With Icon
          </Link>
          <Link href="#" iconRight={<ArrowRight size={16} />}>
            With Right Icon
          </Link>
        </div>
      </div>
    </div>
  ),
};
