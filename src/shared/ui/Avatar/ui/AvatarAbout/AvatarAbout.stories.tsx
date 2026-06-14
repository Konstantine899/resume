import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarAbout } from './AvatarAbout';

const meta: Meta<typeof AvatarAbout> = {
  title: 'Shared/UI/Avatar/About',
  component: AvatarAbout,
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
        defaultValue: { summary: 'Required' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Avatar size',
      table: {
        defaultValue: { summary: "'lg'" },
      },
    },
    maxInitials: {
      control: 'number',
      description: 'Maximum number of initials to display',
      table: {
        defaultValue: { summary: '2' },
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
type Story = StoryObj<typeof AvatarAbout>;

export const Default: Story = {
  args: {
    alt: 'Avatar',
    size: 'lg',
    maxInitials: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default AvatarAbout with fallback initials.',
      },
    },
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    alt: 'User Avatar',
    size: 'lg',
    maxInitials: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'AvatarAbout with image source.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <AvatarAbout alt="SM" size="sm" maxInitials={2} />
      <AvatarAbout alt="MD" size="md" maxInitials={2} />
      <AvatarAbout alt="LG" size="lg" maxInitials={2} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All AvatarAbout sizes: sm (3rem), md (4rem), lg (6-8rem responsive).',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    alt: 'Loading...',
    size: 'lg',
    maxInitials: 2,
    showSkeleton: true,
    forceLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'AvatarAbout with skeleton loading state. Shows ripple animation while image is loading.',
      },
    },
  },
};

export const LoadingAllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <AvatarAbout alt="SM" size="sm" showSkeleton maxInitials={2} forceLoading />
      <AvatarAbout alt="MD" size="md" showSkeleton maxInitials={2} forceLoading />
      <AvatarAbout alt="LG" size="lg" showSkeleton maxInitials={2} forceLoading />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All AvatarAbout sizes with skeleton loading state.',
      },
    },
  },
};

export const WithoutSkeleton: Story = {
  args: {
    alt: 'No Skeleton',
    size: 'lg',
    maxInitials: 2,
    showSkeleton: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'AvatarAbout with skeleton disabled. Shows fallback immediately if no src.',
      },
    },
  },
};

export const Error: Story = {
  args: {
    src: 'invalid-url.jpg',
    alt: 'Error State',
    size: 'lg',
    maxInitials: 2,
    showSkeleton: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'AvatarAbout with invalid image URL. Shows fallback (initials) after image fails to load.',
      },
    },
  },
};

export const LoadingThenError: Story = {
  args: {
    src: 'invalid-url.jpg',
    alt: 'Loading Then Error',
    size: 'lg',
    maxInitials: 2,
    showSkeleton: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'AvatarAbout showing loading skeleton first, then fallback after image fails to load. Demonstrates full loading → error flow.',
      },
    },
  },
};

export const SingleInitial: Story = {
  args: {
    alt: 'Konstantin',
    size: 'lg',
    maxInitials: 1,
  },
  parameters: {
    docs: {
      description: {
        story: 'AvatarAbout with single initial (maxInitials=1).',
      },
    },
  },
};
