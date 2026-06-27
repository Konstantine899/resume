import type { Meta, StoryObj } from '@storybook/react-vite';
import avatar1 from '../Avatar/assets/avatar003.jpg';
import { AvatarHero } from './AvatarHero';

const meta: Meta<typeof AvatarHero> = {
  title: 'Shared/Avatar/Hero',
  component: AvatarHero,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          { id: 'image-alt', enabled: true },
          { id: 'aria-allowed-attr', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Image URL',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for accessibility and initials',
      table: {
        defaultValue: { summary: "'Avatar'" },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Avatar size',
      table: {
        defaultValue: { summary: "'xl'" },
      },
    },
    showGlow: {
      control: 'boolean',
      description: 'Show pulsing glow effect',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    showRing: {
      control: 'boolean',
      description: 'Show decorative ring',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    showSkeleton: {
      control: 'boolean',
      description: 'Show skeleton loading state',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AvatarHero>;

export const Default: Story = {
  args: {
    alt: 'Avatar',
    size: 'xl',
    showGlow: true,
    showRing: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default AvatarHero with glow and ring effects.',
      },
    },
  },
};

export const WithImage: Story = {
  args: {
    src: avatar1,
    alt: 'Hero Avatar',
    size: 'xl',
    showGlow: true,
    showRing: true,
    showSkeleton: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'AvatarHero with image source and hero effects (gradient border, glow, ring).',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-lg, 24px)', alignItems: 'center' }}>
      <AvatarHero alt="SM" size="sm" showGlow showRing />
      <AvatarHero alt="MD" size="md" showGlow showRing />
      <AvatarHero alt="LG" size="lg" showGlow showRing />
      <AvatarHero alt="XL" size="xl" showGlow showRing />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All AvatarHero sizes: sm (3rem), md (5rem), lg (8rem), xl (14-20rem responsive).',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    alt: 'Loading...',
    size: 'xl',
    showGlow: true,
    showRing: true,
    showSkeleton: true,
    forceLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'AvatarHero with skeleton loading state. Shows ripple animation while image is loading.',
      },
    },
  },
};

export const WithoutSkeleton: Story = {
  args: {
    alt: 'No Skeleton',
    size: 'xl',
    showGlow: true,
    showRing: true,
    showSkeleton: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'AvatarHero with skeleton disabled. Shows fallback immediately if no src.',
      },
    },
  },
};

export const Error: Story = {
  args: {
    src: 'invalid-url.jpg',
    alt: 'Error State',
    size: 'xl',
    showGlow: true,
    showRing: true,
    showSkeleton: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'AvatarHero with invalid image URL. Shows fallback (initials) after image fails to load.',
      },
    },
  },
};

export const WithoutEffects: Story = {
  args: {
    alt: 'Hero without Effects',
    size: 'xl',
    showGlow: false,
    showRing: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'AvatarHero without glow and ring effects (minimal variant).',
      },
    },
  },
};
