import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Shared/UI/Avatar',
  component: Avatar,
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
      description: 'Alternative text for accessibility',
      table: {
        defaultValue: { summary: "'Avatar'" },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Avatar size',
      table: {
        defaultValue: { summary: "'md'" },
      },
    },
    variant: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Avatar shape',
      table: {
        defaultValue: { summary: "'circle'" },
      },
    },
    showSkeleton: {
      control: 'boolean',
      description: 'Show skeleton loading state',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    heroStyle: {
      control: 'boolean',
      description: 'Enable hero styling with gradient border',
    },
    showGlow: {
      control: 'boolean',
      description: 'Show pulsing glow effect',
    },
    showRing: {
      control: 'boolean',
      description: 'Show decorative ring',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    alt: 'Avatar',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default avatar with fallback initials.',
      },
    },
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'User Avatar',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar with image source.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Avatar alt="SM" size="sm" />
      <Avatar alt="MD" size="md" />
      <Avatar alt="LG" size="lg" />
      <Avatar alt="XL" size="xl" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All avatar sizes: sm (32px), md (48px), lg (64px), xl (96px).',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    alt: 'Loading...',
    size: 'md',
    showSkeleton: true,
    forceLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar with skeleton loading state. Shows ripple animation while image is loading.',
      },
    },
  },
};

export const LoadingAllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Avatar alt="SM" size="sm" showSkeleton forceLoading />
      <Avatar alt="MD" size="md" showSkeleton forceLoading />
      <Avatar alt="LG" size="lg" showSkeleton forceLoading />
      <Avatar alt="XL" size="xl" showSkeleton forceLoading />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All avatar sizes with skeleton loading state.',
      },
    },
  },
};

export const WithoutSkeleton: Story = {
  args: {
    alt: 'No Skeleton',
    size: 'md',
    showSkeleton: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Avatar with skeleton disabled. Shows fallback immediately if no src.',
      },
    },
  },
};

export const Error: Story = {
  args: {
    src: 'invalid-url.jpg',
    alt: 'Error State',
    size: 'md',
    showSkeleton: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Avatar with invalid image URL. Shows fallback (initials) after image fails to load.',
      },
    },
  },
};

export const LoadingThenError: Story = {
  args: {
    src: 'invalid-url.jpg',
    alt: 'Loading Then Error',
    size: 'md',
    showSkeleton: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Avatar showing loading skeleton first, then fallback after image fails to load. Demonstrates full loading → error flow.',
      },
    },
  },
};

export const HeroStyle: Story = {
  args: {
    alt: 'Hero Avatar',
    size: 'xl',
    heroStyle: true,
    showGlow: true,
    showRing: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Hero variant with gradient border, glow effect, and decorative ring.',
      },
    },
  },
};

export const SquareVariant: Story = {
  args: {
    alt: 'Square Avatar',
    size: 'md',
    variant: 'square',
    showSkeleton: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Square variant with rounded corners.',
      },
    },
  },
};
